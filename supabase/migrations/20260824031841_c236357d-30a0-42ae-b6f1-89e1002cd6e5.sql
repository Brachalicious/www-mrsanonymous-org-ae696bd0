DROP POLICY IF EXISTS "Anon can read shared notebooks" ON public.notebooks;
CREATE POLICY "Anon can read shared notebooks"
ON public.notebooks FOR SELECT
TO anon, authenticated
USING (shared = true AND hidden = false);

DROP POLICY IF EXISTS "Anon can read shared entries" ON public.entries;
CREATE POLICY "Anon can read shared entries"
ON public.entries FOR SELECT
TO anon, authenticated
USING (
  shared = true AND EXISTS (
    SELECT 1 FROM public.notebooks n
    WHERE n.id = entries.notebook_id AND n.shared = true AND n.hidden = false
  )
);