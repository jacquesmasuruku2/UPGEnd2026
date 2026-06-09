-- Migration: Create partners and partnership_requests tables
-- Created: 2024-05-08
-- Description: Tables for managing partners displayed on the website and partnership request submissions

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: partners
-- Purpose: Store partner organizations displayed on the Partners page
-- ============================================
CREATE TABLE IF NOT EXISTS partners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE partners IS 'Partner organizations displayed on the website';
COMMENT ON COLUMN partners.name IS 'Partner organization name';
COMMENT ON COLUMN partners.description IS 'Brief description of the partner';
COMMENT ON COLUMN partners.website_url IS 'Partner website URL';
COMMENT ON COLUMN partners.logo_url IS 'URL to partner logo image';
COMMENT ON COLUMN partners.display_order IS 'Display order for sorting (lower = first)';
COMMENT ON COLUMN partners.is_active IS 'Whether the partner is currently active and visible';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_partners_display_order ON partners(display_order);
CREATE INDEX IF NOT EXISTS idx_partners_is_active ON partners(is_active);
CREATE INDEX IF NOT EXISTS idx_partners_created_at ON partners(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (for displaying on website)
CREATE POLICY "partners_public_read" ON partners
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated users to insert partners
CREATE POLICY "partners_authenticated_insert" ON partners
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to update partners
CREATE POLICY "partners_authenticated_update" ON partners
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to delete partners
CREATE POLICY "partners_authenticated_delete" ON partners
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: partnership_requests
-- Purpose: Store partnership request form submissions
-- ============================================
CREATE TABLE IF NOT EXISTS partnership_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Section 1: Organization Information
  organization_name TEXT NOT NULL,
  organization_type TEXT NOT NULL CHECK (organization_type IN ('Entreprise', 'Université', 'ONG', 'Institution Publique', 'Autre')),
  organization_type_other TEXT,
  headquarters TEXT,
  website_url TEXT,
  sector TEXT,
  
  -- Section 2: Contact Person
  contact_name TEXT NOT NULL,
  contact_position TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  
  -- Section 3: Partnership Nature
  interests TEXT[] NOT NULL CHECK (array_length(interests, 1) >= 1),
  faculties TEXT[],
  
  -- Section 4: Proposal Details
  objectives TEXT NOT NULL CHECK (char_length(objectives) >= 200),
  resources TEXT NOT NULL CHECK (char_length(resources) >= 200),
  duration TEXT CHECK (duration IN ('Ponctuelle', '1 an', '3-5 ans', 'Indéterminée')),
  letter_of_intent_url TEXT,
  logo_url TEXT,

  -- Metadata
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Add comments for documentation
COMMENT ON TABLE partnership_requests IS 'Partnership request form submissions';
COMMENT ON COLUMN partnership_requests.organization_name IS 'Name of the organization (required)';
COMMENT ON COLUMN partnership_requests.organization_type IS 'Type of organization (required)';
COMMENT ON COLUMN partnership_requests.organization_type_other IS 'Other organization type when "Autre" is selected';
COMMENT ON COLUMN partnership_requests.headquarters IS 'Headquarters location (Country-City)';
COMMENT ON COLUMN partnership_requests.website_url IS 'Organization website URL';
COMMENT ON COLUMN partnership_requests.sector IS 'Industry sector';
COMMENT ON COLUMN partnership_requests.contact_name IS 'Contact person full name (required)';
COMMENT ON COLUMN partnership_requests.contact_position IS 'Contact person position/title';
COMMENT ON COLUMN partnership_requests.contact_email IS 'Contact person professional email (required)';
COMMENT ON COLUMN partnership_requests.contact_phone IS 'Contact person phone number';
COMMENT ON COLUMN partnership_requests.interests IS 'Array of interest domains (required, min 1)';
COMMENT ON COLUMN partnership_requests.faculties IS 'Array of targeted faculties';
COMMENT ON COLUMN partnership_requests.objectives IS 'Main objectives (required, min 200 characters)';
COMMENT ON COLUMN partnership_requests.resources IS 'Resources provided (required, min 200 characters)';
COMMENT ON COLUMN partnership_requests.duration IS 'Expected partnership duration';
COMMENT ON COLUMN partnership_requests.letter_of_intent_url IS 'URL to uploaded letter of intent PDF';
COMMENT ON COLUMN partnership_requests.logo_url IS 'URL to uploaded partner logo image';
COMMENT ON COLUMN partnership_requests.status IS 'Request status: pending, under_review, approved, rejected';
COMMENT ON COLUMN partnership_requests.notes IS 'Admin notes about the request';
COMMENT ON COLUMN partnership_requests.reviewed_at IS 'Timestamp when request was reviewed';
COMMENT ON COLUMN partnership_requests.reviewed_by IS 'ID of admin who reviewed the request';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_partnership_requests_status ON partnership_requests(status);
CREATE INDEX IF NOT EXISTS idx_partnership_requests_created_at ON partnership_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partnership_requests_organization_type ON partnership_requests(organization_type);
CREATE INDEX IF NOT EXISTS idx_partnership_requests_contact_email ON partnership_requests(contact_email);

-- Enable Row Level Security (RLS)
ALTER TABLE partnership_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public insert (form submissions don't require authentication)
CREATE POLICY "partnership_requests_public_insert" ON partnership_requests
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow authenticated users to read all requests
CREATE POLICY "partnership_requests_authenticated_read" ON partnership_requests
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to update requests (for status changes)
CREATE POLICY "partnership_requests_authenticated_update" ON partnership_requests
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to delete requests
CREATE POLICY "partnership_requests_authenticated_delete" ON partnership_requests
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Trigger to automatically update updated_at timestamp
CREATE TRIGGER update_partnership_requests_updated_at
  BEFORE UPDATE ON partnership_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKET: partners
-- Purpose: Store partner logos
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('partners', 'partners', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE BUCKET: partnership-documents
-- Purpose: Store partnership request documents (PDFs)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('partnership-documents', 'partnership-documents', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for partners bucket (logos)
CREATE POLICY "partners_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'partners');

CREATE POLICY "partners_authenticated_upload" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'partners'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "partners_authenticated_update" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'partners'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "partners_authenticated_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'partners'
    AND auth.role() = 'authenticated'
  );

-- Storage policies for images bucket - allow public upload for partnership-logos folder
CREATE POLICY "partnership_logos_public_upload" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'partnership-logos'
  );

CREATE POLICY "partnership_logos_public_read" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'partnership-logos'
  );

-- Storage policies for partnership-documents bucket (PDFs)
-- Allow public upload for partnership form submissions
CREATE POLICY "partnership_documents_public_upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'partnership-documents');

CREATE POLICY "partnership_documents_authenticated_read" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'partnership-documents'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "partnership_documents_authenticated_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'partnership-documents'
    AND auth.role() = 'authenticated'
  );

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment to insert sample partners

/*
INSERT INTO partners (name, description, website_url, display_order, is_active) VALUES
  ('Université de Goma', 'Institution partenaire pour la recherche académique', 'https://upgoma.org', 1, true),
  ('Tech Solutions', 'Partenaire technologique pour l''innovation numérique', 'https://techsolutions.com', 2, true),
  ('Global Health Initiative', 'Organisation de santé publique', 'https://ghi.org', 3, true);
*/
