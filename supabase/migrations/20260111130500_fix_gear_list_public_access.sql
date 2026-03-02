-- 1. Grant permissions to anon/public for joined tables
GRANT SELECT ON profiles TO anon, authenticated;
GRANT SELECT ON events TO anon, authenticated;

-- 2. Ensure RLS policies exist to allow public reading of these tables (restricted scope)
-- Profiles: Public can view basic info. 
-- Note: You might already have policies. We add one just in case using IF NOT EXISTS logic via a generic policy name convention or just attempting it.
-- PostgREST needs the policy to allow the select.

-- 2. Ensure RLS policies exist to allow public reading of these tables (restricted scope)

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Public events are viewable by everyone" ON events;
CREATE POLICY "Public events are viewable by everyone" 
ON events FOR SELECT 
USING (true);

-- 3. Fix Foreign Key for PostgREST embedding
-- Change gear_lists.author_id to reference public.profiles instead of auth.users
ALTER TABLE gear_lists
    DROP CONSTRAINT IF EXISTS gear_lists_author_id_fkey;

ALTER TABLE gear_lists
    ADD CONSTRAINT gear_lists_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;

-- 4. Grant access to other related tables
GRANT SELECT ON groups TO anon, authenticated;
GRANT SELECT ON counties TO anon, authenticated;
GRANT SELECT ON provinces TO anon, authenticated;

-- Policies for org tables to allow public read
DROP POLICY IF EXISTS "Public groups are viewable by everyone" ON groups;
CREATE POLICY "Public groups are viewable by everyone" ON groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public counties are viewable by everyone" ON counties;
CREATE POLICY "Public counties are viewable by everyone" ON counties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public provinces are viewable by everyone" ON provinces;
CREATE POLICY "Public provinces are viewable by everyone" ON provinces FOR SELECT USING (true);
