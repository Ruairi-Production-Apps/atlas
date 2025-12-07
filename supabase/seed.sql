-- Comprehensive seed data for Scout Hub
-- Creates a realistic organizational hierarchy and sample content
--
-- NOTE: This seed file uses placeholder author_id UUIDs for content (news, events, knowledgebase).
-- In production, these should be replaced with actual user IDs from auth.users.
-- The placeholder '00000000-0000-0000-0000-000000000001' is used throughout.

-- ==========================================
-- PROVINCES
-- ==========================================
INSERT INTO provinces (name, description, website, email) VALUES
  ('Leinster', 'Scouting Ireland - Leinster Province covering the eastern region of Ireland', 'https://scouts.ie/leinster', 'leinster@scouts.ie'),
  ('Munster', 'Scouting Ireland - Munster Province covering the southern region of Ireland', 'https://scouts.ie/munster', 'munster@scouts.ie'),
  ('Connacht', 'Scouting Ireland - Connacht Province covering the western region of Ireland', 'https://scouts.ie/connacht', 'connacht@scouts.ie'),
  ('Ulster', 'Scouting Ireland - Ulster Province covering the northern region of Ireland', 'https://scouts.ie/ulster', 'ulster@scouts.ie')
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- COUNTIES
-- ==========================================
DO $$
DECLARE
  leinster_id UUID;
  munster_id UUID;
  connacht_id UUID;
  ulster_id UUID;
BEGIN
  SELECT id INTO leinster_id FROM provinces WHERE name = 'Leinster';
  SELECT id INTO munster_id FROM provinces WHERE name = 'Munster';
  SELECT id INTO connacht_id FROM provinces WHERE name = 'Connacht';
  SELECT id INTO ulster_id FROM provinces WHERE name = 'Ulster';

  -- Leinster Counties
  INSERT INTO counties (province_id, name, description, website, email) VALUES
    (leinster_id, 'Dublin', 'Dublin County Scouting', 'https://scouts.ie/dublin', 'dublin@scouts.ie'),
    (leinster_id, 'Wicklow', 'Wicklow County Scouting', 'https://scouts.ie/wicklow', 'wicklow@scouts.ie'),
    (leinster_id, 'Kildare', 'Kildare County Scouting', 'https://scouts.ie/kildare', 'kildare@scouts.ie'),
    (leinster_id, 'Meath', 'Meath County Scouting', 'https://scouts.ie/meath', 'meath@scouts.ie')
  ON CONFLICT (slug) DO NOTHING;

  -- Munster Counties
  INSERT INTO counties (province_id, name, description, website, email) VALUES
    (munster_id, 'Cork', 'Cork County Scouting', 'https://scouts.ie/cork', 'cork@scouts.ie'),
    (munster_id, 'Kerry', 'Kerry County Scouting', 'https://scouts.ie/kerry', 'kerry@scouts.ie'),
    (munster_id, 'Limerick', 'Limerick County Scouting', 'https://scouts.ie/limerick', 'limerick@scouts.ie'),
    (munster_id, 'Tipperary', 'Tipperary County Scouting', 'https://scouts.ie/tipperary', 'tipperary@scouts.ie')
  ON CONFLICT (slug) DO NOTHING;

  -- Connacht Counties
  INSERT INTO counties (province_id, name, description, website, email) VALUES
    (connacht_id, 'Galway', 'Galway County Scouting', 'https://scouts.ie/galway', 'galway@scouts.ie'),
    (connacht_id, 'Mayo', 'Mayo County Scouting', 'https://scouts.ie/mayo', 'mayo@scouts.ie'),
    (connacht_id, 'Roscommon', 'Roscommon County Scouting', 'https://scouts.ie/roscommon', 'roscommon@scouts.ie')
  ON CONFLICT (slug) DO NOTHING;

  -- Ulster Counties
  INSERT INTO counties (province_id, name, description, website, email) VALUES
    (ulster_id, 'Donegal', 'Donegal County Scouting', 'https://scouts.ie/donegal', 'donegal@scouts.ie'),
    (ulster_id, 'Cavan', 'Cavan County Scouting', 'https://scouts.ie/cavan', 'cavan@scouts.ie'),
    (ulster_id, 'Monaghan', 'Monaghan County Scouting', 'https://scouts.ie/monaghan', 'monaghan@scouts.ie')
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- ==========================================
-- GROUPS
-- ==========================================
DO $$
DECLARE
  dublin_id UUID;
  wicklow_id UUID;
  cork_id UUID;
  kerry_id UUID;
  galway_id UUID;
