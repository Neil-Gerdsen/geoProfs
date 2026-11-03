import { defineEventHandler, createError, readBody } from 'h3';
import { serverSupabaseServiceRole } from '#supabase/server';

export default defineEventHandler(async (event) => {

    if (event.req.method !== 'GET') {
        return;
    }

    const supabase = serverSupabaseServiceRole(event);

    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        });
    }

    return data.users;
});