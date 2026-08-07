-- 1. Drop redundant always-true service_role policies (service_role bypasses RLS)
DROP POLICY IF EXISTS "Service role can manage contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Service role can manage entries" ON public.entries;
DROP POLICY IF EXISTS "Service role can manage notebooks" ON public.notebooks;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage reaction events" ON public.reaction_events;

-- 2. Constrain the anonymous contact insert policy instead of WITH CHECK (true)
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;
CREATE POLICY "Anon can submit a contact message"
  ON public.contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (
    sender_user_id IS NULL
    AND status = 'open'
    AND audience IN ('women', 'girls', 'other')
    AND length(btrim(message)) BETWEEN 1 AND 5000
  );

CREATE POLICY "Users can submit their own contact message"
  ON public.contact_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_user_id = auth.uid()
    AND status = 'open'
    AND audience IN ('women', 'girls', 'other')
    AND length(btrim(message)) BETWEEN 1 AND 5000
  );

-- 3. Lock down SECURITY DEFINER / trigger functions
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
