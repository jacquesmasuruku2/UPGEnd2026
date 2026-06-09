
-- Add image_url to announcements for Valve images
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS image_url text;

-- Add published flag to grades to control visibility
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;
