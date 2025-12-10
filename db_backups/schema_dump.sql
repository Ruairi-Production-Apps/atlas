


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."adventure_skill_type" AS ENUM (
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


ALTER TYPE "public"."adventure_skill_type" OWNER TO "postgres";


CREATE TYPE "public"."event_pricing_mode" AS ENUM (
    'per_group',
    'per_scout',
    'per_person_type'
);


ALTER TYPE "public"."event_pricing_mode" OWNER TO "postgres";


CREATE TYPE "public"."event_visibility" AS ENUM (
    'open_to_all',
    'sections_only',
    'scouters_only'
);


ALTER TYPE "public"."event_visibility" OWNER TO "postgres";


CREATE TYPE "public"."fulfillment_status" AS ENUM (
    'unfulfilled',
    'shipped',
    'returned'
);


ALTER TYPE "public"."fulfillment_status" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."scope_type" AS ENUM (
    'system',
    'province',
    'county',
    'group',
    'section',
    'adventure_team',
    'sitewide'
);


ALTER TYPE "public"."scope_type" OWNER TO "postgres";


CREATE TYPE "public"."section_type" AS ENUM (
    'beavers',
    'cubs',
    'scouts',
    'ventures',
    'rovers'
);


ALTER TYPE "public"."section_type" OWNER TO "postgres";


CREATE TYPE "public"."ticket_status" AS ENUM (
    'open',
    'completed'
);


ALTER TYPE "public"."ticket_status" OWNER TO "postgres";


CREATE TYPE "public"."ticket_type" AS ENUM (
    'question',
    'feature_request',
    'bug_report',
    'other',
    'add_edit_organisation'
);


ALTER TYPE "public"."ticket_type" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'sysadmin',
    'provincial_admin',
    'county_admin',
    'group_leader',
    'section_leader',
    'team_admin',
    'scouter'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_promote_admin_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Check if this is the admin email and no sysadmin exists yet
    IF NEW.email = 'admin@scout-hub.local' THEN
        -- Check if a sysadmin already exists
        IF NOT EXISTS (
            SELECT 1 FROM user_roles WHERE role = 'sysadmin'
        ) THEN
            -- Insert sysadmin role
            -- This runs as SECURITY DEFINER so should bypass RLS
            INSERT INTO user_roles (user_id, role, scope_type, scope_id)
            VALUES (NEW.id, 'sysadmin', 'system', NULL)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_promote_admin_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_manage_scope"("user_id" "uuid", "check_scope_type" "public"."scope_type", "check_scope_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
DECLARE
  province_id UUID;
  county_id UUID;
  group_id UUID;
BEGIN
  -- SysAdmin has access to everything, including sitewide
  IF is_sysadmin(user_id) THEN
    RETURN true;
  END IF;

  -- Sitewide content can only be managed by sysadmins (covered above) or explicit checking if we want others later
  IF check_scope_type = 'sitewide' THEN
    RETURN is_sysadmin(user_id);
  END IF;

  -- Check direct scope match
  IF EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = $1
    AND user_roles.scope_type = $2
    AND user_roles.scope_id = $3
  ) THEN
    RETURN true;
  END IF;

  -- Check hierarchical permissions
  CASE check_scope_type
    WHEN 'section' THEN
      -- Get group_id from section
      SELECT s.group_id INTO group_id FROM sections s WHERE s.id = check_scope_id;
      IF has_role_for_scope(user_id, 'group_leader', 'group', group_id) THEN
        RETURN true;
      END IF;
      -- Continue to check county and province
      SELECT g.county_id INTO county_id FROM groups g WHERE g.id = group_id;
      IF has_role_for_scope(user_id, 'county_admin', 'county', county_id) THEN
        RETURN true;
      END IF;
      SELECT c.province_id INTO province_id FROM counties c WHERE c.id = county_id;
      IF has_role_for_scope(user_id, 'provincial_admin', 'province', province_id) THEN
        RETURN true;
      END IF;
    
    WHEN 'group' THEN
      SELECT g.county_id INTO county_id FROM groups g WHERE g.id = check_scope_id;
      IF has_role_for_scope(user_id, 'county_admin', 'county', county_id) THEN
        RETURN true;
      END IF;
      SELECT c.province_id INTO province_id FROM counties c WHERE c.id = county_id;
      IF has_role_for_scope(user_id, 'provincial_admin', 'province', province_id) THEN
        RETURN true;
      END IF;
    
    WHEN 'county' THEN
      SELECT c.province_id INTO province_id FROM counties c WHERE c.id = check_scope_id;
      IF has_role_for_scope(user_id, 'provincial_admin', 'province', province_id) THEN
        RETURN true;
      END IF;
    
    ELSE
      -- Province level - only provincial admin or sysadmin
      NULL;
  END CASE;

  RETURN false;
END;
$_$;


ALTER FUNCTION "public"."can_manage_scope"("user_id" "uuid", "check_scope_type" "public"."scope_type", "check_scope_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."extract_tags_from_content"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  tag TEXT;
BEGIN
  IF NEW.tags IS NOT NULL THEN
    FOREACH tag IN ARRAY NEW.tags
    LOOP
      INSERT INTO tags (name) VALUES (tag)
      ON CONFLICT (name) DO NOTHING;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."extract_tags_from_content"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_slug"("text_input" "text") RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(text_input, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$;


ALTER FUNCTION "public"."generate_slug"("text_input" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  first_name_val TEXT;
  last_name_val TEXT;
  full_name_val TEXT;
BEGIN
  first_name_val := NEW.raw_user_meta_data->>'first_name';
  last_name_val := NEW.raw_user_meta_data->>'last_name';
  full_name_val := NEW.raw_user_meta_data->>'full_name';

  -- Fallback if first/last are missing but full_name exists (e.g. legacy or OAuth)
  IF first_name_val IS NULL AND last_name_val IS NULL AND full_name_val IS NOT NULL THEN
     first_name_val := split_part(full_name_val, ' ', 1);
     last_name_val := trim(substring(full_name_val from length(first_name_val) + 1));
     
     IF last_name_val = '' THEN
        last_name_val := NULL;
     END IF;
  END IF;

  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(first_name_val, ''), 
    COALESCE(last_name_val, '')
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role_for_scope"("user_id" "uuid", "required_role" "public"."user_role", "check_scope_type" "public"."scope_type", "check_scope_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = $1
    AND user_roles.role = $2
    AND user_roles.scope_type = $3
    AND user_roles.scope_id = $4
  );
END;
$_$;


ALTER FUNCTION "public"."has_role_for_scope"("user_id" "uuid", "required_role" "public"."user_role", "check_scope_type" "public"."scope_type", "check_scope_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_sysadmin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = $1
    AND role = 'sysadmin'
  );
END;
$_$;


ALTER FUNCTION "public"."is_sysadmin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_content_slug_from_title"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title || '-' || substring(NEW.id::text from 1 for 8));
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_content_slug_from_title"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_published_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.published = true AND OLD.published = false THEN
    NEW.published_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_published_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_slug_from_name"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_slug_from_name"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_modified_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."adventure_teams" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "logo_url" "text",
    "website" "text",
    "email" "text",
    "facebook_url" "text",
    "instagram_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "long_description" "text",
    "stripe_account_id" "text",
    "stripe_charges_enabled" boolean DEFAULT false,
    "stripe_details_submitted" boolean DEFAULT false
);


