CREATE TABLE public.inbox_recovery_locks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  method text NOT NULL DEFAULT 'unknown',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  verified_by uuid
);

GRANT SELECT, INSERT ON public.inbox_recovery_locks TO authenticated;
GRANT UPDATE ON public.inbox_recovery_locks TO authenticated;
GRANT ALL ON public.inbox_recovery_locks TO service_role;

ALTER TABLE public.inbox_recovery_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own lock" ON public.inbox_recovery_locks
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can raise own lock" ON public.inbox_recovery_locks
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins see all locks" ON public.inbox_recovery_locks
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins resolve locks" ON public.inbox_recovery_locks
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));