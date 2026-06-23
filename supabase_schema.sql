-- ==========================================
-- TEDxGCEM 2026 Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. REGISTRATIONS TABLE
-- Stores attendee ticket registrations and passes
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    organization TEXT NOT NULL,
    linkedin TEXT,
    ticket_status TEXT DEFAULT 'pending_approval' NOT NULL,
    payment_id TEXT -- For future Razorpay transactions
);

-- 2. MESSAGES TABLE
-- Stores contact form message transmissions
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. MESSAGES SECURITY POLICIES
-- Allow any authenticated user to send a contact message
CREATE POLICY "Allow authenticated users to insert contact messages" 
ON public.messages 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow only the admin to view/manage contact messages
-- (Replace 'tedxgcem@gmail.com' with your actual admin email if different)
CREATE POLICY "Allow admin to select and manage contact messages" 
ON public.messages 
FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'email' = 'tedxgcem@gmail.com');

-- 5. REGISTRATIONS SECURITY POLICIES
-- Allow any authenticated user to register
CREATE POLICY "Allow authenticated users to submit registrations" 
ON public.registrations 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow users to view their own registration details
CREATE POLICY "Allow users to view their own registration" 
ON public.registrations 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = email);

-- Allow only the admin to manage/update all registrations (approve/revoke/delete)
CREATE POLICY "Allow admin to manage all registrations" 
ON public.registrations 
FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'email' = 'tedxgcem@gmail.com');

-- 6. EVENT SETTINGS TABLE
-- Stores global configurable settings for the event
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
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Insert initial settings row if not present
INSERT INTO public.event_settings (id, theme_name, reveal_theme, reveal_date, reveal_countdown, event_date, event_time, event_day, countdown_target, about_theme_name, about_theme_desc, reveal_about_theme)
VALUES ('global', 'RIPPLE', true, true, true, 'October 15, 2026', '09:00 AM', 'THURSDAY', '2026-10-15T09:00:00', 'TRANSFORMING PERSPECTIVES', 'This year, we invite speakers who challenge the baseline of conventional frameworks. We aim to print new concepts that reform how we think, react, and shape local infrastructure.', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to anyone (public)
CREATE POLICY "Allow public read access to event settings"
ON public.event_settings
FOR SELECT
TO public
USING (true);

-- Allow write/management only to the admin
CREATE POLICY "Allow admin to manage event settings"
ON public.event_settings
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = 'tedxgcem@gmail.com');

-- 7. DATABASE MIGRATION FOR UPDATED FIELDS
-- Execute this query if the event_settings table already exists in your database:
-- ALTER TABLE public.event_settings 
-- ADD COLUMN IF NOT EXISTS about_theme_name TEXT DEFAULT 'TRANSFORMING PERSPECTIVES' NOT NULL,
-- ADD COLUMN IF NOT EXISTS about_theme_desc TEXT DEFAULT 'This year, we invite speakers who challenge the baseline of conventional frameworks. We aim to print new concepts that reform how we think, react, and shape local infrastructure.' NOT NULL,
-- ADD COLUMN IF NOT EXISTS reveal_about_theme BOOLEAN DEFAULT true NOT NULL;

-- 8. TEAM MEMBERS TABLE AND POLICIES
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT NOT NULL, -- Holds Base64 data string
    email TEXT,
    linkedin TEXT,
    bio TEXT NOT NULL
);

-- Enable RLS for team members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Allow read access to anyone (public)
CREATE POLICY "Allow public read access to team members"
ON public.team_members
FOR SELECT
TO public
USING (true);

-- Allow write/management only to the admin
CREATE POLICY "Allow admin to manage team members"
ON public.team_members
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'email' = 'tedxgcem@gmail.com');

-- Migration for adding reveal_team to event_settings
-- Execute this query in your Supabase SQL Editor:
-- ALTER TABLE public.event_settings ADD COLUMN IF NOT EXISTS reveal_team BOOLEAN DEFAULT true NOT NULL;

