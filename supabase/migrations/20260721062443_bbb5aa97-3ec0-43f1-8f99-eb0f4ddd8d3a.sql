CREATE TABLE public.notebooks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    color text NOT NULL DEFAULT 'rose',
    shared boolean NOT NULL DEFAULT false,
    share_as text NOT NULL DEFAULT 'anonymous' CHECK (share_as IN ('nickname', 'anonymous')),
    shared_at timestamptz,
    topics text[] NOT NULL DEFAULT '{}',
    reactions jsonb NOT NULL DEFAULT '{}',
    reacted_by jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notebooks TO authenticated;
GRANT ALL ON public.notebooks TO service_role;

ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notebooks"
ON public.notebooks
FOR ALL
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Service role can manage notebooks"
ON public.notebooks
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE TABLE public.entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id uuid NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    content text NOT NULL,
    mood text,
    shared boolean NOT NULL DEFAULT false,
    share_as text NOT NULL DEFAULT 'anonymous' CHECK (share_as IN ('nickname', 'anonymous')),
    shared_at timestamptz,
    topics text[] NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.entries TO authenticated;
GRANT ALL ON public.entries TO service_role;

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage entries in their own notebooks"
ON public.entries
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.notebooks WHERE notebooks.id = entries.notebook_id AND notebooks.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.notebooks WHERE notebooks.id = entries.notebook_id AND notebooks.owner_id = auth.uid()));

CREATE POLICY "Service role can manage entries"
ON public.entries
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE TABLE public.reaction_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id uuid NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
    session_id text NOT NULL,
    reaction text NOT NULL,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.reaction_events TO authenticated;
GRANT ALL ON public.reaction_events TO service_role;

ALTER TABLE public.reaction_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage reaction events"
ON public.reaction_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_notebooks_updated_at
BEFORE UPDATE ON public.notebooks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entries_updated_at
BEFORE UPDATE ON public.entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();