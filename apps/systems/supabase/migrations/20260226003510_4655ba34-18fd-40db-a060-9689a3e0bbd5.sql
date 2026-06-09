
-- Add note column (note sur 20) to grades table
ALTER TABLE public.grades ADD COLUMN IF NOT EXISTS note numeric DEFAULT 0;
