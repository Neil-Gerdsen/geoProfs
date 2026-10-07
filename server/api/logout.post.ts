import { createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const { error } = await supabase.auth.signOut({ scope: 'local' })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Uitloggen is niet gelukt'
    })
  }

  return { success: true }
})