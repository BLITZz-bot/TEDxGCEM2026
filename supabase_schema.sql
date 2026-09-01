-- =============================================================================
-- TEDxGCEM 2026 COMPLETE & IDEMPOTENT SUPABASE DATABASE SCHEMA
-- Safe to run multiple times in your Supabase SQL Editor
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. REGISTRATIONS TABLE & MIGRATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    buyer_email TEXT,
    phone TEXT NOT NULL,
    organization TEXT NOT NULL,
    designation TEXT DEFAULT 'Student',
    linkedin TEXT,
    referral TEXT,
    ticket_status TEXT DEFAULT 'pending_approval' NOT NULL,
    payment_id TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    utr_number TEXT,
    payment_method TEXT DEFAULT 'online',
    tier_id TEXT DEFAULT 'early_bird',
    tier_name TEXT DEFAULT 'Early Bird',
    coupon_code TEXT,
    discount_amount NUMERIC DEFAULT 0,
    amount_paid NUMERIC DEFAULT 300,
    ticket_count INTEGER DEFAULT 1 NOT NULL
);

-- Ensure all columns exist and unique email constraint is dropped if table was created previously
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_email_key;
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_email_unique;
DROP INDEX IF EXISTS registrations_email_key;
DROP INDEX IF EXISTS registrations_email_idx;

ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS buyer_email TEXT,
ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'Student',
ADD COLUMN IF NOT EXISTS referral TEXT,
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT,
ADD COLUMN IF NOT EXISTS utr_number TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'online',
ADD COLUMN IF NOT EXISTS tier_id TEXT DEFAULT 'early_bird',
ADD COLUMN IF NOT EXISTS tier_name TEXT DEFAULT 'Early Bird',
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 300,
ADD COLUMN IF NOT EXISTS unit_price NUMERIC,
ADD COLUMN IF NOT EXISTS ticket_count INTEGER DEFAULT 1 NOT NULL,
ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT,
ADD COLUMN IF NOT EXISTS attendees_json JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_buyer_email ON public.registrations(buyer_email);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. MESSAGES TABLE
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
-- 3. EVENT SETTINGS TABLE & MIGRATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_settings (
    id TEXT PRIMARY KEY,
    theme_name TEXT DEFAULT 'RIPPLE' NOT NULL,
    reveal_theme BOOLEAN DEFAULT true NOT NULL,
    reveal_date BOOLEAN DEFAULT true NOT NULL,
    reveal_countdown BOOLEAN DEFAULT true NOT NULL,
    event_date TEXT DEFAULT 'October 15, 2026' NOT NULL,
    event_time TEXT DEFAULT '09:00 AM' NOT NULL,
    event_day TEXT DEFAULT 'THURSDAY' NOT NULL,
    countdown_target TEXT DEFAULT '2026-10-15T09:00:00' NOT NULL,
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

-- Ensure all event_settings columns exist if table already exists
ALTER TABLE public.event_settings 
ADD COLUMN IF NOT EXISTS about_theme_name TEXT DEFAULT 'TRANSFORMING PERSPECTIVES' NOT NULL,
ADD COLUMN IF NOT EXISTS about_theme_desc TEXT DEFAULT 'This year, we invite speakers who challenge the baseline of conventional frameworks. We aim to print new concepts that reform how we think, react, and shape local infrastructure.' NOT NULL,
ADD COLUMN IF NOT EXISTS reveal_about_theme BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS reveal_team BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS reveal_speakers BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS reveal_partners BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS reveal_register BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS reveal_tickets BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS reveal_schedule BOOLEAN DEFAULT true NOT NULL;

-- Seed initial settings row
INSERT INTO public.event_settings (id, theme_name, reveal_theme, reveal_date, reveal_countdown, event_date, event_time, event_day, countdown_target, about_theme_name, about_theme_desc, reveal_about_theme, reveal_team, reveal_speakers, reveal_partners, reveal_register, reveal_tickets, reveal_schedule)
VALUES ('global', 'RIPPLE', true, true, true, 'October 15, 2026', '09:00 AM', 'THURSDAY', '2026-10-15T09:00:00', 'TRANSFORMING PERSPECTIVES', 'This year, we invite speakers who challenge the baseline of conventional frameworks. We aim to print new concepts that reform how we think, react, and shape local infrastructure.', true, true, true, true, true, true, true)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TEAM MEMBERS TABLE
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
-- 5. SPEAKERS TABLE
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
-- 6. PARTNERS TABLE
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
-- 7. TICKET TIERS TABLE
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
    status TEXT DEFAULT 'upcoming' NOT NULL,
    sort_order INTEGER NOT NULL,
    manual_override BOOLEAN DEFAULT false NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed initial fixed ticket tiers
INSERT INTO public.ticket_tiers (id, name, tag, description, price, total_capacity, allow_coupons, discount_price, status, sort_order)
VALUES 
  ('early_bird', 'Early Bird', 'Priority Pass', 'Exclusive early bird access pass with curated kit and all speaker sessions.', 300, 20, false, null, 'active', 1),
  ('phase_1', 'Phase 1', 'Phase 1 Pass', 'Official Phase 1 delegate pass including keynote talks, delegate kit, and networking.', 400, 35, true, 300, 'upcoming', 2),
  ('phase_2', 'Phase 2', 'Phase 2 Pass', 'Phase 2 standard admission with access to all speaker presentations and event goodies.', 500, 35, true, 400, 'upcoming', 3),
  ('phase_3', 'Phase 3', 'Final Release', 'Final release general delegate pass with elite networking opportunities.', 1000, 10, true, 500, 'upcoming', 4)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. 10-MINUTE PROMO PASSCODES (COUPONS) TABLE
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. RLS POLICIES (DROP & RECREATE SAFELY)
-- ─────────────────────────────────────────────────────────────────────────────

-- Registrations Policies
DROP POLICY IF EXISTS "Allow authenticated users to submit registrations" ON public.registrations;
CREATE POLICY "Allow authenticated users to submit registrations" 
ON public.registrations FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to view their own registration" ON public.registrations;
CREATE POLICY "Allow users to view their own registration" 
ON public.registrations FOR SELECT TO authenticated 
USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = email OR auth.jwt() ->> 'email' = buyer_email);

