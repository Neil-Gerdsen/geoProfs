import { serverSupabaseClient } from '#supabase/server'

// Koppelt een user aan een rol: POST /api/roles/link  { userId, roleId }
export default defineEventHandler(async event => {
    const { userId, roleId } = await readBody(event)

    if (typeof userId !== 'string' || !roleId) {
        throw createError({ statusCode: 400, statusMessage: 'userId en roleId zijn verplicht' })
    }

    const client = await serverSupabaseClient(event)

    const { data, error } = await client
        .from('user_link')
        .insert({ user_id: userId, role_id: roleId })
        .select('id, user_id, roles(name)')
        .single()

    if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return data
})
