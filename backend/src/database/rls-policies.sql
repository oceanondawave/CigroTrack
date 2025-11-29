-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Note: Supabase provides auth.uid() function automatically
-- This is just a fallback if needed (usually not required in Supabase)
-- Uncomment only if you get "function auth.uid() does not exist" errors
-- CREATE OR REPLACE FUNCTION auth.uid()
-- RETURNS UUID AS $$
--   SELECT (current_setting('request.jwt.claims', true)::json->>'sub')::UUID;
-- $$ LANGUAGE SQL STABLE;

-- Helper function to check if user is team member
CREATE OR REPLACE FUNCTION is_team_member(team_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_id = team_uuid AND user_id = user_uuid
  );
$$ LANGUAGE SQL STABLE;

-- Helper function to check if user is team owner or admin
CREATE OR REPLACE FUNCTION is_team_owner_or_admin(team_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_id = team_uuid 
    AND user_id = user_uuid 
    AND role IN ('OWNER', 'ADMIN')
  );
$$ LANGUAGE SQL STABLE;

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Users can view other users (for team members, assignees, etc.)
CREATE POLICY "Users can view other users in teams"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members tm1
    JOIN team_members tm2 ON tm1.team_id = tm2.team_id
    WHERE tm1.user_id = auth.uid() AND tm2.user_id = users.id
  )
);

-- ============================================
-- TEAMS POLICIES
-- ============================================

-- Users can view teams they're members of
CREATE POLICY "Users can view team if member"
ON teams FOR SELECT
USING (is_team_member(id, auth.uid()));

-- Team owners can update teams
CREATE POLICY "Team owners can update teams"
ON teams FOR UPDATE
USING (
  owner_id = auth.uid() OR 
  is_team_owner_or_admin(id, auth.uid())
);

-- Team owners can delete teams (soft delete)
CREATE POLICY "Team owners can delete teams"
ON teams FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Authenticated users can create teams (they become owner)
CREATE POLICY "Authenticated users can create teams"
ON teams FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- ============================================
-- TEAM MEMBERS POLICIES
-- ============================================

-- Users can view team members of teams they belong to
CREATE POLICY "Users can view team members"
ON team_members FOR SELECT
USING (is_team_member(team_id, auth.uid()));

-- Team owners/admins can add members
CREATE POLICY "Team owners/admins can add members"
ON team_members FOR INSERT
WITH CHECK (is_team_owner_or_admin(team_id, auth.uid()));

-- Team owners/admins can update member roles
CREATE POLICY "Team owners/admins can update roles"
ON team_members FOR UPDATE
USING (is_team_owner_or_admin(team_id, auth.uid()));

-- Team owners/admins can remove members, or users can leave
CREATE POLICY "Team owners/admins can remove members or users can leave"
ON team_members FOR DELETE
USING (
  is_team_owner_or_admin(team_id, auth.uid()) OR 
  user_id = auth.uid()
);

-- ============================================
-- PROJECTS POLICIES
-- ============================================

-- Users can view projects in teams they're members of
CREATE POLICY "Users can view projects in their teams"
ON projects FOR SELECT
USING (
  is_team_member(team_id, auth.uid())
);

-- Team members can create projects (max 15 per team enforced in application)
CREATE POLICY "Team members can create projects"
ON projects FOR INSERT
WITH CHECK (
  is_team_member(team_id, auth.uid()) AND
  owner_id = auth.uid()
);

-- Project owners, team owners, or team admins can update projects
CREATE POLICY "Project owners or team admins can update projects"
ON projects FOR UPDATE
USING (
  owner_id = auth.uid() OR
  is_team_owner_or_admin(team_id, auth.uid())
);

-- Project owners, team owners, or team admins can archive/delete projects
CREATE POLICY "Project owners or team admins can delete projects"
ON projects FOR UPDATE
USING (
  owner_id = auth.uid() OR
  is_team_owner_or_admin(team_id, auth.uid())
);

-- ============================================
-- ISSUES POLICIES
-- ============================================

-- Users can view issues in projects from teams they're members of
CREATE POLICY "Users can view issues in their team projects"
ON issues FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN team_members tm ON tm.team_id = p.team_id
    WHERE p.id = issues.project_id AND tm.user_id = auth.uid()
  ) AND deleted_at IS NULL
);

-- Team members can create issues in their team projects
CREATE POLICY "Team members can create issues"
ON issues FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN team_members tm ON tm.team_id = p.team_id
    WHERE p.id = issues.project_id AND tm.user_id = auth.uid()
  ) AND
  reporter_id = auth.uid()
);

-- Team members can update issues in their team projects
CREATE POLICY "Team members can update issues"
ON issues FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN team_members tm ON tm.team_id = p.team_id
    WHERE p.id = issues.project_id AND tm.user_id = auth.uid()
  )
);

