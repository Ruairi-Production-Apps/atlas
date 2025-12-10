-- Add FK for author profile join to enable Supabase joins
-- We perform this safe alteration to allow the client to join knowledgebase_articles with profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_kb_author_profile'
    ) THEN
        ALTER TABLE knowledgebase_articles
        ADD CONSTRAINT fk_kb_author_profile
        FOREIGN KEY (author_id)
        REFERENCES profiles(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- Create Adventure Skills Enum
-- We use DO block to prevent error if type exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'adventure_skill_type') THEN
        CREATE TYPE adventure_skill_type AS ENUM (
            'Camping',
            'Emergencies',
            'Hillwalking',
            'Backwoods',
            'Pioneering',
            'Rowing',
            'Paddling',
            'Air',
            'Sailing'
        );
    END IF;
END $$;

-- Add adventure_skill column to knowledgebase_articles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'knowledgebase_articles'
        AND column_name = 'adventure_skill'
    ) THEN
        ALTER TABLE knowledgebase_articles
        ADD COLUMN adventure_skill adventure_skill_type;
    END IF;
END $$;
