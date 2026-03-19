
CREATE TABLE public.coach_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own coach messages"
  ON public.coach_messages FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coach messages"
  ON public.coach_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own coach messages"
  ON public.coach_messages FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_coach_messages_user_created ON public.coach_messages (user_id, created_at);
