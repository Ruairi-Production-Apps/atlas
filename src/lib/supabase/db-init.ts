import { createClient } from './server'

export async function checkDatabaseHealth() {
    const supabase = await createClient()

    // 1. Check if ALL core tables exist
    const { error: settingsError, data: settingsData } = await supabase
        .from('site_settings')
        .select('is_initialized')
        .limit(1)
        .maybeSingle()

    const { error: groupsError } = await supabase
        .from('groups')
        .select('id')
        .limit(1)
        .maybeSingle()

    const { error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .maybeSingle()

    const { error: rolesError } = await supabase
        .from('user_roles')
        .select('id')
        .limit(1)
        .maybeSingle()

    // Tables exist? Must have NO errors for any of the core tables
    // "Could not find table" error messages usually contain "42P01" or the text "does not exist"
    const tablesExist = !settingsError && !groupsError && !profilesError && !rolesError

    // Instance fully set up?
    const isFullyInitialized = settingsData?.is_initialized === true

    return {
        tablesExist,
        isFullyInitialized,
        errors: {
            site_settings: settingsError?.message,
            groups: groupsError?.message,
            profiles: profilesError?.message,
            user_roles: rolesError?.message
        }
    }
}

/**
 * DANGER: Drops all core tables to allow a clean re-initialization.
 * Only works if the 'exec_sql' function exists.
 */
export async function resetDatabaseSchema() {
    const supabase = await createClient()
    const resetSql = `
        DROP TABLE IF EXISTS site_settings CASCADE;
        DROP TABLE IF EXISTS groups CASCADE;
        DROP TABLE IF EXISTS profiles CASCADE;
        DROP TABLE IF EXISTS user_roles CASCADE;
        DROP TYPE IF EXISTS scope_type CASCADE;
        DROP TYPE IF EXISTS user_role CASCADE;
        DROP TYPE IF EXISTS section_type CASCADE;
        DROP TYPE IF EXISTS event_visibility CASCADE;
        
        -- Force cache reload
        NOTIFY pgrst, 'reload schema';
    `;

    return await supabase.rpc('exec_sql', { sql: resetSql })
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

    // Most essential tables and enums for startup
    const bootstrapSql = `
        -- 1. Extensions
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        DO $$ 
        BEGIN
            -- 2. Enums
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scope_type') THEN
                CREATE TYPE scope_type AS ENUM ('system', 'province', 'county', 'group', 'section', 'adventure_team');
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
                CREATE TYPE user_role AS ENUM ('sysadmin', 'provincial_admin', 'county_admin', 'group_leader', 'section_leader');
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'section_type') THEN
                CREATE TYPE section_type AS ENUM ('beavers', 'cubs', 'scouts', 'ventures', 'rovers');
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_visibility') THEN
                CREATE TYPE event_visibility AS ENUM ('open_to_all', 'sections_only', 'scouters_only');
            END IF;

            -- 3. Utility Functions
            CREATE OR REPLACE FUNCTION trigger_set_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
              NEW.updated_at = NOW();
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            -- 4. Tables
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

            CREATE TABLE IF NOT EXISTS profiles (
                id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
                email TEXT,
                full_name TEXT,
                avatar_url TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS user_roles (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
                role user_role NOT NULL,
                scope_type scope_type NOT NULL,
                scope_id UUID,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE(user_id, role, scope_type, scope_id)
            );

            -- 5. Triggers
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_site_settings_updated_at') THEN
                CREATE TRIGGER set_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_groups_updated_at') THEN
                CREATE TRIGGER set_groups_updated_at BEFORE UPDATE ON groups FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_profiles_updated_at') THEN
                CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_user_roles_updated_at') THEN
                CREATE TRIGGER set_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
            END IF;

            -- 6. RLS Policies
            ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
            ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
            ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
            ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

            DROP POLICY IF EXISTS "Allow public read access to site settings" ON site_settings;
            CREATE POLICY "Allow public read access to site settings" ON site_settings FOR SELECT USING (true);

            DROP POLICY IF EXISTS "Allow public read access to groups" ON groups;
            CREATE POLICY "Allow public read access to groups" ON groups FOR SELECT USING (true);

        END $$;
        
        -- Force a PostgREST schema reload so we don't get "table not found in cache" errors immediately
        NOTIFY pgrst, 'reload schema';
    `;

    // Try to execute via RPC if the user has set up the exec_sql function
    const { error } = await supabase.rpc('exec_sql', { sql: bootstrapSql })

    if (error) {
        console.error('Schema Initialization Error:', error)
        throw new Error(`
            Database initialization failed because the 'exec_sql' function is missing or errored. 
            
            Error: ${error.message}
            
            Please go to your Supabase Dashboard -> SQL Editor and run this bootstrap script manually:
            
            ${bootstrapSql}
        `)
    }

    return { success: true }
}
