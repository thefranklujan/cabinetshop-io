-- Migration: fix_platform_rls_policies
-- Version: 20260412021100
-- Captured verbatim from the live CabinetShop.io Supabase project on 2026-06-08.
-- Replaces the auth.jwt()->>'email' platform-admin RLS checks with a SECURITY DEFINER
-- helper (is_platform_admin_check) that joins auth.users on auth.uid() — more robust than
-- trusting the JWT email claim directly.

-- Drop old policies
DROP POLICY IF EXISTS "Platform admins full access" ON public.shop_database;
DROP POLICY IF EXISTS "Platform admins full access" ON public.email_campaigns;
DROP POLICY IF EXISTS "Platform admins full access" ON public.campaign_events;
DROP POLICY IF EXISTS "Platform admins full access" ON public.email_unsubscribes;
DROP POLICY IF EXISTS "Platform admins full access" ON public.platform_activity;

-- Create helper function that checks if current user is platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin_check()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.platform_admins pa
    JOIN auth.users u ON u.email = pa.email
    WHERE u.id = auth.uid()
  );
$$;

-- Recreate policies using the helper function
CREATE POLICY "Platform admins full access" ON public.shop_database
  FOR ALL USING (public.is_platform_admin_check());

CREATE POLICY "Platform admins full access" ON public.email_campaigns
  FOR ALL USING (public.is_platform_admin_check());

CREATE POLICY "Platform admins full access" ON public.campaign_events
  FOR ALL USING (public.is_platform_admin_check());

CREATE POLICY "Platform admins full access" ON public.email_unsubscribes
  FOR ALL USING (public.is_platform_admin_check());

CREATE POLICY "Platform admins full access" ON public.platform_activity
  FOR ALL USING (public.is_platform_admin_check());
