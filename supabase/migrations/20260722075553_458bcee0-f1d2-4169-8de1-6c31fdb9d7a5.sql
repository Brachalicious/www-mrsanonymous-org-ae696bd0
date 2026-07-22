
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Extend contact_messages with sender + status
ALTER TABLE public.contact_messages
  ADD COLUMN sender_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN status text NOT NULL DEFAULT 'open';

CREATE INDEX idx_contact_messages_sender ON public.contact_messages(sender_user_id);

GRANT SELECT ON public.contact_messages TO authenticated;

CREATE POLICY "Users see own messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (auth.uid() = sender_user_id);

CREATE POLICY "Admins see all messages" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update messages" ON public.contact_messages
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Replies from support
CREATE TABLE public.message_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.contact_messages(id) ON DELETE CASCADE,
  author_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_message_replies_message ON public.message_replies(message_id);

GRANT SELECT, INSERT ON public.message_replies TO authenticated;
GRANT ALL ON public.message_replies TO service_role;

ALTER TABLE public.message_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipient sees replies" ON public.message_replies
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.contact_messages m
      WHERE m.id = message_id AND m.sender_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins see all replies" ON public.message_replies
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins post replies" ON public.message_replies
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin') AND author_user_id = auth.uid()
  );