ALTER TABLE "public"."adventure_teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."counties" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "province_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "logo_url" "text",
    "website" "text",
    "email" "text",
    "facebook_url" "text",
    "instagram_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "long_description" "text",
    "iban" "text",
    "bic" "text",
    "account_name" "text",
    "stripe_account_id" "text",
    "stripe_charges_enabled" boolean DEFAULT false,
    "stripe_details_submitted" boolean DEFAULT false
);


ALTER TABLE "public"."counties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_forms" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "form_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "button_text" "text" DEFAULT 'Register Now'::"text",
    "description" "text",
    CONSTRAINT "event_forms_form_type_check" CHECK (("form_type" = ANY (ARRAY['expression_of_interest'::"text", 'registration'::"text"])))
);


ALTER TABLE "public"."event_forms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_sections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "section_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."event_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "featured_image_url" "text",
    "body" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone,
    "location" "text",
    "price" numeric(10,2),
    "capacity_groups" integer,
    "capacity_scouters" integer,
    "capacity_youth" integer,
    "scope_type" "public"."scope_type" NOT NULL,
    "scope_id" "uuid" NOT NULL,
    "visibility" "public"."event_visibility" DEFAULT 'open_to_all'::"public"."event_visibility" NOT NULL,
    "pricing_mode" "public"."event_pricing_mode" DEFAULT 'per_scout'::"public"."event_pricing_mode",
    "price_scouter" numeric(10,2),
    "price_youth" numeric(10,2),
    "require_participant_info" boolean DEFAULT false NOT NULL,
    "require_payment" boolean DEFAULT false NOT NULL,
    "author_id" "uuid" NOT NULL,
    "published" boolean DEFAULT false NOT NULL,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "payment_method" "text",
    "selected_section_types" "text"[] DEFAULT '{}'::"text"[]
);


ALTER TABLE "public"."events" OWNER TO "postgres";


COMMENT ON COLUMN "public"."events"."payment_method" IS 'Payment method: offline, bank_payment, or stripe';



COMMENT ON COLUMN "public"."events"."selected_section_types" IS 'Array of section types (beavers, cubs, scouts, ventures, rovers) when visibility is sections_only';



CREATE TABLE IF NOT EXISTS "public"."form_fields" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "form_id" "uuid" NOT NULL,
    "field_type" "text" NOT NULL,
    "label" "text" NOT NULL,
    "required" boolean DEFAULT false NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "options" "jsonb",
    "participants_config" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "form_fields_field_type_check" CHECK (("field_type" = ANY (ARRAY['short_text'::"text", 'long_text'::"text", 'select'::"text", 'multi_select'::"text", 'radio'::"text", 'group'::"text", 'participants'::"text"])))
);


ALTER TABLE "public"."form_fields" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_submission_data" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "submission_id" "uuid" NOT NULL,
    "field_id" "uuid" NOT NULL,
    "field_value" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."form_submission_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."form_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "form_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "submission_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "payment_status" "public"."payment_status",
    "payment_amount" numeric(10,2) DEFAULT NULL::numeric,
    "stripe_session_id" "text",
    "stripe_payment_intent_id" "text"
);


ALTER TABLE "public"."form_submissions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."form_submissions"."payment_status" IS 'Status of payment for this submission';



COMMENT ON COLUMN "public"."form_submissions"."payment_amount" IS 'Amount paid in euros';



COMMENT ON COLUMN "public"."form_submissions"."stripe_session_id" IS 'Stripe Checkout Session ID';



COMMENT ON COLUMN "public"."form_submissions"."stripe_payment_intent_id" IS 'Stripe Payment Intent ID';



CREATE TABLE IF NOT EXISTS "public"."groups" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "county_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "logo_url" "text",
    "website" "text",
    "email" "text",
    "facebook_url" "text",
    "instagram_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "long_description" "text",
    "iban" "text",
    "bic" "text",
    "account_name" "text",
    "stripe_account_id" "text",
    "stripe_charges_enabled" boolean DEFAULT false,
    "stripe_details_submitted" boolean DEFAULT false
);


ALTER TABLE "public"."groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledgebase_article_sections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "article_id" "uuid" NOT NULL,
    "section_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."knowledgebase_article_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledgebase_articles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "body" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "scope_type" "public"."scope_type" NOT NULL,
    "scope_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "published" boolean DEFAULT false NOT NULL,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "description" "text",
    "section_types" "text"[] DEFAULT '{}'::"text"[],
    "adventure_skill" "public"."adventure_skill_type",
    "featured_image_url" "text"
);


ALTER TABLE "public"."knowledgebase_articles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."knowledgebase_articles"."description" IS 'Short description/summary of the article shown in lists';



CREATE TABLE IF NOT EXISTS "public"."knowledgebase_files" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "article_id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_size" bigint,
    "mime_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_embedded" boolean DEFAULT false,
    "file_path" "text"
);


ALTER TABLE "public"."knowledgebase_files" OWNER TO "postgres";


COMMENT ON TABLE "public"."knowledgebase_files" IS 'Files associated with knowledgebase articles';



CREATE TABLE IF NOT EXISTS "public"."news_posts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "featured_image_url" "text",
    "body" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "scope_type" "public"."scope_type" NOT NULL,
    "scope_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "published" boolean DEFAULT false NOT NULL,
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "description" "text"
);


ALTER TABLE "public"."news_posts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_contacts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "organization_type" "public"."scope_type" NOT NULL,
    "name" "text" NOT NULL,
    "title" "text" NOT NULL,
    "email" "text",
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "organization_contacts_organization_type_check" CHECK (("organization_type" = ANY (ARRAY['province'::"public"."scope_type", 'county'::"public"."scope_type", 'group'::"public"."scope_type"])))
);


