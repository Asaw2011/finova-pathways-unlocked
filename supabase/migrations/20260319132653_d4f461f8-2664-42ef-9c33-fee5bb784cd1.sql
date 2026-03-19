
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS gems_reward integer DEFAULT 5;
ALTER TABLE quests ADD COLUMN IF NOT EXISTS quest_category text DEFAULT 'monthly';

CREATE TABLE IF NOT EXISTS public.games_played (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  game_id text NOT NULL,
  played_at timestamptz DEFAULT now(),
  score integer DEFAULT 0
);

ALTER TABLE public.games_played ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own game records"
ON public.games_played FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game records"
ON public.games_played FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game records"
ON public.games_played FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own game records"
ON public.games_played FOR DELETE
USING (auth.uid() = user_id);
