import { getRequestURL, sendRedirect } from 'h3'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname

  if (pathname !== '/' && pathname !== '/login') {
    return
  }

  const user = await serverSupabaseUser(event)

  if (pathname === '/' && !user) {
    return sendRedirect(event, '/login')
  }

  if (pathname === '/login' && user) {
    return sendRedirect(event, '/')
  }
})