ALTER TABLE "public"."organization_contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_type" "public"."scope_type" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "can_manage_news" boolean DEFAULT false NOT NULL,
    "can_manage_events" boolean DEFAULT false NOT NULL,
    "can_edit_details" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."organization_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "first_name" "text",
    "last_name" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."provinces" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "logo_url" "text",
    "website" "text",
    "email" "text",
    "facebook_url" "text",
    "instagram_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "long_description" "text",
    "iban" "text",
    "bic" "text",
    "account_name" "text",
    "stripe_account_id" "text",
    "stripe_charges_enabled" boolean DEFAULT false,
    "stripe_details_submitted" boolean DEFAULT false
);


ALTER TABLE "public"."provinces" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sections" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "section_type" "public"."section_type" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."store_order_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "total_price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "store_order_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."store_order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."store_orders" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "scope_type" "text" NOT NULL,
    "scope_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "customer_email" "text" NOT NULL,
    "customer_name" "text",
    "customer_phone" "text",
    "total_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "stripe_session_id" "text",
    "stripe_payment_intent_id" "text",
    "status" "public"."payment_status" DEFAULT 'pending'::"public"."payment_status",
    "shipping_details" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "fulfillment_status" "public"."fulfillment_status" DEFAULT 'unfulfilled'::"public"."fulfillment_status" NOT NULL,
    "shipped_at" timestamp with time zone,
    CONSTRAINT "store_orders_scope_type_check" CHECK (("scope_type" = ANY (ARRAY['province'::"text", 'county'::"text", 'group'::"text"])))
);


ALTER TABLE "public"."store_orders" OWNER TO "postgres";


COMMENT ON COLUMN "public"."store_orders"."fulfillment_status" IS 'Shipping status of the order';



CREATE TABLE IF NOT EXISTS "public"."store_products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "scope_type" "text" NOT NULL,
    "scope_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "short_description" "text",
    "description" "text",
    "price" numeric(10,2) DEFAULT 0 NOT NULL,
    "quantity" integer,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "available_from" timestamp with time zone,
    "available_to" timestamp with time zone,
    "shipping_enabled" boolean DEFAULT false,
    "shipping_mode" "text",
    "shipping_cost" numeric(10,2) DEFAULT 0,
    "published" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "image_url" "text",
    CONSTRAINT "store_products_scope_type_check" CHECK (("scope_type" = ANY (ARRAY['province'::"text", 'county'::"text", 'group'::"text"]))),
    CONSTRAINT "store_products_shipping_mode_check" CHECK (("shipping_mode" = ANY (ARRAY['flat_rate'::"text", 'per_item'::"text"])))
);


ALTER TABLE "public"."store_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ticket_attachments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "ticket_id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_size" bigint,
    "mime_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ticket_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ticket_replies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ticket_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ticket_replies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "public"."ticket_type" DEFAULT 'question'::"public"."ticket_type" NOT NULL,
    "subject" "text" NOT NULL,
    "description" "text" NOT NULL,
    "status" "public"."ticket_status" DEFAULT 'open'::"public"."ticket_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tickets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."user_role" NOT NULL,
    "scope_type" "public"."scope_type" NOT NULL,
    "scope_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "permissions" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."adventure_teams"
    ADD CONSTRAINT "adventure_teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."adventure_teams"
    ADD CONSTRAINT "adventure_teams_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."counties"
    ADD CONSTRAINT "counties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."counties"
    ADD CONSTRAINT "counties_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."event_forms"
    ADD CONSTRAINT "event_forms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_sections"
    ADD CONSTRAINT "event_sections_event_id_section_id_key" UNIQUE ("event_id", "section_id");



ALTER TABLE ONLY "public"."event_sections"
    ADD CONSTRAINT "event_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_fields"
    ADD CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_submission_data"
    ADD CONSTRAINT "form_submission_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."form_submissions"
    ADD CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."knowledgebase_article_sections"
    ADD CONSTRAINT "knowledgebase_article_sections_article_id_section_id_key" UNIQUE ("article_id", "section_id");



