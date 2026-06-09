-- =============================================================================
-- D1 — ÉTAPE 3/3 : index (après d1_console_02_triggers.sql)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_blog_comments_article_id ON blog_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published_published_at
  ON blog_articles(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_college_posts_published_created
  ON college_posts(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_display_order ON gallery(display_order);
CREATE INDEX IF NOT EXISTS idx_personnel_display_order ON personnel(display_order);
CREATE INDEX IF NOT EXISTS idx_calendar_events_event_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_fees_faculty_display ON fees(faculty, display_order);
CREATE INDEX IF NOT EXISTS idx_fees_display_order ON fees(display_order);
CREATE INDEX IF NOT EXISTS idx_faculty_content_slug ON faculty_content(slug);
CREATE INDEX IF NOT EXISTS idx_library_books_published_order
  ON library_books(published, display_order);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_published_order ON services(published, display_order);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_confirmation_token ON newsletter_subscribers(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
