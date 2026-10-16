import { createError, readBody, getRequestIP, setResponseHeader } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

const MAX_ATTEMPTS = 5
const WINDOW_IN_SECONDS = 300 

export default defineEventHandler(async (event) => {
  const clientIp = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
  const storage = useStorage('internal:rateLimit')
  const storageKey = `login_attempts:${clientIp}`
  const now = Date.now()

  const record = (await storage.getItem<{ count: number; resetAt: number }>(storageKey)) || {
    count: 0,
    resetAt: now + WINDOW_IN_SECONDS * 1000
  }

  if (now > record.resetAt) {
    record.count = 0
    record.resetAt = now + WINDOW_IN_SECONDS * 1000
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000)
    setResponseHeader(event, 'Retry-After', retryAfter)
    
    throw createError({
      statusCode: 429,
      statusMessage: `Te veel mislukte inlogpogingen. Probeer het over ${Math.ceil(retryAfter / 60)} minuten opnieuw.`
    })
  }

  const body = await readBody(event)

  if (
    typeof body?.email !== 'string' ||
    typeof body?.password !== 'string' ||
    !body.email.trim() ||
    !body.password
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email en wachtwoord zijn verplicht'
    })
  }

  const supabase = await serverSupabaseClient(event)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email.trim(),
    password: body.password
  })

  if (error || !data.session) {
    record.count++
    await storage.setItem(storageKey, record, { ttl: WINDOW_IN_SECONDS })

    await supabase.auth.signOut({ scope: 'local' })
    throw createError({
      statusCode: 401,
      statusMessage: 'Ongeldige inloggegevens'
    })
  }

  await storage.removeItem(storageKey)

  return { success: true }
})