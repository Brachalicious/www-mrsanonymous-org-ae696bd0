CREATE POLICY "Anon can read reaction events for shared notebooks"
ON public.reaction_events
FOR SELECT
TO anon
USING (EXISTS (SELECT 1 FROM public.notebooks WHERE notebooks.id = reaction_events.notebook_id AND notebooks.shared = true));

GRANT SELECT ON public.reaction_events TO anon;