-- Migration: add_campaign_increment_rpcs
-- Version: 20260411232537
-- Captured verbatim from the live CabinetShop.io Supabase project on 2026-06-08.
-- SECURITY DEFINER counters called by the public tracking pixel/redirect routes
-- (/api/track/open, /api/track/click) so anonymous opens/clicks can bump campaign stats.

CREATE OR REPLACE FUNCTION public.increment_campaign_opens(cid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.email_campaigns SET open_count = open_count + 1 WHERE id = cid;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_campaign_clicks(cid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.email_campaigns SET click_count = click_count + 1 WHERE id = cid;
END;
$$;
