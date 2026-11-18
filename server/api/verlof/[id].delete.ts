import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Niet ingelogd' })
    }

    const id = Number(getRouterParam(event, 'id'))
    if (!Number.isInteger(id)) {
        throw createError({ statusCode: 400, statusMessage: 'Ongeldig ID' })
    }

    const client = await serverSupabaseClient(event)
    const {data, error} = await client
        .from('verlofaanvragen')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id ?? user.sub)   // alleen je eigen data
        .eq('status', 'aangevraagd')
        .select('id')

    if (error) {
        console.error(error)
        throw createError({ statusCode: 500, statusMessage: 'Verwijderen mislukt' })
    }

    if (!data?.length) {
        throw createError({ statusCode: 403, statusMessage: 'Alleen open aanvragen kunnen worden verwijderd' })
    }

    return { ok: true }
})