BEGIN
  SELECT id INTO dublin_id FROM counties WHERE name = 'Dublin';
  SELECT id INTO wicklow_id FROM counties WHERE name = 'Wicklow';
  SELECT id INTO cork_id FROM counties WHERE name = 'Cork';
  SELECT id INTO kerry_id FROM counties WHERE name = 'Kerry';
  SELECT id INTO galway_id FROM counties WHERE name = 'Galway';

  -- Dublin Groups
  INSERT INTO groups (county_id, name, description, website, email) VALUES
    (dublin_id, '1st Dublin Scout Group', 'A vibrant scouting group in the heart of Dublin', 'https://scouts.ie/1st-dublin', '1stdublin@scouts.ie'),
    (dublin_id, '2nd Dublin Scout Group', 'Serving the Dublin community since 1920', 'https://scouts.ie/2nd-dublin', '2nddublin@scouts.ie'),
    (dublin_id, '3rd Dublin Scout Group', 'Building character and leadership in young people', 'https://scouts.ie/3rd-dublin', '3rddublin@scouts.ie')
  ON CONFLICT (slug) DO NOTHING;

  -- Wicklow Groups
  INSERT INTO groups (county_id, name, description, website, email) VALUES
    (wicklow_id, '1st Wicklow Scout Group', 'Exploring the beautiful Wicklow mountains', 'https://scouts.ie/1st-wicklow', '1stwicklow@scouts.ie'),
    (wicklow_id, '2nd Wicklow Scout Group', 'Adventure and outdoor activities in County Wicklow', 'https://scouts.ie/2nd-wicklow', '2ndwicklow@scouts.ie')
  ON CONFLICT (slug) DO NOTHING;

  -- Cork Groups
  INSERT INTO groups (county_id, name, description, website, email) VALUES
    (cork_id, '1st Cork Scout Group', 'Cork''s premier scouting group', 'https://scouts.ie/1st-cork', '1stcork@scouts.ie'),
    (cork_id, '2nd Cork Scout Group', 'Building future leaders in Cork', 'https://scouts.ie/2nd-cork', '2ndcork@scouts.ie')
  ON CONFLICT (slug) DO NOTHING;

  -- Kerry Groups
  INSERT INTO groups (county_id, name, description, website, email) VALUES
    (kerry_id, '1st Kerry Scout Group', 'Adventure in the Kingdom of Kerry', 'https://scouts.ie/1st-kerry', '1stkerry@scouts.ie')
  ON CONFLICT (slug) DO NOTHING;

  -- Galway Groups
  INSERT INTO groups (county_id, name, description, website, email) VALUES
    (galway_id, '1st Galway Scout Group', 'Scouting on the Wild Atlantic Way', 'https://scouts.ie/1st-galway', '1stgalway@scouts.ie')
  ON CONFLICT (slug) DO NOTHING;
END $$;

-- ==========================================
-- SECTIONS
-- ==========================================
DO $$
DECLARE
  group1_id UUID;
  group2_id UUID;
  group3_id UUID;
