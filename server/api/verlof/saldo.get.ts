import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Niet ingelogd' })
    }

    const client = await serverSupabaseClient(event)
    const { data, error } = await client
        .from('verlof_test')
        .select('verlof_dagen')
        .eq('id', user.id ?? user.sub)
        .maybeSingle()

    if (error) {
        console.error(error)
        throw createError({ statusCode: 500, statusMessage: 'Ophalen mislukt' })
    }
    return data
})
