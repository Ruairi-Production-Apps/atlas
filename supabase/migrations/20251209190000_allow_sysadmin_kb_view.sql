-- Allow system admins to view all knowledgebase articles regardless of publication status or scope
DROP POLICY IF EXISTS "Published KB articles are viewable by everyone" ON knowledgebase_articles;

CREATE POLICY "Published KB articles are viewable by everyone"
  ON knowledgebase_articles FOR SELECT
  USING (
    published = true 
    OR can_manage_scope(auth.uid(), scope_type, scope_id)
    OR is_sysadmin(auth.uid())
  );
