import { createError, readBody } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
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
    await supabase.auth.signOut({ scope: 'local' })
    throw createError({
      statusCode: 401,
      statusMessage: 'Ongeldige inloggegevens'
    })
  }

  return { success: true }
})