BEGIN
  -- Get first few groups
  SELECT id INTO group1_id FROM groups WHERE name = '1st Dublin Scout Group';
  SELECT id INTO group2_id FROM groups WHERE name = '2nd Dublin Scout Group';
  SELECT id INTO group3_id FROM groups WHERE name = '1st Wicklow Scout Group';

  -- Sections for 1st Dublin
  IF group1_id IS NOT NULL THEN
    INSERT INTO sections (group_id, name, section_type, description) VALUES
      (group1_id, 'Beaver Colony', 'beavers', 'Ages 6-8 - Fun and adventure for our youngest members'),
      (group1_id, 'Cub Pack', 'cubs', 'Ages 9-11 - Learning through games and activities'),
      (group1_id, 'Scout Troop', 'scouts', 'Ages 12-15 - Adventure, camping, and skill building'),
      (group1_id, 'Venture Unit', 'ventures', 'Ages 15-17 - Leadership and personal development')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Sections for 2nd Dublin
  IF group2_id IS NOT NULL THEN
    INSERT INTO sections (group_id, name, section_type, description) VALUES
      (group2_id, 'Beaver Colony', 'beavers', 'Ages 6-8'),
      (group2_id, 'Cub Pack', 'cubs', 'Ages 9-11'),
      (group2_id, 'Scout Troop', 'scouts', 'Ages 12-15')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Sections for 1st Wicklow
  IF group3_id IS NOT NULL THEN
    INSERT INTO sections (group_id, name, section_type, description) VALUES
      (group3_id, 'Beaver Colony', 'beavers', 'Ages 6-8'),
      (group3_id, 'Cub Pack', 'cubs', 'Ages 9-11'),
      (group3_id, 'Scout Troop', 'scouts', 'Ages 12-15'),
      (group3_id, 'Rover Crew', 'rovers', 'Ages 18-26 - Service and adventure')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ==========================================
-- SAMPLE NEWS POSTS
-- ==========================================
DO $$
DECLARE
  leinster_id UUID;
  dublin_id UUID;
  group1_id UUID;
  author_id UUID;
BEGIN
  SELECT id INTO leinster_id FROM provinces WHERE name = 'Leinster';
  SELECT id INTO dublin_id FROM counties WHERE name = 'Dublin';
  SELECT id INTO group1_id FROM groups WHERE name = '1st Dublin Scout Group';
  
  -- Use a system user ID or create a placeholder
  -- For now, we'll use a placeholder UUID that would be replaced with actual user ID
  author_id := '00000000-0000-0000-0000-000000000001'::UUID;

/*
  -- Province-level news
  IF leinster_id IS NOT NULL THEN
    INSERT INTO news_posts (title, body, tags, scope_type, scope_id, author_id, published, published_at) VALUES
      (
        'Leinster Jamboree 2025 - Registration Now Open!',
        '<p>We are excited to announce that registration for the Leinster Jamboree 2025 is now open!</p><p>This year''s event will take place in the beautiful Wicklow Mountains and promises to be an unforgettable experience for all participants. Activities include hiking, camping, team challenges, and much more.</p><p>Don''t miss out - register early to secure your place!</p>',
        ARRAY['jamboree', 'events', 'leinster', '2025'],
        'province',
        leinster_id,
        author_id,
        true,
        NOW() - INTERVAL '5 days'
      ),
      (
        'New Leadership Training Programme Launched',
        '<p>Leinster Province is proud to launch a new comprehensive leadership training programme for all adult volunteers.</p><p>The programme covers essential skills including risk management, programme planning, and youth development. Sessions will be held monthly across the province.</p>',
        ARRAY['training', 'leadership', 'volunteers'],
        'province',
        leinster_id,
        author_id,
        true,
        NOW() - INTERVAL '12 days'
      )
    ON CONFLICT DO NOTHING;
  END IF;

  -- County-level news
  IF dublin_id IS NOT NULL THEN
    INSERT INTO news_posts (title, body, tags, scope_type, scope_id, author_id, published, published_at) VALUES
      (
        'Dublin County Camping Weekend Success',
        '<p>Last weekend saw over 200 scouts from across Dublin County come together for our annual camping weekend.</p><p>The event featured outdoor cooking competitions, orienteering challenges, and campfire sing-alongs. Thank you to all the volunteers who made this event possible!</p>',
        ARRAY['camping', 'events', 'dublin'],
        'county',
        dublin_id,
        author_id,
        true,
        NOW() - INTERVAL '3 days'
      )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Group-level news
  IF group1_id IS NOT NULL THEN
    INSERT INTO news_posts (title, body, tags, scope_type, scope_id, author_id, published, published_at) VALUES
      (
        '1st Dublin Achieves Gold Standard',
        '<p>We are thrilled to announce that 1st Dublin Scout Group has achieved Gold Standard accreditation!</p><p>This recognition reflects our commitment to providing high-quality scouting experiences and maintaining excellent standards in all our activities.</p>',
        ARRAY['achievement', 'gold-standard', '1st-dublin'],
        'group',
        group1_id,
        author_id,
        true,
        NOW() - INTERVAL '1 day'
      )
    ON CONFLICT DO NOTHING;
  END IF;
*/