ALTER TABLE ONLY "public"."knowledgebase_article_sections"
    ADD CONSTRAINT "knowledgebase_article_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledgebase_articles"
    ADD CONSTRAINT "knowledgebase_articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledgebase_files"
    ADD CONSTRAINT "knowledgebase_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news_posts"
    ADD CONSTRAINT "news_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_contacts"
    ADD CONSTRAINT "organization_contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_user_id_organization_type_organization_key" UNIQUE ("user_id", "organization_type", "organization_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."provinces"
    ADD CONSTRAINT "provinces_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."provinces"
    ADD CONSTRAINT "provinces_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."store_order_items"
    ADD CONSTRAINT "store_order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."store_orders"
    ADD CONSTRAINT "store_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."store_products"
    ADD CONSTRAINT "store_products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ticket_attachments"
    ADD CONSTRAINT "ticket_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ticket_replies"
    ADD CONSTRAINT "ticket_replies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_scope_type_scope_id_key" UNIQUE ("user_id", "role", "scope_type", "scope_id");



CREATE INDEX "idx_adventure_teams_slug" ON "public"."adventure_teams" USING "btree" ("slug");



CREATE INDEX "idx_counties_deleted_at" ON "public"."counties" USING "btree" ("deleted_at");



CREATE INDEX "idx_counties_province_id" ON "public"."counties" USING "btree" ("province_id");



CREATE INDEX "idx_counties_slug" ON "public"."counties" USING "btree" ("slug");



CREATE INDEX "idx_event_forms_enabled" ON "public"."event_forms" USING "btree" ("enabled");



CREATE INDEX "idx_event_forms_event_id" ON "public"."event_forms" USING "btree" ("event_id");



CREATE INDEX "idx_event_sections_event_id" ON "public"."event_sections" USING "btree" ("event_id");



CREATE INDEX "idx_event_sections_section_id" ON "public"."event_sections" USING "btree" ("section_id");



CREATE INDEX "idx_events_author" ON "public"."events" USING "btree" ("author_id");



CREATE INDEX "idx_events_dates" ON "public"."events" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_events_deleted_at" ON "public"."events" USING "btree" ("deleted_at");



CREATE INDEX "idx_events_published" ON "public"."events" USING "btree" ("published", "published_at" DESC);



CREATE INDEX "idx_events_scope" ON "public"."events" USING "btree" ("scope_type", "scope_id");



CREATE INDEX "idx_events_slug" ON "public"."events" USING "btree" ("slug");



CREATE INDEX "idx_form_fields_form_id" ON "public"."form_fields" USING "btree" ("form_id");



CREATE INDEX "idx_form_submission_data_field_id" ON "public"."form_submission_data" USING "btree" ("field_id");



CREATE INDEX "idx_form_submission_data_submission_id" ON "public"."form_submission_data" USING "btree" ("submission_id");



CREATE INDEX "idx_form_submissions_form_id" ON "public"."form_submissions" USING "btree" ("form_id");



CREATE INDEX "idx_form_submissions_payment_status" ON "public"."form_submissions" USING "btree" ("payment_status");



CREATE INDEX "idx_form_submissions_stripe_payment_intent" ON "public"."form_submissions" USING "btree" ("stripe_payment_intent_id");



CREATE INDEX "idx_form_submissions_stripe_session" ON "public"."form_submissions" USING "btree" ("stripe_session_id");



CREATE INDEX "idx_form_submissions_user_id" ON "public"."form_submissions" USING "btree" ("user_id");



CREATE INDEX "idx_groups_county_id" ON "public"."groups" USING "btree" ("county_id");



CREATE INDEX "idx_groups_deleted_at" ON "public"."groups" USING "btree" ("deleted_at");



CREATE INDEX "idx_groups_slug" ON "public"."groups" USING "btree" ("slug");



CREATE INDEX "idx_kb_articles_author" ON "public"."knowledgebase_articles" USING "btree" ("author_id");



CREATE INDEX "idx_kb_articles_published" ON "public"."knowledgebase_articles" USING "btree" ("published", "published_at" DESC);



CREATE INDEX "idx_kb_articles_scope" ON "public"."knowledgebase_articles" USING "btree" ("scope_type", "scope_id");



CREATE INDEX "idx_kb_articles_section_types" ON "public"."knowledgebase_articles" USING "gin" ("section_types");



CREATE INDEX "idx_kb_articles_slug" ON "public"."knowledgebase_articles" USING "btree" ("slug");



CREATE INDEX "idx_kb_files_article_id" ON "public"."knowledgebase_files" USING "btree" ("article_id");



CREATE INDEX "idx_kb_sections_article" ON "public"."knowledgebase_article_sections" USING "btree" ("article_id");



CREATE INDEX "idx_kb_sections_section" ON "public"."knowledgebase_article_sections" USING "btree" ("section_id");



CREATE INDEX "idx_news_posts_author" ON "public"."news_posts" USING "btree" ("author_id");



CREATE INDEX "idx_news_posts_deleted_at" ON "public"."news_posts" USING "btree" ("deleted_at");



CREATE INDEX "idx_news_posts_published" ON "public"."news_posts" USING "btree" ("published", "published_at" DESC);



CREATE INDEX "idx_news_posts_scope" ON "public"."news_posts" USING "btree" ("scope_type", "scope_id");



CREATE INDEX "idx_news_posts_slug" ON "public"."news_posts" USING "btree" ("slug");



CREATE INDEX "idx_org_members_org" ON "public"."organization_members" USING "btree" ("organization_type", "organization_id");



CREATE INDEX "idx_org_members_user" ON "public"."organization_members" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_id" ON "public"."profiles" USING "btree" ("id");



CREATE INDEX "idx_provinces_deleted_at" ON "public"."provinces" USING "btree" ("deleted_at");



CREATE INDEX "idx_provinces_slug" ON "public"."provinces" USING "btree" ("slug");



CREATE INDEX "idx_sections_group_id" ON "public"."sections" USING "btree" ("group_id");



CREATE INDEX "idx_store_order_items_order" ON "public"."store_order_items" USING "btree" ("order_id");



CREATE INDEX "idx_store_orders_scope" ON "public"."store_orders" USING "btree" ("scope_type", "scope_id");



CREATE INDEX "idx_store_orders_stripe_session" ON "public"."store_orders" USING "btree" ("stripe_session_id");



CREATE INDEX "idx_store_orders_user" ON "public"."store_orders" USING "btree" ("user_id");



CREATE INDEX "idx_store_products_published" ON "public"."store_products" USING "btree" ("published");



CREATE INDEX "idx_store_products_scope" ON "public"."store_products" USING "btree" ("scope_type", "scope_id");



CREATE INDEX "idx_user_roles_scope" ON "public"."user_roles" USING "btree" ("scope_type", "scope_id");



CREATE INDEX "idx_user_roles_user_id" ON "public"."user_roles" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "set_adventure_team_slug" BEFORE INSERT OR UPDATE ON "public"."adventure_teams" FOR EACH ROW EXECUTE FUNCTION "public"."set_slug_from_name"();



CREATE OR REPLACE TRIGGER "set_adventure_teams_updated_at" BEFORE UPDATE ON "public"."adventure_teams" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_counties_updated_at" BEFORE UPDATE ON "public"."counties" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_county_slug" BEFORE INSERT OR UPDATE ON "public"."counties" FOR EACH ROW EXECUTE FUNCTION "public"."set_slug_from_name"();



CREATE OR REPLACE TRIGGER "set_event_forms_updated_at" BEFORE UPDATE ON "public"."event_forms" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_event_published_at" BEFORE UPDATE ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."set_published_at"();



CREATE OR REPLACE TRIGGER "set_event_slug" BEFORE INSERT ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."set_content_slug_from_title"();



CREATE OR REPLACE TRIGGER "set_events_updated_at" BEFORE UPDATE ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_form_fields_updated_at" BEFORE UPDATE ON "public"."form_fields" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_group_slug" BEFORE INSERT OR UPDATE ON "public"."groups" FOR EACH ROW EXECUTE FUNCTION "public"."set_slug_from_name"();



CREATE OR REPLACE TRIGGER "set_groups_updated_at" BEFORE UPDATE ON "public"."groups" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_kb_article_slug" BEFORE INSERT ON "public"."knowledgebase_articles" FOR EACH ROW EXECUTE FUNCTION "public"."set_content_slug_from_title"();



CREATE OR REPLACE TRIGGER "set_kb_published_at" BEFORE UPDATE ON "public"."knowledgebase_articles" FOR EACH ROW EXECUTE FUNCTION "public"."set_published_at"();



CREATE OR REPLACE TRIGGER "set_knowledgebase_articles_updated_at" BEFORE UPDATE ON "public"."knowledgebase_articles" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_news_post_slug" BEFORE INSERT ON "public"."news_posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_content_slug_from_title"();



CREATE OR REPLACE TRIGGER "set_news_posts_updated_at" BEFORE UPDATE ON "public"."news_posts" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_news_published_at" BEFORE UPDATE ON "public"."news_posts" FOR EACH ROW EXECUTE FUNCTION "public"."set_published_at"();



CREATE OR REPLACE TRIGGER "set_org_members_updated_at" BEFORE UPDATE ON "public"."organization_members" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_province_slug" BEFORE INSERT OR UPDATE ON "public"."provinces" FOR EACH ROW EXECUTE FUNCTION "public"."set_slug_from_name"();



CREATE OR REPLACE TRIGGER "set_provinces_updated_at" BEFORE UPDATE ON "public"."provinces" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_sections_updated_at" BEFORE UPDATE ON "public"."sections" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_user_roles_updated_at" BEFORE UPDATE ON "public"."user_roles" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_auto_promote_admin_user" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."auto_promote_admin_user"();



CREATE OR REPLACE TRIGGER "trigger_extract_tags_events" AFTER INSERT OR UPDATE OF "tags" ON "public"."events" FOR EACH ROW EXECUTE FUNCTION "public"."extract_tags_from_content"();



CREATE OR REPLACE TRIGGER "trigger_extract_tags_kb" AFTER INSERT OR UPDATE OF "tags" ON "public"."knowledgebase_articles" FOR EACH ROW EXECUTE FUNCTION "public"."extract_tags_from_content"();



CREATE OR REPLACE TRIGGER "trigger_extract_tags_news" AFTER INSERT OR UPDATE OF "tags" ON "public"."news_posts" FOR EACH ROW EXECUTE FUNCTION "public"."extract_tags_from_content"();



CREATE OR REPLACE TRIGGER "update_store_orders_modtime" BEFORE UPDATE ON "public"."store_orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_store_products_modtime" BEFORE UPDATE ON "public"."store_products" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



ALTER TABLE ONLY "public"."counties"
    ADD CONSTRAINT "counties_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_forms"
    ADD CONSTRAINT "event_forms_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_sections"
    ADD CONSTRAINT "event_sections_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_sections"
    ADD CONSTRAINT "event_sections_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."knowledgebase_articles"
    ADD CONSTRAINT "fk_kb_author_profile" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."form_fields"
    ADD CONSTRAINT "form_fields_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "public"."event_forms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_submission_data"
    ADD CONSTRAINT "form_submission_data_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "public"."form_fields"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_submissions"
    ADD CONSTRAINT "form_submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "public"."event_forms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."form_submissions"
    ADD CONSTRAINT "form_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_county_id_fkey" FOREIGN KEY ("county_id") REFERENCES "public"."counties"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledgebase_article_sections"
    ADD CONSTRAINT "knowledgebase_article_sections_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."knowledgebase_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledgebase_article_sections"
    ADD CONSTRAINT "knowledgebase_article_sections_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."knowledgebase_articles"
    ADD CONSTRAINT "knowledgebase_articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."knowledgebase_files"
    ADD CONSTRAINT "knowledgebase_files_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."knowledgebase_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."news_posts"
    ADD CONSTRAINT "news_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "sections_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."store_order_items"
    ADD CONSTRAINT "store_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."store_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."store_order_items"
    ADD CONSTRAINT "store_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."store_products"("id");



ALTER TABLE ONLY "public"."store_orders"
    ADD CONSTRAINT "store_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ticket_attachments"
    ADD CONSTRAINT "ticket_attachments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ticket_replies"
    ADD CONSTRAINT "ticket_replies_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ticket_replies"
    ADD CONSTRAINT "ticket_replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage contacts" ON "public"."organization_contacts" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND (("ur"."role" = 'sysadmin'::"public"."user_role") OR (("ur"."scope_id" = "organization_contacts"."organization_id") AND ("ur"."scope_type" = "organization_contacts"."organization_type") AND ("ur"."role" = ANY (ARRAY['provincial_admin'::"public"."user_role", 'county_admin'::"public"."user_role", 'group_leader'::"public"."user_role"]))))))));



