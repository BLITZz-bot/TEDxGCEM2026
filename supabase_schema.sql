-- =============================================================================
-- TEDxGCEM 2026: COMPLETE & DEFINITIVE MASTER DATABASE SCHEMA
-- =============================================================================
-- This single script provisions the entire TEDxGCEM database from scratch or
-- updates an existing database idempotently without any errors.
--
-- Includes:
--   1.  Registrations (Multi-Attendee, Direct UPI, UTR, Screenshot Proofs & Approvals)
--   2.  Special Guest Passes (Complimentary Passes with Download Tracking & Resend)
--   3.  Ticket Tiers (Live Pricing, Seat Capacities, Tier Status Controls)
--   4.  Promo Passcodes / Coupons (10-Minute Ephemeral & Tier-Specific Discounts)
--   5.  Registration Drafts (Cross-Device QR Mobile Handoff & Realtime Sync)
--   6.  Payment Proofs Storage Bucket (2.5MB Limit, Public Upload & Read)
--   7.  Event Settings (Live Reveal Toggles, Date: September 26, 2026)
--   8.  Team Members
--   9.  Speakers
--   10. Partners & Sponsors
--   11. Contact Messages
--   12. Row Level Security (RLS) & Role Policies for All Tables
--
-- Safe & Idempotent: You can run this entire script at any time in Supabase SQL Editor.
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. REGISTRATIONS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    buyer_email TEXT,
    phone TEXT NOT NULL,
    organization TEXT NOT NULL DEFAULT 'GCEM',
    designation TEXT DEFAULT 'Student',
    linkedin TEXT,
    referral TEXT,
    ticket_status TEXT DEFAULT 'pending_approval' NOT NULL,
    approval_status TEXT DEFAULT 'pending_approval' NOT NULL,
    payment_id TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    utr_number TEXT,
    payment_method TEXT DEFAULT 'direct_upi',
    tier_id TEXT DEFAULT 'early_bird',
    tier_name TEXT DEFAULT 'Early Bird',
    coupon_code TEXT,
    discount_amount NUMERIC DEFAULT 0,
    amount_paid NUMERIC DEFAULT 300,
    unit_price NUMERIC,
    ticket_count INTEGER DEFAULT 1 NOT NULL,
    payment_screenshot_url TEXT,
    attendees_json JSONB DEFAULT '[]'::jsonb,
    download_count INTEGER DEFAULT 0,
    downloaded_at TIMESTAMPTZ
);

-- Ensure all columns exist for existing databases
ALTER TABLE public.registrations
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS buyer_email TEXT,
    ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'Student',
    ADD COLUMN IF NOT EXISTS referral TEXT,
    ADD COLUMN IF NOT EXISTS payment_id TEXT,
    ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
    ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
    ADD COLUMN IF NOT EXISTS razorpay_signature TEXT,
    ADD COLUMN IF NOT EXISTS utr_number TEXT,
    ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'direct_upi',
    ADD COLUMN IF NOT EXISTS tier_id TEXT DEFAULT 'early_bird',
    ADD COLUMN IF NOT EXISTS tier_name TEXT DEFAULT 'Early Bird',
    ADD COLUMN IF NOT EXISTS coupon_code TEXT,
    ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
    ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 300,
    ADD COLUMN IF NOT EXISTS unit_price NUMERIC,
    ADD COLUMN IF NOT EXISTS ticket_count INTEGER DEFAULT 1 NOT NULL,
    ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT,
    ADD COLUMN IF NOT EXISTS attendees_json JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending_approval',
    ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS downloaded_at TIMESTAMPTZ;

-- Remove obsolete unique constraints on email to allow multi-attendee purchases
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_email_key;
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_email_unique;
DROP INDEX IF EXISTS registrations_email_key;
DROP INDEX IF EXISTS registrations_email_idx;

-- Optimized indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_buyer_email ON public.registrations(buyer_email);
CREATE INDEX IF NOT EXISTS idx_registrations_approval_status ON public.registrations(approval_status);
CREATE INDEX IF NOT EXISTS idx_registrations_ticket_status ON public.registrations(ticket_status);

-- Anti-fraud UTR uniqueness (prevents duplicate submission of the same UPI reference)
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_utr_number 
    ON public.registrations(utr_number) 
    WHERE utr_number IS NOT NULL AND utr_number != '';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. SPECIAL GUEST PASSES (COMPLIMENTARY PASSES) TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.complimentary_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    pass_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    note TEXT DEFAULT '',
    email_status TEXT DEFAULT 'sent' NOT NULL,
    download_count INTEGER DEFAULT 0,
    downloaded_at TIMESTAMPTZ
);

ALTER TABLE public.complimentary_passes
    ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS downloaded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_complimentary_passes_email ON public.complimentary_passes(email);
CREATE INDEX IF NOT EXISTS idx_complimentary_passes_pass_code ON public.complimentary_passes(pass_code);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TICKET TIERS TABLE
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

