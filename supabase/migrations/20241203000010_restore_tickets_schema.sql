-- Restore missing tickets schema (dumped from remote)

-- Create types
DO $$ BEGIN
    CREATE TYPE "public"."ticket_status" AS ENUM (
        'open',
        'completed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."ticket_type" AS ENUM (
        'question',
        'feature_request',
        'bug_report',
        'other',
        'add_edit_organisation'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create table
CREATE TABLE IF NOT EXISTS "public"."tickets" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "user_id" "uuid" NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "type" "public"."ticket_type" DEFAULT 'question'::"public"."ticket_type" NOT NULL,
    "subject" "text" NOT NULL,
    "description" "text" NOT NULL,
    "status" "public"."ticket_status" DEFAULT 'open'::"public"."ticket_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

-- RLS
ALTER TABLE "public"."tickets" ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can create tickets" ON "public"."tickets";
CREATE POLICY "Users can create tickets" ON "public"."tickets" FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own tickets" ON "public"."tickets";
CREATE POLICY "Users can view own tickets" ON "public"."tickets" FOR SELECT USING (auth.uid() = user_id);
