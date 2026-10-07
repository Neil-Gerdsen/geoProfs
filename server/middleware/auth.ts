import { getRequestURL, sendRedirect } from 'h3'
import { serverSupabaseUser } from '#supabase/server'

const protectedPaths = new Set(['/', '/dashboard'])

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname

  if (!protectedPaths.has(pathname) && pathname !== '/login') {
    return
  }

  const user = await serverSupabaseUser(event)

  if (protectedPaths.has(pathname) && !user) {
    return sendRedirect(event, '/login')
  }

  if (pathname === '/login' && user) {
    return sendRedirect(event, '/')
  }
})