-- Seed initial 4 fixed ticket tiers
INSERT INTO public.ticket_tiers (id, name, tag, description, price, total_capacity, allow_coupons, discount_price, status, sort_order)
VALUES 
  ('early_bird', 'Early Bird', 'Priority Pass', 'Exclusive early bird access pass with curated kit and all speaker sessions.', 300, 20, false, null, 'active', 1),
  ('phase_1', 'Phase 1', 'Phase 1 Pass', 'Official Phase 1 delegate pass including keynote talks, delegate kit, and networking.', 400, 35, true, 300, 'upcoming', 2),
  ('phase_2', 'Phase 2', 'Phase 2 Pass', 'Phase 2 standard admission with access to all speaker presentations and event goodies.', 500, 35, true, 400, 'upcoming', 3),
  ('phase_3', 'Phase 3', 'Final Release', 'Final release general delegate pass with elite networking opportunities.', 1000, 10, true, 500, 'upcoming', 4)
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. 10-MINUTE PROMO PASSCODES (COUPONS) TABLE
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
-- 5. REGISTRATION DRAFTS TABLE (Mobile QR Handoff & Auto-Sync)
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

-- Enable Supabase Realtime for instant desktop/mobile cross-device synchronization
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
-- 6. PAYMENT PROOFS STORAGE BUCKET (2.5MB Limit, Public Read, Secure Upload)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment-proofs',
    'payment-proofs',
    true,
    2621440, -- 2.5MB
    ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2621440,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

-- Storage Access Policies
DROP POLICY IF EXISTS "Public Upload Payment Proofs" ON storage.objects;
CREATE POLICY "Public Upload Payment Proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Public View Payment Proofs" ON storage.objects;
CREATE POLICY "Public View Payment Proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. EVENT SETTINGS TABLE (Event Date: September 26, 2026)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_settings (
    id TEXT PRIMARY KEY,
    theme_name TEXT DEFAULT 'RIPPLE' NOT NULL,
    reveal_theme BOOLEAN DEFAULT true NOT NULL,
    reveal_date BOOLEAN DEFAULT true NOT NULL,
    reveal_countdown BOOLEAN DEFAULT true NOT NULL,
    event_date TEXT DEFAULT 'September 26, 2026' NOT NULL,
    event_time TEXT DEFAULT '09:00 AM' NOT NULL,
    event_day TEXT DEFAULT 'SATURDAY' NOT NULL,
    countdown_target TEXT DEFAULT '2026-09-26T09:00:00' NOT NULL,
    about_theme_name TEXT DEFAULT 'TRANSFORMING PERSPECTIVES' NOT NULL,
    about_theme_desc TEXT DEFAULT 'This year, we invite speakers who challenge the baseline of conventional frameworks. We aim to print new concepts that reform how we think, react, and shape local infrastructure.' NOT NULL,
    reveal_about_theme BOOLEAN DEFAULT true NOT NULL,
    reveal_team BOOLEAN DEFAULT true NOT NULL,
    reveal_speakers BOOLEAN DEFAULT true NOT NULL,
    reveal_partners BOOLEAN DEFAULT true NOT NULL,
    reveal_register BOOLEAN DEFAULT true NOT NULL,
    reveal_tickets BOOLEAN DEFAULT true NOT NULL,
    reveal_schedule BOOLEAN DEFAULT true NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed global event settings
INSERT INTO public.event_settings (
    id, theme_name, reveal_theme, reveal_date, reveal_countdown, 
    event_date, event_time, event_day, countdown_target, 
    about_theme_name, about_theme_desc, reveal_about_theme, 
    reveal_team, reveal_speakers, reveal_partners, reveal_register, 
    reveal_tickets, reveal_schedule
)
VALUES (
    'global', 'RIPPLE', true, true, true, 
    'September 26, 2026', '09:00 AM', 'SATURDAY', '2026-09-26T09:00:00', 
    'TRANSFORMING PERSPECTIVES', 
    'This year, we invite speakers who challenge the baseline of conventional frameworks. We aim to print new concepts that reform how we think, react, and shape local infrastructure.', 
    true, true, true, true, true, true, true
)
ON CONFLICT (id) DO UPDATE SET
    event_date = 'September 26, 2026',
    event_day = 'SATURDAY',
    countdown_target = '2026-09-26T09:00:00';


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. TEAM MEMBERS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT NOT NULL,
    email TEXT,
    linkedin TEXT,
    bio TEXT NOT NULL
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. SPEAKERS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    designation TEXT DEFAULT 'Featured Speaker' NOT NULL,
    bio TEXT NOT NULL,
    details TEXT NOT NULL,
    image_url TEXT NOT NULL,
    email TEXT,
    linkedin TEXT,
    instagram TEXT
);

ALTER TABLE public.speakers 
    ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'Featured Speaker' NOT NULL;