DROP POLICY IF EXISTS "Allow admin to manage all registrations" ON public.registrations;
CREATE POLICY "Allow admin to manage all registrations" 
ON public.registrations FOR ALL TO authenticated 
USING (auth.jwt() ->> 'email' = 'tedxgcem@gmail.com');

-- Messages Policies
DROP POLICY IF EXISTS "Allow authenticated users to insert contact messages" ON public.messages;
CREATE POLICY "Allow authenticated users to insert contact messages" 
ON public.messages FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin to select and manage contact messages" ON public.messages;
CREATE POLICY "Allow admin to select and manage contact messages" 
ON public.messages FOR ALL TO authenticated 
USING (auth.jwt() ->> 'email' = 'tedxgcem@gmail.com');

-- Event Settings Policies
DROP POLICY IF EXISTS "Allow public read access to event settings" ON public.event_settings;
CREATE POLICY "Allow public read access to event settings"
ON public.event_settings FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin to manage event settings" ON public.event_settings;
CREATE POLICY "Allow admin to manage event settings"
ON public.event_settings FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'tedxgcem@gmail.com');

-- Team Members Policies
DROP POLICY IF EXISTS "Allow public read access to team members" ON public.team_members;
CREATE POLICY "Allow public read access to team members"
ON public.team_members FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin to manage team members" ON public.team_members;
CREATE POLICY "Allow admin to manage team members"
ON public.team_members FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'tedxgcem@gmail.com');

-- Speakers Policies
DROP POLICY IF EXISTS "Allow public read access to speakers" ON public.speakers;
CREATE POLICY "Allow public read access to speakers"
ON public.speakers FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin to manage speakers" ON public.speakers;
CREATE POLICY "Allow admin to manage speakers"
ON public.speakers FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'tedxgcem@gmail.com');

-- Partners Policies
DROP POLICY IF EXISTS "Allow public read access to partners" ON public.partners;
CREATE POLICY "Allow public read access to partners"
ON public.partners FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin to manage partners" ON public.partners;
CREATE POLICY "Allow admin to manage partners"
ON public.partners FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'tedxgcem@gmail.com');

-- Ticket Tiers Policies
DROP POLICY IF EXISTS "Allow public read access to ticket tiers" ON public.ticket_tiers;
CREATE POLICY "Allow public read access to ticket tiers"
ON public.ticket_tiers FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin to manage ticket tiers" ON public.ticket_tiers;
CREATE POLICY "Allow admin to manage ticket tiers"
ON public.ticket_tiers FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'tedxgcem@gmail.com');

-- Coupons Policies
DROP POLICY IF EXISTS "Allow public read access to validate coupons" ON public.coupons;
CREATE POLICY "Allow public read access to validate coupons"
ON public.coupons FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow admin to manage coupons" ON public.coupons;
CREATE POLICY "Allow admin to manage coupons"
ON public.coupons FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'tedxgcem@gmail.com');
