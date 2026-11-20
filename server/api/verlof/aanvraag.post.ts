import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {

    const user = await serverSupabaseUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Niet ingelogd' })
    }

    const { start_datum, eind_datum, reden } = await readBody(event)

    if (!start_datum || !eind_datum || !reden?.trim()) {
        throw createError({ statusCode: 400, statusMessage: 'Vul alle velden in' })
    }

    const datumRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!datumRegex.test(start_datum) || !datumRegex.test(eind_datum)) {
        throw createError({ statusCode: 400, statusMessage: 'Ongeldige datum' })
    }

    if (eind_datum < start_datum) {
        throw createError({ statusCode: 400, statusMessage: 'Einddatum ligt voor startdatum' })
    }

    const vandaag = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Amsterdam' })
    if (start_datum < vandaag) {
        throw createError({ statusCode: 400, statusMessage: 'De startdatum kan niet in het verleden liggen' })
    }

    if (reden.trim().length > 1000) {
        throw createError({ statusCode: 400, statusMessage: 'Reden is te lang (max 1000 tekens)' })
    }

    const client = await serverSupabaseClient(event)
    const { error } = await client.from('verlofaanvragen').insert({
        user_id: user.id ?? user.sub,
        start_datum,
        eind_datum,
        reden: reden.trim(),
        status: 'aangevraagd'
    })

    if (error) {
        if (error.code === '23P01') {
            throw createError({ statusCode: 409, statusMessage: 'Je hebt in deze periode al verlof aangevraagd' })
        }
        if (error.code === 'P0001') {
            throw createError({ statusCode: 400, statusMessage: error.message })
        }
        console.error(error)
        throw createError({ statusCode: 500, statusMessage: 'Opslaan mislukt' })
    }
    return { ok: true }
})