CREATE POLICY "Admins can manage organization members" ON "public"."organization_members" USING (("public"."is_sysadmin"("auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ((("organization_members"."organization_type" = 'province'::"public"."scope_type") AND ("user_roles"."role" = 'provincial_admin'::"public"."user_role") AND ("user_roles"."scope_id" = "organization_members"."organization_id")) OR (("organization_members"."organization_type" = 'county'::"public"."scope_type") AND ("user_roles"."role" = 'county_admin'::"public"."user_role") AND ("user_roles"."scope_id" = "organization_members"."organization_id")) OR (("organization_members"."organization_type" = 'group'::"public"."scope_type") AND ("user_roles"."role" = 'group_leader'::"public"."user_role") AND ("user_roles"."scope_id" = "organization_members"."organization_id")))))))) WITH CHECK (("public"."is_sysadmin"("auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ((("organization_members"."organization_type" = 'province'::"public"."scope_type") AND ("user_roles"."role" = 'provincial_admin'::"public"."user_role") AND ("user_roles"."scope_id" = "organization_members"."organization_id")) OR (("organization_members"."organization_type" = 'county'::"public"."scope_type") AND ("user_roles"."role" = 'county_admin'::"public"."user_role") AND ("user_roles"."scope_id" = "organization_members"."organization_id")) OR (("organization_members"."organization_type" = 'group'::"public"."scope_type") AND ("user_roles"."role" = 'group_leader'::"public"."user_role") AND ("user_roles"."scope_id" = "organization_members"."organization_id"))))))));



CREATE POLICY "Admins can manage store products" ON "public"."store_products" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND (("ur"."scope_type")::"text" = "store_products"."scope_type") AND ("ur"."scope_id" = "store_products"."scope_id") AND ("ur"."role" = ANY (ARRAY['provincial_admin'::"public"."user_role", 'county_admin'::"public"."user_role", 'group_leader'::"public"."user_role"]))))));



CREATE POLICY "Admins can update scope orders" ON "public"."store_orders" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND (("ur"."scope_type")::"text" = "store_orders"."scope_type") AND ("ur"."scope_id" = "store_orders"."scope_id") AND ("ur"."role" = ANY (ARRAY['provincial_admin'::"public"."user_role", 'county_admin'::"public"."user_role", 'group_leader'::"public"."user_role"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND (("ur"."scope_type")::"text" = "store_orders"."scope_type") AND ("ur"."scope_id" = "store_orders"."scope_id") AND ("ur"."role" = ANY (ARRAY['provincial_admin'::"public"."user_role", 'county_admin'::"public"."user_role", 'group_leader'::"public"."user_role"]))))));



