import { createClient } from '@supabase/supabase-js'
import { readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const supabase = createClient(

        config.supabaseUrl,
        config.supabaseKey
    )
    const body = await  readBody(event)
    const { email, password } = body

      if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email en wachtwoord zijn verplicht'
    })
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Ongeldige inloggegevens'
    })
  }

  return {
    success: true,
    user: data.user,
    session: data.session
  }


})
