# Inventaire des colonnes — aligné sur `src/integrations/supabase/types.ts`

Toutes les colonnes du site sont reprises dans les scripts SQL D1.  
Types D1 : `TEXT`, `INTEGER` (booléen 0/1), dates en `TEXT` ISO (`datetime('now')`).

## 1. `blog_articles`
`id`, `title`, `excerpt`, `content`, `category`, `author`, `image_url`, `published`, `published_at`, `created_at`, `updated_at`

## 2. `blog_comments`
`id`, `article_id` (FK → `blog_articles.id` CASCADE), `author_name`, `author_email`, `content`, `approved`, `created_at`

## 3. `calendar_events`
`id`, `title`, `description`, `event_date`, `end_date`, `category`, `created_at`

## 4. `college_posts`
`id`, `title`, `content`, `author`, `image_url`, `published`, `created_at`, `updated_at`

## 5. `faculty_content`
`id`, `slug` (UNIQUE), `name`, `full_name`, `description`, `long_description`, `departments` (JSON TEXT, équivalent `string[]`), `image_url`, `created_at`, `updated_at`

## 6. `fees`
`id`, `faculty`, `cycle`, `amount`, `currency`, `description`, `display_order`, `pdf_url`, `created_at`, `updated_at`

## 7. `gallery`
`id`, `title`, `description`, `image_url`, `category`, `display_order`, `created_at`

## 8. `library_books`
`id`, `title`, `author`, `description`, `category`, `pdf_url`, `cover_url`, `published`, `display_order`, `created_at`, `updated_at`

## 9. `newsletter_subscribers`
`id`, `name`, `email` (UNIQUE), `confirmed`, `confirmation_token`, `created_at`, `confirmed_at`

## 10. `personnel`
`id`, `name`, `role`, `bio`, `photo_url`, `email`, `linkedin_url`, `display_order`, `created_at`, `updated_at`

## 11. `services`
`id`, `name`, `slug` (UNIQUE), `description`, `long_description`, `image_url`, `display_order`, `published`, `contact_email`, `created_at`, `updated_at`

## 12. `user_roles`
`id`, `user_id`, `role` (`admin` | `moderator` | `user`), contrainte `UNIQUE (user_id, role)`
