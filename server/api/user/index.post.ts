import { defineEventHandler, createError, readBody } from 'h3';
import { serverSupabaseServiceRole } from '#supabase/server';

export default defineEventHandler(async (event) => {

    console.log('API 1. Endpoint bereikt');

    try {
        const body = await readBody<{
            username?: string;
            email?: string;
            password?: string;
        }>(event);

        console.log('API 2. Body ontvangen');

        const { username, email, password } = body;

        if (!username || !email || !password) {
            console.log('API 3. Verplichte gegevens ontbreken');

            throw createError({
                statusCode: 400,
                statusMessage: 'Username, password and email are required'
            });
        }

        console.log('API 3. Gegevens gecontroleerd');

        const supabase = serverSupabaseServiceRole(event);

        console.log('API 4. Supabase client aangemaakt');

        const { data, error } = await supabase.auth.admin.createUser({
            email: email.trim(),
            password: password,
            user_metadata: {
                username
            }
        });

        console.log('API 5. Supabase createUser uitgevoerd');

        if (error) {
            console.error('Supabase fout:', error.message);

            throw createError({
                statusCode: 400,
                statusMessage: error.message
            });
        }

        console.log('API 6. Gebruiker succesvol aangemaakt');

        return {
            message: 'User successfully created',
            user: data.user
        };

    } catch (error: any) {
        console.error('API ERROR:', error);

        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Something went wrong'
        });
    }
});
