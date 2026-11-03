import { defineEventHandler, createError, getRouterParam } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'User ID ontbreekt'
        })
    }

    const supabase = serverSupabaseServiceRole(event)

    try {
        const { data, error } = await supabase.auth.admin.deleteUser(id)

        if (error) {
            throw error
        }

        return {
            success: true,
            message: 'Gebruiker verwijderd'
        }

    } catch (err) {
        console.error('ERROR:', err)

        throw createError({
            statusCode: 500,
            statusMessage: 'Gebruiker verwijderen mislukt'
        })
    }
})