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
