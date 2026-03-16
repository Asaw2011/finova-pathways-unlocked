
-- Track user mistakes in quizzes for review
CREATE TABLE public.user_mistakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_text text NOT NULL,
  correct_answer text NOT NULL,
  user_answer text NOT NULL,
  lesson_id text,
  topic text,
  reviewed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.user_mistakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own mistakes" ON public.user_mistakes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mistakes" ON public.user_mistakes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mistakes" ON public.user_mistakes FOR UPDATE USING (auth.uid() = user_id);

-- Monthly rankings for competitive leaderboard
CREATE TABLE public.monthly_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month text NOT NULL,
  xp_earned integer DEFAULT 0,
  tier text DEFAULT 'bronze',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);
ALTER TABLE public.monthly_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view rankings" ON public.monthly_rankings FOR SELECT USING (true);
CREATE POLICY "Users can insert own ranking" ON public.monthly_rankings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ranking" ON public.monthly_rankings FOR UPDATE USING (auth.uid() = user_id);

-- Quests (daily + monthly)
CREATE TABLE public.quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quest_type text NOT NULL,
  quest_text text NOT NULL,
  quest_date date DEFAULT CURRENT_DATE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  reward_gems integer DEFAULT 5,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own quests" ON public.quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quests" ON public.quests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quests" ON public.quests FOR UPDATE USING (auth.uid() = user_id);
