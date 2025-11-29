-- ============================================
-- CigroTrack Database Schema for Supabase
-- Based on PRD Requirements
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================
-- USERS TABLE (FR-001 to FR-007)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 50),
  email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  password_hash VARCHAR(255), -- NULL for Google OAuth users (FR-004)
  avatar TEXT,
  auth_provider VARCHAR(20) NOT NULL DEFAULT 'email' CHECK (auth_provider IN ('email', 'google')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete (FR-071)
  
  -- Constraints
  CONSTRAINT password_required_for_email CHECK (
    (auth_provider = 'email' AND password_hash IS NOT NULL) OR
    (auth_provider = 'google' AND password_hash IS NULL)
  )
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================
-- TEAMS TABLE (FR-010 to FR-019)
-- ============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 50),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete (FR-071)
  
  -- Constraints
  CONSTRAINT team_name_not_empty CHECK (TRIM(name) != '')
);

CREATE INDEX idx_teams_owner ON teams(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_teams_deleted ON teams(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================
-- TEAM MEMBERS TABLE (FR-014, FR-017)
-- ============================================
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(10) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- ============================================
-- TEAM INVITES TABLE (FR-013)
-- ============================================
CREATE TABLE team_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
  invited_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partial unique index: only one pending invite per team+email
CREATE UNIQUE INDEX idx_team_invites_unique_pending 
ON team_invites(team_id, email) 
WHERE status = 'pending';

CREATE INDEX idx_team_invites_team ON team_invites(team_id);
CREATE INDEX idx_team_invites_email ON team_invites(email);
CREATE INDEX idx_team_invites_expires ON team_invites(expires_at) WHERE status = 'pending';

-- ============================================
-- TEAM ACTIVITY TABLE (FR-019)
-- ============================================
CREATE TABLE team_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('member', 'project', 'team', 'issue')),
  target_id UUID,
  target_name VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_team_activity_team ON team_activity(team_id, created_at DESC);
CREATE INDEX idx_team_activity_user ON team_activity(user_id);

-- ============================================
-- PROJECTS TABLE (FR-020 to FR-027)
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 100),
  description TEXT CHECK (LENGTH(description) <= 2000), -- Max 2000 chars (FR-025)
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete (FR-071)
  
  CONSTRAINT project_name_not_empty CHECK (TRIM(name) != '')
);

CREATE INDEX idx_projects_team ON projects(team_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_owner ON projects(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_deleted ON projects(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================
-- PROJECT FAVORITES TABLE (FR-027)
-- ============================================
CREATE TABLE project_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, project_id)
);

CREATE INDEX idx_project_favorites_user ON project_favorites(user_id);
CREATE INDEX idx_project_favorites_project ON project_favorites(project_id);

-- ============================================
-- CUSTOM STATUSES TABLE (FR-053)
-- ============================================
CREATE TABLE custom_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(30) NOT NULL CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 30),
  color VARCHAR(7), -- HEX color code
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, name)
);

CREATE INDEX idx_custom_statuses_project ON custom_statuses(project_id, order_index);

-- ============================================
-- WIP LIMITS TABLE (FR-054)
-- ============================================
CREATE TABLE wip_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL, -- Can be custom status or default status
  limit_value INTEGER CHECK (limit_value >= 1 AND limit_value <= 50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, status)
);

CREATE INDEX idx_wip_limits_project ON wip_limits(project_id);

-- ============================================
-- ISSUES TABLE (FR-030 to FR-039)
-- ============================================
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200),
  description TEXT CHECK (LENGTH(description) <= 5000), -- Max 5000 chars (FR-030)
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Backlog', -- Default statuses or custom
  priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
  due_date DATE,
  order_index INTEGER DEFAULT 0, -- For kanban ordering (FR-052)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete (FR-071)
  
  CONSTRAINT issue_title_not_empty CHECK (TRIM(title) != '')
);

CREATE INDEX idx_issues_project ON issues(project_id, status, order_index) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_assignee ON issues(assignee_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_reporter ON issues(reporter_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_issues_due_date ON issues(due_date) WHERE deleted_at IS NULL AND due_date IS NOT NULL;
CREATE INDEX idx_issues_deleted ON issues(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================
-- LABELS TABLE (FR-038)
-- ============================================
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 50),
  color VARCHAR(7) NOT NULL, -- HEX color code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, name)
);

CREATE INDEX idx_labels_project ON labels(project_id);

