alter table "public"."user_roles" add column "permissions" jsonb default '{}'::jsonb;
