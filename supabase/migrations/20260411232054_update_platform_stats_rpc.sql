-- Migration: update_platform_stats_rpc
-- Version: 20260411232054
-- Captured verbatim from the live CabinetShop.io Supabase project on 2026-06-08.
-- platform_stats() powers the /platform overview dashboard. SECURITY DEFINER + an explicit
-- platform-admin guard so it can aggregate across all workspaces and auth.users.

DROP FUNCTION IF EXISTS public.platform_stats();

CREATE OR REPLACE FUNCTION public.platform_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.platform_admins WHERE email = auth.jwt() ->> 'email') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT jsonb_build_object(
    'total_shops', (SELECT count(*) FROM public.workspaces),
    'paying_shops', (SELECT count(*) FROM public.workspaces WHERE plan != 'starter'),
    'mrr', (SELECT count(*) * 149 FROM public.workspaces WHERE plan = 'shop') + (SELECT count(*) * 349 FROM public.workspaces WHERE plan = 'scale'),
    'total_users', (SELECT count(*) FROM auth.users),
    'users_this_week', (SELECT count(*) FROM auth.users WHERE created_at > now() - interval '7 days'),
    'shops_this_month', (SELECT count(*) FROM public.workspaces WHERE created_at > now() - interval '30 days'),
    'shops_this_week', (SELECT count(*) FROM public.workspaces WHERE created_at > now() - interval '7 days'),
    'total_members', (SELECT count(*) FROM public.workspace_members),
    'total_projects', (SELECT count(*) FROM public.projects),
    'total_contract_value', (SELECT coalesce(sum(contract_total), 0) FROM public.projects),
    'total_clients', (SELECT count(*) FROM public.clients),
    'total_materials', (SELECT count(*) FROM public.materials),
    'total_pos', (SELECT count(*) FROM public.purchase_orders),
    'total_invoices', (SELECT count(*) FROM public.invoices),
    'invoiced_total', (SELECT coalesce(sum(amount), 0) FROM public.invoices),
    'total_prospects', (SELECT count(*) FROM public.shop_database),
    'prospects_contacted', (SELECT count(*) FROM public.shop_database WHERE status != 'prospect'),
    'total_campaigns', (SELECT count(*) FROM public.email_campaigns),
    'campaigns_sent', (SELECT count(*) FROM public.email_campaigns WHERE status = 'sent'),
    'total_opens', (SELECT coalesce(sum(open_count), 0) FROM public.email_campaigns),
    'total_clicks', (SELECT coalesce(sum(click_count), 0) FROM public.email_campaigns),
    'recent_shops', (
      SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
      FROM (
        SELECT w.id, w.name, w.plan, w.created_at,
          (SELECT raw_user_meta_data ->> 'email' FROM auth.users WHERE id = w.owner_id) as owner_email,
          (SELECT count(*) FROM public.workspace_members wm WHERE wm.workspace_id = w.id) as members,
          (SELECT count(*) FROM public.projects p WHERE p.workspace_id = w.id) as projects,
          (SELECT count(*) FROM public.clients c WHERE c.workspace_id = w.id) as clients
        FROM public.workspaces w ORDER BY w.created_at DESC LIMIT 20
      ) t
    ),
    'stuck_shops', (
      SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
      FROM (
        SELECT w.id, w.name, w.created_at,
          (SELECT raw_user_meta_data ->> 'email' FROM auth.users WHERE id = w.owner_id) as owner_email
        FROM public.workspaces w
        WHERE w.created_at < now() - interval '3 days'
          AND (SELECT count(*) FROM public.projects p WHERE p.workspace_id = w.id) = 0
          AND (SELECT count(*) FROM public.clients c WHERE c.workspace_id = w.id) = 0
        ORDER BY w.created_at DESC LIMIT 10
      ) t
    ),
    'recent_prospects', (
      SELECT coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
      FROM (
        SELECT id, name, owner_name, email, city, state, status, source, created_at
        FROM public.shop_database ORDER BY created_at DESC LIMIT 10
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;
