GRANT SELECT, INSERT, UPDATE ON public.contact_messages TO authenticated;
GRANT INSERT ON public.contact_messages TO anon;
GRANT ALL ON public.contact_messages TO service_role;
GRANT SELECT, INSERT ON public.message_replies TO authenticated;
GRANT ALL ON public.message_replies TO service_role;