-- ============================================
-- ISSUE LABELS TABLE (FR-038 - Many-to-Many)
-- ============================================
CREATE TABLE issue_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(issue_id, label_id)
);

CREATE INDEX idx_issue_labels_issue ON issue_labels(issue_id);
CREATE INDEX idx_issue_labels_label ON issue_labels(label_id);

-- ============================================
-- SUBTASKS TABLE (FR-039-2)
-- ============================================
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL CHECK (LENGTH(title) >= 1 AND LENGTH(title) <= 200),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT subtask_title_not_empty CHECK (TRIM(title) != '')
);

CREATE INDEX idx_subtasks_issue ON subtasks(issue_id, order_index);

-- ============================================
-- COMMENTS TABLE (FR-060 to FR-063)
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 1000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete (FR-063)
  
  CONSTRAINT comment_content_not_empty CHECK (TRIM(content) != '')
);

CREATE INDEX idx_comments_issue ON comments(issue_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_author ON comments(author_id) WHERE deleted_at IS NULL;

-- ============================================
-- ISSUE CHANGE HISTORY TABLE (FR-039)
-- ============================================
CREATE TABLE issue_change_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  field_name VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_issue_history_issue ON issue_change_history(issue_id, created_at DESC);
CREATE INDEX idx_issue_history_user ON issue_change_history(user_id);

-- ============================================
-- NOTIFICATIONS TABLE (FR-090, FR-091)
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  related_id UUID, -- Can reference issue, project, team, etc.
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT notification_title_not_empty CHECK (TRIM(title) != '')
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC) WHERE read = FALSE;
CREATE INDEX idx_notifications_related ON notifications(related_id);
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================
-- AI SUMMARIES TABLE (FR-040)
-- ============================================
CREATE TABLE ai_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_points TEXT[], -- Array of strings
  model_version VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(issue_id)
);

CREATE INDEX idx_ai_summaries_issue ON ai_summaries(issue_id);

-- ============================================
-- AI RATE LIMITS TABLE (FR-042)
-- ============================================
CREATE TABLE ai_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  window_end TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, request_type, window_start)
);

CREATE INDEX idx_ai_rate_limits_user ON ai_rate_limits(user_id, window_start DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables that need it
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON subtasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log issue changes
CREATE OR REPLACE FUNCTION log_issue_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    -- Log title changes
    IF OLD.title IS DISTINCT FROM NEW.title THEN
      INSERT INTO issue_change_history (issue_id, user_id, field_name, old_value, new_value)
      VALUES (NEW.id, NEW.updated_by, 'title', OLD.title, NEW.title);
    END IF;
    
    -- Log status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO issue_change_history (issue_id, user_id, field_name, old_value, new_value)
      VALUES (NEW.id, NEW.updated_by, 'status', OLD.status, NEW.status);
    END IF;
    
    -- Add more field change logging as needed
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: We'll add updated_by to issues table in migrations if needed for change tracking

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for issue count per project
CREATE OR REPLACE VIEW project_issue_counts AS
SELECT 
  p.id as project_id,
  COUNT(i.id) FILTER (WHERE i.deleted_at IS NULL) as issue_count,
  COUNT(i.id) FILTER (WHERE i.deleted_at IS NULL AND i.status = 'Done') as completed_count,
  COUNT(i.id) FILTER (WHERE i.deleted_at IS NULL AND i.due_date < CURRENT_DATE AND i.status != 'Done') as overdue_count
FROM projects p
LEFT JOIN issues i ON i.project_id = p.id
WHERE p.deleted_at IS NULL
GROUP BY p.id;

-- ============================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wip_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies will be created in a separate file (rls-policies.sql)
-- This allows for easier management and updates

-- ============================================
-- INITIAL DATA (OPTIONAL)
-- ============================================

-- You can add default data here if needed
-- For example, default statuses, etc.

COMMENT ON TABLE users IS 'User accounts with authentication (FR-001 to FR-007)';
COMMENT ON TABLE teams IS 'Teams that users can belong to (FR-010 to FR-019)';
COMMENT ON TABLE projects IS 'Projects within teams, max 15 per team (FR-020 to FR-027)';
COMMENT ON TABLE issues IS 'Issues within projects, max 200 per project (FR-030 to FR-039)';
COMMENT ON TABLE comments IS 'Comments on issues, max 1000 chars (FR-060 to FR-063)';

