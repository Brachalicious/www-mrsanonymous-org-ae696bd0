CREATE POLICY "Users reply to own message threads"
ON public.message_replies
FOR INSERT
TO authenticated
WITH CHECK (
  author_user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.contact_messages m
    WHERE m.id = message_replies.message_id
      AND m.sender_user_id = auth.uid()
  )
  AND length(btrim(body)) BETWEEN 1 AND 4000
);