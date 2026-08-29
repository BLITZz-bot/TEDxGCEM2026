-- =============================================================================
-- TEDxGCEM 2026: Direct UPI Payment & Cross-Device Handoff Migration
-- Run this script in your Supabase SQL Editor
-- =============================================================================

-- 1. Create registration_drafts table for cross-device mobile handoff & auto-login
CREATE TABLE IF NOT EXISTS public.registration_drafts (
    id TEXT PRIMARY KEY,                                      -- e.g. "draft_8f9e2a3b"
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Authenticated Google user
    auth_handoff_token TEXT UNIQUE,                           -- One-time secure token (10m TTL)
    auth_token_expires_at TIMESTAMPTZ,                        -- Expiry timestamp for handoff token
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    buyer_email TEXT,
    phone TEXT NOT NULL,
    organization TEXT,
    designation TEXT DEFAULT 'Student',
    linkedin TEXT,
    referral TEXT,
    tier_id TEXT NOT NULL,
    tier_name TEXT,
    quantity INTEGER DEFAULT 1,
    amount NUMERIC(10, 2) NOT NULL,
    coupon_code TEXT,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    attendees_json JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending',                            -- 'pending', 'confirmed', 'expired'
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);

-- Index for fast lookup by handoff token & user
CREATE INDEX IF NOT EXISTS idx_registration_drafts_token ON public.registration_drafts(auth_handoff_token);
CREATE INDEX IF NOT EXISTS idx_registration_drafts_user ON public.registration_drafts(user_id);

-- Enable Supabase Realtime on registration_drafts for instant laptop auto-sync
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'registration_drafts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.registration_drafts;
  END IF;
END $$;

-- 2. Update public.registrations table for Direct UPI proof & screenshot
ALTER TABLE public.registrations
    ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;

-- Prevent duplicate registrations using the exact same UTR number
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_utr_number 
    ON public.registrations(utr_number) 
    WHERE utr_number IS NOT NULL AND utr_number != '';

-- 3. Supabase Storage Bucket Setup for Payment Proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment-proofs',
    'payment-proofs',
    true,
    2097152, -- 2MB
    ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

-- Storage Policies (Safe to run multiple times)
DROP POLICY IF EXISTS "Public Upload Payment Proofs" ON storage.objects;
CREATE POLICY "Public Upload Payment Proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Public View Payment Proofs" ON storage.objects;
CREATE POLICY "Public View Payment Proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');
