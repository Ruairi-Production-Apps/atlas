import { createClient } from './server'

export async function checkDatabaseHealth() {
    const supabase = await createClient()

    // Check if core tables exist by probing for them
    const { error: settingsError } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .maybeSingle()

    const { error: groupsError } = await supabase
        .from('groups')
        .select('id')
        .limit(1)
        .maybeSingle()

    const isInitialized = !settingsError && !groupsError

    return {
        isInitialized,
        errors: {
            site_settings: settingsError?.message,
            groups: groupsError?.message
        }
    }
}

/**
 * Attempts to initialize the core database schema.
 * Note: This requires a Supabase function named 'exec_sql' to be present
 * or the service_role key to be configured if using a custom backend.
 * For true autonomous deployment, the user should provide the service role key
 * in the environment variables.
 */
export async function initializeDatabaseSchema() {
    const supabase = await createClient()

    // Most essential tables for startup
    const bootstrapSql = `
        DO $$ 
        BEGIN
            -- 1. Enums
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scope_type') THEN
                CREATE TYPE scope_type AS ENUM ('province', 'county', 'group', 'section', 'adventure_team');
            END IF;

            -- 2. Tables
            CREATE TABLE IF NOT EXISTS site_settings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                scope_type scope_type NOT NULL,
                scope_id UUID NOT NULL,
                site_title TEXT,
                primary_color TEXT DEFAULT '#005596',
                logo_url TEXT,
                homepage_config JSONB DEFAULT '{}'::jsonb,
                sync_enabled BOOLEAN DEFAULT FALSE,
                is_initialized BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE(scope_type, scope_id)
            );

            CREATE TABLE IF NOT EXISTS groups (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                county_id UUID,
                description TEXT,
                logo_url TEXT,
                site_title TEXT,
                primary_color TEXT,
                homepage_config JSONB,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ
            );

            -- Add more core tables as needed...
        END $$;
    `;

    // Try to execute via RPC if the user has set up the exec_sql function
    // This is a common pattern for "Automated Migration" in Supabase-app templates
    const { error } = await supabase.rpc('exec_sql', { sql: bootstrapSql })

    if (error) {
        console.error('Schema Initialization Error:', error)
        throw new Error(`
            Database initialization failed because the 'exec_sql' function is missing. 
            
            Please go to your Supabase Dashboard -> SQL Editor and run this one-time bootstrap script:
            
            CREATE OR REPLACE FUNCTION exec_sql(sql text)
            RETURNS void
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              EXECUTE sql;
            END;
            $$;
        `)
    }

    return { success: true }
}
