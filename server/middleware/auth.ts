import { getRequestURL, sendRedirect } from 'h3'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  if (getRequestURL(event).pathname !== '/') {
    return
  }

  const user = await serverSupabaseUser(event)

  if (!user) {
    return sendRedirect(event, '/login')
  }
})