CREATE POLICY "Admins can view all ticket attachments" ON "public"."ticket_attachments" FOR SELECT USING (("public"."is_sysadmin"("auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = ANY (ARRAY['provincial_admin'::"public"."user_role", 'county_admin'::"public"."user_role", 'team_admin'::"public"."user_role"])))))));



CREATE POLICY "Admins can view organization members" ON "public"."organization_members" FOR SELECT USING (("public"."is_sysadmin"("auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ((("organization_members"."organization_type" = 'province'::"public"."scope_type") AND ("user_roles"."role" = 'provincial_admin'::"public"."user_role") AND ("user_roles"."scope_id" = "organization_members"."organization_id")) OR (("organization_members"."organization_type" = 'county'::"public"."scope_type") AND ("user_roles"."role" = 'county_admin'::"public"."user_role") AND ("user_roles"."scope_id" = "organization_members"."organization_id")) OR (("organization_members"."organization_type" = 'group'::"public"."scope_type") AND ("user_roles"."role" = 'group_leader'::"public"."user_role") AND ("user_roles"."scope_id" = "organization_members"."organization_id"))))))));



CREATE POLICY "Admins can view scope order items" ON "public"."store_order_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."store_orders"
  WHERE (("store_orders"."id" = "store_order_items"."order_id") AND (EXISTS ( SELECT 1
           FROM "public"."user_roles" "ur"
          WHERE (("ur"."user_id" = "auth"."uid"()) AND (("ur"."scope_type")::"text" = "store_orders"."scope_type") AND ("ur"."scope_id" = "store_orders"."scope_id") AND ("ur"."role" = ANY (ARRAY['provincial_admin'::"public"."user_role", 'county_admin'::"public"."user_role", 'group_leader'::"public"."user_role"])))))))));



CREATE POLICY "Admins can view scope orders" ON "public"."store_orders" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND (("ur"."scope_type")::"text" = "store_orders"."scope_type") AND ("ur"."scope_id" = "store_orders"."scope_id") AND ("ur"."role" = ANY (ARRAY['provincial_admin'::"public"."user_role", 'county_admin'::"public"."user_role", 'group_leader'::"public"."user_role"]))))));



CREATE POLICY "Authenticated Delete" ON "public"."knowledgebase_article_sections" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated Insert" ON "public"."knowledgebase_article_sections" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert tags" ON "public"."tags" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Authenticated users can view all products" ON "public"."store_products" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Counties are deletable by sysadmin" ON "public"."counties" FOR DELETE USING ("public"."is_sysadmin"("auth"."uid"()));



CREATE POLICY "Counties are insertable by sysadmin" ON "public"."counties" FOR INSERT WITH CHECK ("public"."is_sysadmin"("auth"."uid"()));



CREATE POLICY "Counties are updatable by admins" ON "public"."counties" FOR UPDATE USING ((("public"."can_manage_scope"("auth"."uid"(), 'county'::"public"."scope_type", "id") OR "public"."is_sysadmin"("auth"."uid"())) AND ("deleted_at" IS NULL))) WITH CHECK (("public"."can_manage_scope"("auth"."uid"(), 'county'::"public"."scope_type", "id") OR "public"."is_sysadmin"("auth"."uid"())));



CREATE POLICY "Counties are viewable by everyone" ON "public"."counties" FOR SELECT USING (("deleted_at" IS NULL));



CREATE POLICY "Event sections are manageable by event managers" ON "public"."event_sections" USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "event_sections"."event_id") AND "public"."can_manage_scope"("auth"."uid"(), "events"."scope_type", "events"."scope_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "event_sections"."event_id") AND "public"."can_manage_scope"("auth"."uid"(), "events"."scope_type", "events"."scope_id")))));



CREATE POLICY "Event sections are viewable by everyone" ON "public"."event_sections" FOR SELECT USING (true);



CREATE POLICY "Events are deletable by authorized users" ON "public"."events" FOR DELETE USING ("public"."can_manage_scope"("auth"."uid"(), "scope_type", "scope_id"));



CREATE POLICY "Events are insertable by authorized users" ON "public"."events" FOR INSERT WITH CHECK ("public"."can_manage_scope"("auth"."uid"(), "scope_type", "scope_id"));



CREATE POLICY "Events are updatable by authorized users" ON "public"."events" FOR UPDATE USING ("public"."can_manage_scope"("auth"."uid"(), "scope_type", "scope_id")) WITH CHECK ("public"."can_manage_scope"("auth"."uid"(), "scope_type", "scope_id"));



CREATE POLICY "Groups are deletable by county admins" ON "public"."groups" FOR DELETE USING ("public"."can_manage_scope"("auth"."uid"(), 'county'::"public"."scope_type", "county_id"));



CREATE POLICY "Groups are insertable by county admins" ON "public"."groups" FOR INSERT WITH CHECK ("public"."can_manage_scope"("auth"."uid"(), 'county'::"public"."scope_type", "county_id"));



CREATE POLICY "Groups are updatable by admins" ON "public"."groups" FOR UPDATE USING ((("public"."can_manage_scope"("auth"."uid"(), 'group'::"public"."scope_type", "id") OR "public"."is_sysadmin"("auth"."uid"())) AND ("deleted_at" IS NULL))) WITH CHECK (("public"."can_manage_scope"("auth"."uid"(), 'group'::"public"."scope_type", "id") OR "public"."is_sysadmin"("auth"."uid"())));



CREATE POLICY "Groups are viewable by everyone" ON "public"."groups" FOR SELECT USING (("deleted_at" IS NULL));



CREATE POLICY "KB articles are deletable by authorized users" ON "public"."knowledgebase_articles" FOR DELETE USING ("public"."can_manage_scope"("auth"."uid"(), "scope_type", "scope_id"));



CREATE POLICY "KB articles are insertable by authorized users" ON "public"."knowledgebase_articles" FOR INSERT WITH CHECK ("public"."can_manage_scope"("auth"."uid"(), "scope_type", "scope_id"));



CREATE POLICY "KB articles are updatable by authorized users" ON "public"."knowledgebase_articles" FOR UPDATE USING ("public"."can_manage_scope"("auth"."uid"(), "scope_type", "scope_id")) WITH CHECK ("public"."can_manage_scope"("auth"."uid"(), "scope_type", "scope_id"));



CREATE POLICY "KB files are manageable by article managers" ON "public"."knowledgebase_files" USING ((EXISTS ( SELECT 1
   FROM "public"."knowledgebase_articles"
  WHERE (("knowledgebase_articles"."id" = "knowledgebase_files"."article_id") AND "public"."can_manage_scope"("auth"."uid"(), "knowledgebase_articles"."scope_type", "knowledgebase_articles"."scope_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."knowledgebase_articles"
  WHERE (("knowledgebase_articles"."id" = "knowledgebase_files"."article_id") AND "public"."can_manage_scope"("auth"."uid"(), "knowledgebase_articles"."scope_type", "knowledgebase_articles"."scope_id")))));



CREATE POLICY "KB files are viewable by everyone" ON "public"."knowledgebase_files" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."knowledgebase_articles"
  WHERE (("knowledgebase_articles"."id" = "knowledgebase_files"."article_id") AND ("knowledgebase_articles"."published" = true)))) OR (EXISTS ( SELECT 1
   FROM "public"."knowledgebase_articles"
  WHERE (("knowledgebase_articles"."id" = "knowledgebase_files"."article_id") AND "public"."can_manage_scope"("auth"."uid"(), "knowledgebase_articles"."scope_type", "knowledgebase_articles"."scope_id"))))));



