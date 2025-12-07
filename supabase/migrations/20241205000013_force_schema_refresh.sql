-- Force schema cache reload via DDL
-- This is more reliable than NOTIFY in some environments
COMMENT ON TABLE knowledgebase_files IS 'Files associated with knowledgebase articles';
