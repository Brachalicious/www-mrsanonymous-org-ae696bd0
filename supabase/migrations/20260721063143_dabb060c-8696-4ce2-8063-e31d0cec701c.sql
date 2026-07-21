CREATE TABLE public.contact_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    message text NOT NULL,
    audience text NOT NULL DEFAULT 'women',
    created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_messages TO anon;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message"
ON public.contact_messages
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Service role can manage contact messages"
ON public.contact_messages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);