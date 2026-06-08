-- Migration: add_platform_tables_v2
-- Version: 20260411232040
-- Captured verbatim from the live CabinetShop.io Supabase project on 2026-06-08.
-- Marketing/outreach engine: prospect database, email campaigns, events, unsubscribes,
-- platform activity log. RLS here is platform-admin-only (later hardened in 20260412021100).

-- Shop Database: prospects/leads for outreach
CREATE TABLE IF NOT EXISTS public.shop_database (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_name text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  website text,
  source text DEFAULT 'manual',
  status text DEFAULT 'prospect' CHECK (status IN ('prospect', 'contacted', 'interested', 'demo_scheduled', 'signed_up', 'not_interested', 'dead')),
  employee_count integer,
  notes text,
  last_contacted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Email Campaigns
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  html text NOT NULL,
  preview_text text,
  audience text DEFAULT 'all_prospects' CHECK (audience IN ('all_prospects', 'prospects_only', 'contacted', 'interested', 'signed_up', 'all_users', 'custom')),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  sent_count integer DEFAULT 0,
  open_count integer DEFAULT 0,
  click_count integer DEFAULT 0,
  sent_at timestamptz,
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- Campaign Events
CREATE TABLE IF NOT EXISTS public.campaign_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  email text NOT NULL,
  event text NOT NULL CHECK (event IN ('sent', 'open', 'click', 'bounce', 'unsubscribe')),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Email Unsubscribes
CREATE TABLE IF NOT EXISTS public.email_unsubscribes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Platform Activity Log
CREATE TABLE IF NOT EXISTS public.platform_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  actor_email text,
  target text,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shop_database_status ON public.shop_database(status);
CREATE INDEX IF NOT EXISTS idx_shop_database_state ON public.shop_database(state);
CREATE INDEX IF NOT EXISTS idx_campaign_events_campaign ON public.campaign_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_email ON public.campaign_events(email);
CREATE INDEX IF NOT EXISTS idx_platform_activity_created ON public.platform_activity(created_at DESC);

-- RLS
ALTER TABLE public.shop_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_unsubscribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Platform admins full access" ON public.shop_database
  FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.platform_admins));
CREATE POLICY "Platform admins full access" ON public.email_campaigns
  FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.platform_admins));
CREATE POLICY "Platform admins full access" ON public.campaign_events
  FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.platform_admins));
CREATE POLICY "Platform admins full access" ON public.email_unsubscribes
  FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.platform_admins));
CREATE POLICY "Platform admins full access" ON public.platform_activity
  FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.platform_admins));
