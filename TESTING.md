# Atlas Testing Guide - Sovereign Deployment & Federation

Follow these steps to test the newly implemented Hub/Instance separation, autonomous onboarding, and federation features.

## 1. Environment Configuration

To switch between **Hub** and **Instance** modes, update your `.env.local` or Supabase/Vercel secrets.

### Instance Mode (Group/County Site)
```env
NEXT_PUBLIC_APP_ROLE=instance
NEXT_PUBLIC_HOME_ORG_ID=your-org-uuid-here
NEXT_PUBLIC_HOME_ORG_TYPE=group  # or county, province, adventure_team
ATLAS_HUB_URL=https://your-hub-url.com
ATLAS_SYNC_TOKEN=your-secure-shared-secret
```

### Hub Mode (Central Site)
```env
NEXT_PUBLIC_APP_ROLE=hub
# NEXT_PUBLIC_HOME_ORG_ID should be unset or empty
ATLAS_SYNC_TOKEN=same-secure-shared-secret-as-above
```

## 2. Testing Autonomous Onboarding

1.  **Clear Local State**: If you've already initialized, you can manually reset by deleting the record in the `site_settings` table.
2.  **Visit `/setup`**:
    - If `NEXT_PUBLIC_HOME_ORG_ID` is not set, or `site_settings` is uninitialized, you will be redirected here.
    - **Step 0: Database Health**: If you are using a fresh Supabase project, click "Initialize Database".
    > [!NOTE]
    > **Infrastructure Requirement**: For "Initialize Database" to work, you must add the following function to your Supabase SQL Editor once:
    ```sql
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    ```
    - **Steps 1-4**: Follow the wizard to select your organization type, link it to an entity, and set branding.

## 3. Testing Data Isolation & Sync

1.  **Check Sync Toggle**: In the Setup Wizard or `Site Settings -> Ecosystem`, toggle "Sync to Atlas Hub".
2.  **Verify Sync**: 
    - Create a news post on your **Instance**.
    - If sync is **ON**, check the **Hub** database's `news` table (it should appear with your `scope_id`).
    - If sync is **OFF**, verify no data is sent.

## 4. Testing Federation Feed

1.  **Generate Public Events**: Create 1-2 events marked as "Public" and "Open to All".
2.  **Access Feed**: Visit `http://localhost:3000/api/feed/events`.
3.  **Verify JSON**: Ensure the feed returns your events and organization metadata correctly.

## 5. Standalone Check

1.  **Disable Hub URL**: Remove `ATLAS_HUB_URL` from your env.
2.  **Verify Ops**: Ensure the Instance still functions perfectly (News, Events, etc. all work locally).
