-- =============================================================================
-- TEDxGCEM 2026: Complete Direct UPI, Handoff, Multi-Ticket & Admin Approvals Migration
-- Master idempotent script (Safe to run in Supabase SQL Editor anytime)
-- =============================================================================
--
-- ⚡ QUICK RUN (If you only need the latest Admin Approval + Multi-Ticket columns):
-- Copy and run these lines:
--
-- ALTER TABLE public.registrations
--     ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT,
--     ADD COLUMN IF NOT EXISTS attendees_json JSONB DEFAULT '[]'::jsonb,
--     ADD COLUMN IF NOT EXISTS unit_price NUMERIC,
--     ADD COLUMN IF NOT EXISTS ticket_count INTEGER DEFAULT 1,
--     ADD COLUMN IF NOT EXISTS buyer_email TEXT,
--     ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'Student',
--     ADD COLUMN IF NOT EXISTS referral TEXT,
--     ADD COLUMN IF NOT EXISTS utr_number TEXT,
--     ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'direct_upi',
--     ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending_approval';
--
-- CREATE INDEX IF NOT EXISTS idx_registrations_approval_status
--     ON public.registrations(approval_status);
--
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TICKET TIERS TABLE (With Live Admin Pricing & Seat Capacity Controls)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ticket_tiers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tag TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    total_capacity INTEGER NOT NULL,
    allow_coupons BOOLEAN DEFAULT false NOT NULL,
    discount_price NUMERIC,
    status TEXT DEFAULT 'upcoming' NOT NULL, -- 'active' | 'upcoming' | 'sold_out' | 'closed'
    sort_order INTEGER NOT NULL,
    manual_override BOOLEAN DEFAULT false NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed initial 4 ticket tiers (only if not already present)
INSERT INTO public.ticket_tiers (id, name, tag, description, price, total_capacity, allow_coupons, discount_price, status, sort_order)
VALUES 
  ('early_bird', 'Early Bird', 'Priority Pass', 'Exclusive early bird access pass with curated kit and all speaker sessions.', 300, 20, false, null, 'active', 1),
  ('phase_1', 'Phase 1', 'Phase 1 Pass', 'Official Phase 1 delegate pass including keynote talks, delegate kit, and networking.', 400, 35, true, 300, 'upcoming', 2),
  ('phase_2', 'Phase 2', 'Phase 2 Pass', 'Phase 2 standard admission with access to all speaker presentations and event goodies.', 500, 35, true, 400, 'upcoming', 3),
  ('phase_3', 'Phase 3', 'Final Release', 'Final release general delegate pass with elite networking opportunities.', 1000, 10, true, 500, 'upcoming', 4)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. 10-MINUTE PROMO PASSCODES (COUPONS) TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_amount NUMERIC NOT NULL,
    applies_to_tier TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT false NOT NULL,
    used_by_email TEXT,
    used_by_name TEXT,
    used_by_phone TEXT,
    used_by_org TEXT,
    used_at TIMESTAMPTZ,
    registration_id UUID,
    tier_id TEXT,
    amount_paid NUMERIC
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_used ON public.coupons(is_used);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. REGISTRATION DRAFTS TABLE (Cross-Device Mobile QR Handoff & Auto-Sync)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.registration_drafts (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    auth_handoff_token TEXT UNIQUE,
    auth_token_expires_at TIMESTAMPTZ,
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
    status TEXT DEFAULT 'pending', -- 'pending' | 'submitted' | 'confirmed' | 'expired'
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_registration_drafts_token ON public.registration_drafts(auth_handoff_token);
CREATE INDEX IF NOT EXISTS idx_registration_drafts_user ON public.registration_drafts(user_id);

-- Enable Supabase Realtime for instant laptop auto-sync when mobile finishes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'registration_drafts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.registration_drafts;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. REGISTRATIONS TABLE COLUMN UPDATES & ANTI-FRAUD UTR PROTECTION
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.registrations
    ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT,
    ADD COLUMN IF NOT EXISTS attendees_json JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS unit_price NUMERIC,
    ADD COLUMN IF NOT EXISTS ticket_count INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS buyer_email TEXT,
    ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'Student',
    ADD COLUMN IF NOT EXISTS referral TEXT,
    ADD COLUMN IF NOT EXISTS utr_number TEXT,
    ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'direct_upi',
    -- Approval workflow: 'pending_approval' | 'approved' | 'rejected'
    ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending_approval';

-- Unique constraint on UTR to prevent double-spending / duplicate receipts
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_utr_number 
    ON public.registrations(utr_number) 
    WHERE utr_number IS NOT NULL AND utr_number != '';

-- Index for fast admin approval queue queries
CREATE INDEX IF NOT EXISTS idx_registrations_approval_status
    ON public.registrations(approval_status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. PAYMENT PROOFS STORAGE BUCKET (2MB Limit, Public Read, Secure Upload)
-- ─────────────────────────────────────────────────────────────────────────────
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

-- Storage Access Policies (Drop and recreate safely in storage schema)
DROP POLICY IF EXISTS "Public Upload Payment Proofs" ON storage.objects;
CREATE POLICY "Public Upload Payment Proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Public View Payment Proofs" ON storage.objects;
CREATE POLICY "Public View Payment Proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_drafts ENABLE ROW LEVEL SECURITY;

-- Ticket Tiers: Public can view, Admin can update
DROP POLICY IF EXISTS "Allow public read access to ticket tiers" ON public.ticket_tiers;
CREATE POLICY "Allow public read access to ticket tiers"
ON public.ticket_tiers FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin to manage ticket tiers" ON public.ticket_tiers;
CREATE POLICY "Allow admin to manage ticket tiers"
ON public.ticket_tiers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Coupons: Public can validate, Admin can manage
DROP POLICY IF EXISTS "Allow public read access to coupons" ON public.coupons;
CREATE POLICY "Allow public read access to coupons"
ON public.coupons FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin to manage coupons" ON public.coupons;
CREATE POLICY "Allow admin to manage coupons"
ON public.coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Registration Drafts: Public access for handoff session creation and verification
DROP POLICY IF EXISTS "Allow public read and write access to registration drafts" ON public.registration_drafts;
CREATE POLICY "Allow public read and write access to registration drafts"
ON public.registration_drafts FOR ALL TO public USING (true) WITH CHECK (true);