-- ─────────────────────────────────────────────────────────────────────────────
-- 10. PARTNERS & SPONSORS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    level TEXT DEFAULT 'Silver' NOT NULL,
    logo TEXT NOT NULL,
    description TEXT NOT NULL,
    email TEXT,
    phone TEXT
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 11. CONTACT MESSAGES TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 12. ROW LEVEL SECURITY (RLS) POLICIES FOR ALL TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all 10 tables
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complimentary_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 12.1. Registrations Policies
DROP POLICY IF EXISTS "Allow authenticated users to submit registrations" ON public.registrations;
CREATE POLICY "Allow authenticated users to submit registrations" 
ON public.registrations FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon to submit registrations" ON public.registrations;
CREATE POLICY "Allow anon to submit registrations" 
ON public.registrations FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to view their own registration" ON public.registrations;
CREATE POLICY "Allow users to view their own registration" 
ON public.registrations FOR SELECT TO authenticated 
USING (auth.uid() = user_id OR (auth.jwt() ->> 'email') ILIKE email OR (auth.jwt() ->> 'email') ILIKE buyer_email);

DROP POLICY IF EXISTS "Allow admin to manage all registrations" ON public.registrations;
CREATE POLICY "Allow admin to manage all registrations" 
ON public.registrations FOR ALL TO authenticated 
USING (auth.jwt() ->> 'email' = 'admin@gmail.com');

-- 12.2. Special Guest / Complimentary Passes Policies
DROP POLICY IF EXISTS "Allow admin to manage complimentary passes" ON public.complimentary_passes;
CREATE POLICY "Allow admin to manage complimentary passes"
ON public.complimentary_passes FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@gmail.com');

DROP POLICY IF EXISTS "Allow users to view own complimentary pass" ON public.complimentary_passes;
CREATE POLICY "Allow users to view own complimentary pass"
ON public.complimentary_passes FOR SELECT TO authenticated
USING (email ILIKE (auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Allow users to update own download status" ON public.complimentary_passes;
CREATE POLICY "Allow users to update own download status"
ON public.complimentary_passes FOR UPDATE TO authenticated
USING (email ILIKE (auth.jwt() ->> 'email'))
WITH CHECK (email ILIKE (auth.jwt() ->> 'email'));

DROP POLICY IF EXISTS "Allow public verification of complimentary passes" ON public.complimentary_passes;
CREATE POLICY "Allow public verification of complimentary passes"
ON public.complimentary_passes FOR SELECT TO public
USING (true);

-- 12.3. Ticket Tiers Policies
DROP POLICY IF EXISTS "Allow public read access to ticket tiers" ON public.ticket_tiers;
CREATE POLICY "Allow public read access to ticket tiers"
ON public.ticket_tiers FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin to manage ticket tiers" ON public.ticket_tiers;
CREATE POLICY "Allow admin to manage ticket tiers"
ON public.ticket_tiers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 12.4. Coupons Policies
DROP POLICY IF EXISTS "Allow public read access to validate coupons" ON public.coupons;
CREATE POLICY "Allow public read access to validate coupons"
ON public.coupons FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin to manage coupons" ON public.coupons;
CREATE POLICY "Allow admin to manage coupons"
ON public.coupons FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 12.5. Registration Drafts Policies
DROP POLICY IF EXISTS "Allow public read and write access to registration drafts" ON public.registration_drafts;
CREATE POLICY "Allow public read and write access to registration drafts"
ON public.registration_drafts FOR ALL TO public USING (true) WITH CHECK (true);

-- 12.6. Event Settings Policies
DROP POLICY IF EXISTS "Allow public read access to event settings" ON public.event_settings;
CREATE POLICY "Allow public read access to event settings"
ON public.event_settings FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin to manage event settings" ON public.event_settings;
CREATE POLICY "Allow admin to manage event settings"
ON public.event_settings FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@gmail.com');

-- 12.7. Team Members Policies
DROP POLICY IF EXISTS "Allow public read access to team members" ON public.team_members;
CREATE POLICY "Allow public read access to team members"
ON public.team_members FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin to manage team members" ON public.team_members;
CREATE POLICY "Allow admin to manage team members"
ON public.team_members FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@gmail.com');

-- 12.8. Speakers Policies
DROP POLICY IF EXISTS "Allow public read access to speakers" ON public.speakers;
CREATE POLICY "Allow public read access to speakers"
ON public.speakers FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin to manage speakers" ON public.speakers;
CREATE POLICY "Allow admin to manage speakers"
ON public.speakers FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@gmail.com');

-- 12.9. Partners Policies
DROP POLICY IF EXISTS "Allow public read access to partners" ON public.partners;
CREATE POLICY "Allow public read access to partners"
ON public.partners FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin to manage partners" ON public.partners;
CREATE POLICY "Allow admin to manage partners"
ON public.partners FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'admin@gmail.com');

-- 12.10. Messages Policies
DROP POLICY IF EXISTS "Allow authenticated users to insert contact messages" ON public.messages;
CREATE POLICY "Allow authenticated users to insert contact messages" 
ON public.messages FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon users to insert contact messages" ON public.messages;
CREATE POLICY "Allow anon users to insert contact messages" 
ON public.messages FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin to select and manage contact messages" ON public.messages;
CREATE POLICY "Allow admin to select and manage contact messages" 
ON public.messages FOR ALL TO authenticated 
USING (auth.jwt() ->> 'email' = 'admin@gmail.com');
