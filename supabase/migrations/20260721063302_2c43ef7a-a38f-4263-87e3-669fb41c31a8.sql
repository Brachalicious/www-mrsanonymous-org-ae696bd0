CREATE POLICY "Anon can read shared notebooks"
ON public.notebooks
FOR SELECT
TO anon
USING (shared = true);

CREATE POLICY "Anon can read shared entries"
ON public.entries
FOR SELECT
TO anon
USING (shared = true);

GRANT SELECT ON public.notebooks TO anon;
GRANT SELECT ON public.entries TO anon;