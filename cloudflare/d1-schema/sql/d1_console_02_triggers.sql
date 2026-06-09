-- =============================================================================
-- D1 — ÉTAPE 2/3 : triggers updated_at (après d1_console_01_tables.sql)
-- =============================================================================

CREATE TRIGGER IF NOT EXISTS trg_blog_articles_updated_at
BEFORE UPDATE ON blog_articles
FOR EACH ROW
BEGIN
  NEW.updated_at = datetime('now');
END;

CREATE TRIGGER IF NOT EXISTS trg_college_posts_updated_at
BEFORE UPDATE ON college_posts
FOR EACH ROW
BEGIN
  NEW.updated_at = datetime('now');
END;

CREATE TRIGGER IF NOT EXISTS trg_faculty_content_updated_at
BEFORE UPDATE ON faculty_content
FOR EACH ROW
BEGIN
  NEW.updated_at = datetime('now');
END;

CREATE TRIGGER IF NOT EXISTS trg_fees_updated_at
BEFORE UPDATE ON fees
FOR EACH ROW
BEGIN
  NEW.updated_at = datetime('now');
END;

CREATE TRIGGER IF NOT EXISTS trg_library_books_updated_at
BEFORE UPDATE ON library_books
FOR EACH ROW
BEGIN
  NEW.updated_at = datetime('now');
END;

CREATE TRIGGER IF NOT EXISTS trg_personnel_updated_at
BEFORE UPDATE ON personnel
FOR EACH ROW
BEGIN
  NEW.updated_at = datetime('now');
END;

CREATE TRIGGER IF NOT EXISTS trg_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
BEGIN
  NEW.updated_at = datetime('now');
END;
