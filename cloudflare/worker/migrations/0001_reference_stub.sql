-- =============================================================================
-- RÉFÉRENCE D1 / SQLite UNIQUEMENT — ne s’applique PAS à Supabase / Postgres.
-- Objectif : amorcer une base D1 de préproduction pour le Worker.
-- Les types diffèrent de PostgreSQL (uuid → TEXT, text[] → TEXT JSON, etc.).
-- Compléter table par table en vous inspirant de supabase/migrations/*.sql.
-- =============================================================================

-- Exemple minimal : table frais (alignée conceptuellement sur public.fees)
CREATE TABLE IF NOT EXISTS fees (
  id TEXT PRIMARY KEY,
  faculty TEXT NOT NULL,
  cycle TEXT NOT NULL DEFAULT 'Licence',
  amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  display_order INTEGER DEFAULT 0,
  pdf_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_fees_faculty ON fees(faculty);

-- Tables à porter ultérieurement (liste mémo) :
-- personnel, blog_articles, blog_comments, gallery, college_posts,
-- calendar_events, faculty_content, library_books, services,
-- newsletter_subscribers, user_roles