END $$;

-- ==========================================
-- SAMPLE EVENTS
-- ==========================================
DO $$
DECLARE
  leinster_id UUID;
  dublin_id UUID;
  group1_id UUID;
  author_id UUID;
BEGIN
/*
  SELECT id INTO leinster_id FROM provinces WHERE name = 'Leinster';
  SELECT id INTO dublin_id FROM counties WHERE name = 'Dublin';
  SELECT id INTO group1_id FROM groups WHERE name = '1st Dublin Scout Group';
  author_id := '00000000-0000-0000-0000-000000000001'::UUID;

  -- Province-level event
  IF leinster_id IS NOT NULL THEN
    INSERT INTO events (
      title, body, tags, scope_type, scope_id, author_id,
      start_date, end_date, location, price, pricing_mode,
      visibility, capacity_youth, published, published_at
    ) VALUES
      (
        'Leinster Jamboree 2025',
        '<p>Join us for the biggest scouting event in Leinster this year!</p><p><strong>Activities include:</strong></p><ul><li>Hiking and orienteering</li><li>Camping and outdoor cooking</li><li>Team challenges and games</li><li>Campfire entertainment</li></ul><p>Open to all scouts aged 12-17 from across Leinster Province.</p>',
        ARRAY['jamboree', 'camping', 'adventure'],
        'province',
        leinster_id,
        author_id,
        NOW() + INTERVAL '3 months',
        NOW() + INTERVAL '3 months' + INTERVAL '3 days',
        'Wicklow Mountains National Park',
        50.00,
        'per_scout',
        'open_to_all',
        200,
        true,
        NOW() - INTERVAL '10 days'
      )
    ON CONFLICT DO NOTHING;
  END IF;

  -- ... (Rest of events commented out for same reason)
*/
END $$;

-- ==========================================
-- SAMPLE KNOWLEDGEBASE ARTICLES
-- ==========================================
DO $$
DECLARE
  leinster_id UUID;
  dublin_id UUID;
  group1_id UUID;
  author_id UUID;
BEGIN
/*
  SELECT id INTO leinster_id FROM provinces WHERE name = 'Leinster';
  SELECT id INTO dublin_id FROM counties WHERE name = 'Dublin';
  SELECT id INTO group1_id FROM groups WHERE name = '1st Dublin Scout Group';
  author_id := '00000000-0000-0000-0000-000000000001'::UUID;

  -- Province-level knowledgebase
  IF leinster_id IS NOT NULL THEN
    INSERT INTO knowledgebase_articles (title, body, tags, scope_type, scope_id, author_id, published, published_at) VALUES
      (
        'Leinster Province Policies and Procedures',
        '<h2>Overview</h2><p>This document outlines the key policies and procedures for all groups operating within Leinster Province.</p><h2>Safety Guidelines</h2><p>All activities must comply with Scouting Ireland safety guidelines. Risk assessments must be completed for all outdoor activities.</p><h2>Reporting Requirements</h2><p>Groups are required to submit quarterly activity reports to the provincial office.</p>',
        ARRAY['policies', 'procedures', 'safety'],
        'province',
        leinster_id,
        author_id,
        true,
        NOW() - INTERVAL '30 days'
      )
    ON CONFLICT DO NOTHING;
  END IF;
  -- ... (Rest of KB articles commented out)
*/
END $$;