CREATE POLICY "News posts are deletable by authorized users" ON "public"."news_posts" FOR DELETE USING ("public"."can_manage_scope"("auth"."uid"(), "scope_type", "scope_id"));



CREATE POLICY "News posts are insertable by authorized users" ON "public"."news_posts" FOR INSERT WITH CHECK ("public"."can_manage_scope"("auth"."uid"(), "scope_type", "scope_id"));



CREATE POLICY "News posts are updatable by authorized users" ON "public"."news_posts" FOR UPDATE USING ("public"."can_manage_scope"("auth"."uid"(), "scope_type", "scope_id")) WITH CHECK ("public"."can_manage_scope"("auth"."uid"(), "scope_type", "scope_id"));



CREATE POLICY "Profiles are insertable by trigger function" ON "public"."profiles" FOR INSERT WITH CHECK (true);



CREATE POLICY "Profiles are viewable by authenticated users" ON "public"."profiles" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Provinces are deletable by sysadmin" ON "public"."provinces" FOR DELETE USING ("public"."is_sysadmin"("auth"."uid"()));



CREATE POLICY "Provinces are insertable by sysadmin" ON "public"."provinces" FOR INSERT WITH CHECK ("public"."is_sysadmin"("auth"."uid"()));



CREATE POLICY "Provinces are updatable by admins" ON "public"."provinces" FOR UPDATE USING (("public"."is_sysadmin"("auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'provincial_admin'::"public"."user_role") AND ("user_roles"."scope_type" = 'province'::"public"."scope_type") AND ("user_roles"."scope_id" = "provinces"."id")))))) WITH CHECK (("public"."is_sysadmin"("auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'provincial_admin'::"public"."user_role") AND ("user_roles"."scope_type" = 'province'::"public"."scope_type") AND ("user_roles"."scope_id" = "provinces"."id"))))));



CREATE POLICY "Provinces are viewable by everyone" ON "public"."provinces" FOR SELECT USING (("deleted_at" IS NULL));



CREATE POLICY "Public Insert" ON "public"."form_submissions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public Read Access" ON "public"."knowledgebase_article_sections" FOR SELECT USING (true);



CREATE POLICY "Public can create orders" ON "public"."store_orders" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public can insert order items" ON "public"."store_order_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."store_orders"
  WHERE ("store_orders"."id" = "store_order_items"."order_id"))));



CREATE POLICY "Public can view published products" ON "public"."store_products" FOR SELECT USING (("published" = true));



CREATE POLICY "Public contacts are viewable by everyone" ON "public"."organization_contacts" FOR SELECT USING (true);



CREATE POLICY "Published KB articles are viewable by everyone" ON "public"."knowledgebase_articles" FOR SELECT USING ((("published" = true) OR "public"."can_manage_scope"("auth"."uid"(), "scope_type", "scope_id") OR "public"."is_sysadmin"("auth"."uid"())));



CREATE POLICY "Published events are viewable by everyone" ON "public"."events" FOR SELECT USING (((("published" = true) AND ("deleted_at" IS NULL)) OR "public"."can_manage_scope"("auth"."uid"(), "scope_type", "scope_id")));



CREATE POLICY "Published news posts are viewable by everyone" ON "public"."news_posts" FOR SELECT USING (((("published" = true) AND ("deleted_at" IS NULL)) OR "public"."can_manage_scope"("auth"."uid"(), "scope_type", "scope_id")));



CREATE POLICY "Read Own Submissions" ON "public"."form_submissions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Sections are deletable by group leaders" ON "public"."sections" FOR DELETE USING ("public"."can_manage_scope"("auth"."uid"(), 'group'::"public"."scope_type", "group_id"));



CREATE POLICY "Sections are insertable by group leaders" ON "public"."sections" FOR INSERT WITH CHECK ("public"."can_manage_scope"("auth"."uid"(), 'group'::"public"."scope_type", "group_id"));



CREATE POLICY "Sections are updatable by admins" ON "public"."sections" FOR UPDATE USING ("public"."can_manage_scope"("auth"."uid"(), 'section'::"public"."scope_type", "id")) WITH CHECK ("public"."can_manage_scope"("auth"."uid"(), 'section'::"public"."scope_type", "id"));



CREATE POLICY "Sections are viewable by everyone" ON "public"."sections" FOR SELECT USING (true);



CREATE POLICY "Sysadmins can reply to tickets" ON "public"."ticket_replies" FOR INSERT WITH CHECK ("public"."is_sysadmin"("auth"."uid"()));



CREATE POLICY "Sysadmins can update tickets" ON "public"."tickets" FOR UPDATE USING ("public"."is_sysadmin"("auth"."uid"()));



CREATE POLICY "Sysadmins can view all replies" ON "public"."ticket_replies" FOR SELECT USING ("public"."is_sysadmin"("auth"."uid"()));



CREATE POLICY "Sysadmins can view all tickets" ON "public"."tickets" FOR SELECT USING ("public"."is_sysadmin"("auth"."uid"()));



CREATE POLICY "Tags are viewable by everyone" ON "public"."tags" FOR SELECT USING (true);



CREATE POLICY "User roles are deletable by sysadmin" ON "public"."user_roles" FOR DELETE USING ("public"."is_sysadmin"("auth"."uid"()));



CREATE POLICY "User roles are insertable by sysadmin" ON "public"."user_roles" FOR INSERT WITH CHECK ("public"."is_sysadmin"("auth"."uid"()));



CREATE POLICY "User roles are updatable by sysadmin" ON "public"."user_roles" FOR UPDATE USING ("public"."is_sysadmin"("auth"."uid"())) WITH CHECK ("public"."is_sysadmin"("auth"."uid"()));