-- Team members can delete issues (soft delete)
CREATE POLICY "Team members can delete issues"
ON issues FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN team_members tm ON tm.team_id = p.team_id
    WHERE p.id = issues.project_id AND tm.user_id = auth.uid()
  )
);

-- ============================================
-- COMMENTS POLICIES
-- ============================================

-- Users can view comments on issues they can view
CREATE POLICY "Users can view comments on visible issues"
ON comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM issues i
    JOIN projects p ON p.id = i.project_id
    JOIN team_members tm ON tm.team_id = p.team_id
    WHERE i.id = comments.issue_id AND tm.user_id = auth.uid()
  ) AND deleted_at IS NULL
);

-- Team members can create comments
CREATE POLICY "Team members can create comments"
ON comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM issues i
    JOIN projects p ON p.id = i.project_id
    JOIN team_members tm ON tm.team_id = p.team_id
    WHERE i.id = comments.issue_id AND tm.user_id = auth.uid()
  ) AND
  author_id = auth.uid()
);

-- Comment authors can update their comments
CREATE POLICY "Comment authors can update comments"
ON comments FOR UPDATE
USING (author_id = auth.uid());

-- Comment authors can delete their comments (soft delete)
CREATE POLICY "Comment authors can delete comments"
ON comments FOR UPDATE
USING (author_id = auth.uid());

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- System can create notifications (handled via service role)
-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- ============================================
-- PROJECT FAVORITES POLICIES
-- ============================================

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
ON project_favorites FOR SELECT
USING (user_id = auth.uid());

-- Users can create/delete their own favorites
CREATE POLICY "Users can manage own favorites"
ON project_favorites FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- LABELS POLICIES
-- ============================================

-- Team members can view labels in their team projects
CREATE POLICY "Team members can view labels"
ON labels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN team_members tm ON tm.team_id = p.team_id
    WHERE p.id = labels.project_id AND tm.user_id = auth.uid()
  )
);

-- Team members can manage labels
CREATE POLICY "Team members can manage labels"
ON labels FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN team_members tm ON tm.team_id = p.team_id
    WHERE p.id = labels.project_id AND tm.user_id = auth.uid()
  )
);

-- ============================================
-- SUBTASKS POLICIES
-- ============================================

-- Users can view subtasks for issues they can view
CREATE POLICY "Users can view subtasks"
ON subtasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM issues i
    JOIN projects p ON p.id = i.project_id
    JOIN team_members tm ON tm.team_id = p.team_id
    WHERE i.id = subtasks.issue_id AND tm.user_id = auth.uid()
  )
);

-- Team members can manage subtasks
CREATE POLICY "Team members can manage subtasks"
ON subtasks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM issues i
    JOIN projects p ON p.id = i.project_id
    JOIN team_members tm ON tm.team_id = p.team_id
    WHERE i.id = subtasks.issue_id AND tm.user_id = auth.uid()
  )
);

-- ============================================
-- AI SUMMARIES POLICIES
-- ============================================

-- Users can view AI summaries for issues they can view
CREATE POLICY "Users can view AI summaries"
ON ai_summaries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM issues i
    JOIN projects p ON p.id = i.project_id
    JOIN team_members tm ON tm.team_id = p.team_id
    WHERE i.id = ai_summaries.issue_id AND tm.user_id = auth.uid()
  )
);

-- System can create/update summaries (handled via service role)

-- ============================================
-- TEAM INVITES POLICIES
-- ============================================

-- Users can view invites sent to their email
CREATE POLICY "Users can view invites to their email"
ON team_invites FOR SELECT
USING (
  email = (SELECT email FROM users WHERE id = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM teams t
    JOIN team_members tm ON tm.team_id = t.id
    WHERE t.id = team_invites.team_id 
    AND tm.user_id = auth.uid()
    AND tm.role IN ('OWNER', 'ADMIN')
  )
);

-- Team owners/admins can create invites
CREATE POLICY "Team owners/admins can create invites"
ON team_invites FOR INSERT
WITH CHECK (
  is_team_owner_or_admin(team_id, auth.uid()) AND
  invited_by = auth.uid()
);

-- Team owners/admins can update invites
CREATE POLICY "Team owners/admins can update invites"
ON team_invites FOR UPDATE
USING (is_team_owner_or_admin(team_id, auth.uid()));

-- Users can accept invites, owners/admins can delete
CREATE POLICY "Users can accept or owners can delete invites"
ON team_invites FOR DELETE
USING (
  email = (SELECT email FROM users WHERE id = auth.uid()) OR
  is_team_owner_or_admin(team_id, auth.uid())
);

-- ============================================
-- TEAM ACTIVITY POLICIES
-- ============================================

-- Team members can view team activity
CREATE POLICY "Team members can view activity"
ON team_activity FOR SELECT
USING (is_team_member(team_id, auth.uid()));

-- System creates activity logs (handled via service role)

