CREATE TABLE public.security_questions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  question_1 TEXT NOT NULL,
  question_2 TEXT NOT NULL,
  question_3 TEXT NOT NULL,
  answer_1_hash TEXT NOT NULL,
  answer_2_hash TEXT NOT NULL,
  answer_3_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_questions TO authenticated;
GRANT ALL ON public.security_questions TO service_role;

ALTER TABLE public.security_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own security questions"
  ON public.security_questions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own security questions"
  ON public.security_questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own security questions"
  ON public.security_questions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own security questions"
  ON public.security_questions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_security_questions_updated_at
  BEFORE UPDATE ON public.security_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();