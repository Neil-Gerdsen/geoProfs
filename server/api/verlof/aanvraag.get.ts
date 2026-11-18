import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Niet ingelogd' })
    }

    const client = await serverSupabaseClient(event)
    const { data, error } = await client
        .from('verlofaanvragen')
        .select('id, start_datum, eind_datum, reden, status')
        .eq('user_id', user.id ?? user.sub)   // alleen je eigen data

    if (error) {
        console.error(error)
        throw createError({ statusCode: 500, statusMessage: 'Ophalen mislukt' })
    }
    return data
})