CREATE POLICY "User roles are viewable by authenticated users" ON "public"."user_roles" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can create tickets" ON "public"."tickets" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can reply to own tickets" ON "public"."ticket_replies" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."tickets"
  WHERE (("tickets"."id" = "ticket_replies"."ticket_id") AND ("tickets"."user_id" = "auth"."uid"())))) AND ("auth"."uid"() = "user_id")));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own tickets" ON "public"."tickets" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can upload ticket attachments" ON "public"."ticket_attachments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."tickets"
  WHERE (("tickets"."id" = "ticket_attachments"."ticket_id") AND ("tickets"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own order items" ON "public"."store_order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."store_orders"
  WHERE (("store_orders"."id" = "store_order_items"."order_id") AND ("store_orders"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own orders" ON "public"."store_orders" FOR SELECT USING ((("auth"."uid"() = "user_id") OR false));



CREATE POLICY "Users can view own ticket attachments" ON "public"."ticket_attachments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."tickets"
  WHERE (("tickets"."id" = "ticket_attachments"."ticket_id") AND ("tickets"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own tickets" ON "public"."tickets" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view replies for own tickets" ON "public"."ticket_replies" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."tickets"
  WHERE (("tickets"."id" = "ticket_replies"."ticket_id") AND ("tickets"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own organization memberships" ON "public"."organization_members" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."counties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."form_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledgebase_article_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledgebase_articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledgebase_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."provinces" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."store_order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."store_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."store_products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ticket_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ticket_replies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tickets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."auto_promote_admin_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_promote_admin_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_promote_admin_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_manage_scope"("user_id" "uuid", "check_scope_type" "public"."scope_type", "check_scope_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_manage_scope"("user_id" "uuid", "check_scope_type" "public"."scope_type", "check_scope_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_manage_scope"("user_id" "uuid", "check_scope_type" "public"."scope_type", "check_scope_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."extract_tags_from_content"() TO "anon";
GRANT ALL ON FUNCTION "public"."extract_tags_from_content"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."extract_tags_from_content"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_slug"("text_input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_slug"("text_input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_slug"("text_input" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role_for_scope"("user_id" "uuid", "required_role" "public"."user_role", "check_scope_type" "public"."scope_type", "check_scope_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role_for_scope"("user_id" "uuid", "required_role" "public"."user_role", "check_scope_type" "public"."scope_type", "check_scope_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role_for_scope"("user_id" "uuid", "required_role" "public"."user_role", "check_scope_type" "public"."scope_type", "check_scope_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_sysadmin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_sysadmin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_sysadmin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_content_slug_from_title"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_content_slug_from_title"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_content_slug_from_title"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_published_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_published_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_published_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_slug_from_name"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_slug_from_name"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_slug_from_name"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."adventure_teams" TO "anon";
GRANT ALL ON TABLE "public"."adventure_teams" TO "authenticated";
GRANT ALL ON TABLE "public"."adventure_teams" TO "service_role";



GRANT ALL ON TABLE "public"."counties" TO "anon";
GRANT ALL ON TABLE "public"."counties" TO "authenticated";
GRANT ALL ON TABLE "public"."counties" TO "service_role";



GRANT ALL ON TABLE "public"."event_forms" TO "anon";
GRANT ALL ON TABLE "public"."event_forms" TO "authenticated";
GRANT ALL ON TABLE "public"."event_forms" TO "service_role";



GRANT ALL ON TABLE "public"."event_sections" TO "anon";
GRANT ALL ON TABLE "public"."event_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."event_sections" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."form_fields" TO "anon";
GRANT ALL ON TABLE "public"."form_fields" TO "authenticated";
GRANT ALL ON TABLE "public"."form_fields" TO "service_role";



GRANT ALL ON TABLE "public"."form_submission_data" TO "anon";
GRANT ALL ON TABLE "public"."form_submission_data" TO "authenticated";
GRANT ALL ON TABLE "public"."form_submission_data" TO "service_role";



GRANT ALL ON TABLE "public"."form_submissions" TO "anon";
GRANT ALL ON TABLE "public"."form_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."form_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON TABLE "public"."knowledgebase_article_sections" TO "anon";
GRANT ALL ON TABLE "public"."knowledgebase_article_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledgebase_article_sections" TO "service_role";



GRANT ALL ON TABLE "public"."knowledgebase_articles" TO "anon";
GRANT ALL ON TABLE "public"."knowledgebase_articles" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledgebase_articles" TO "service_role";



GRANT ALL ON TABLE "public"."knowledgebase_files" TO "anon";
GRANT ALL ON TABLE "public"."knowledgebase_files" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledgebase_files" TO "service_role";



GRANT ALL ON TABLE "public"."news_posts" TO "anon";
GRANT ALL ON TABLE "public"."news_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."news_posts" TO "service_role";



GRANT ALL ON TABLE "public"."organization_contacts" TO "anon";
GRANT ALL ON TABLE "public"."organization_contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_contacts" TO "service_role";



GRANT ALL ON TABLE "public"."organization_members" TO "anon";
GRANT ALL ON TABLE "public"."organization_members" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_members" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."provinces" TO "anon";
GRANT ALL ON TABLE "public"."provinces" TO "authenticated";
GRANT ALL ON TABLE "public"."provinces" TO "service_role";



GRANT ALL ON TABLE "public"."sections" TO "anon";
GRANT ALL ON TABLE "public"."sections" TO "authenticated";
GRANT ALL ON TABLE "public"."sections" TO "service_role";



GRANT ALL ON TABLE "public"."store_order_items" TO "anon";
GRANT ALL ON TABLE "public"."store_order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."store_order_items" TO "service_role";



GRANT ALL ON TABLE "public"."store_orders" TO "anon";
GRANT ALL ON TABLE "public"."store_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."store_orders" TO "service_role";



GRANT ALL ON TABLE "public"."store_products" TO "anon";
GRANT ALL ON TABLE "public"."store_products" TO "authenticated";
GRANT ALL ON TABLE "public"."store_products" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON TABLE "public"."ticket_attachments" TO "anon";
GRANT ALL ON TABLE "public"."ticket_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."ticket_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."ticket_replies" TO "anon";
GRANT ALL ON TABLE "public"."ticket_replies" TO "authenticated";
GRANT ALL ON TABLE "public"."ticket_replies" TO "service_role";



GRANT ALL ON TABLE "public"."tickets" TO "anon";
GRANT ALL ON TABLE "public"."tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."tickets" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































