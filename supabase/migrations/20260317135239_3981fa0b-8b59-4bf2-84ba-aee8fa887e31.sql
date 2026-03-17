CREATE TABLE public.financial_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  life_stage text NOT NULL DEFAULT 'teen',
  primary_goal text NOT NULL DEFAULT 'save',
  knowledge_level text NOT NULL DEFAULT 'beginner',
  learning_pace text NOT NULL DEFAULT 'quick',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.financial_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own financial profile"
  ON public.financial_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial profile"
  ON public.financial_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial profile"
  ON public.financial_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_financial_profiles_updated_at
  BEFORE UPDATE ON public.financial_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();