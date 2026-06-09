-- Compteurs publics: vues + likes pour blog et college_posts
ALTER TABLE public.blog_articles
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.college_posts
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS likes_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_blog_article_views(p_article_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.blog_articles
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_article_id
    AND published = true
  RETURNING views_count INTO v_count;

  RETURN COALESCE(v_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_blog_article_likes(p_article_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.blog_articles
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = p_article_id
    AND published = true
  RETURNING likes_count INTO v_count;

  RETURN COALESCE(v_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_college_post_views(p_post_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.college_posts
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_post_id
    AND published = true
  RETURNING views_count INTO v_count;

  RETURN COALESCE(v_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_college_post_likes(p_post_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.college_posts
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = p_post_id
    AND published = true
  RETURNING likes_count INTO v_count;

  RETURN COALESCE(v_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_blog_article_views(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_blog_article_likes(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_college_post_views(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_college_post_likes(uuid) TO anon, authenticated;
