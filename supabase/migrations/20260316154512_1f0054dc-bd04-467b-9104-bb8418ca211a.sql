
-- User hearts (5 per day, reset daily)
CREATE TABLE public.user_hearts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  hearts_count integer NOT NULL DEFAULT 5,
  last_reset_date date NOT NULL DEFAULT CURRENT_DATE,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_hearts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hearts" ON public.user_hearts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hearts" ON public.user_hearts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hearts" ON public.user_hearts FOR UPDATE USING (auth.uid() = user_id);

CREATE UNIQUE INDEX user_hearts_user_id_idx ON public.user_hearts (user_id);

-- User gems
CREATE TABLE public.user_gems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  gems_count integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_gems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gems" ON public.user_gems FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gems" ON public.user_gems FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gems" ON public.user_gems FOR UPDATE USING (auth.uid() = user_id);

CREATE UNIQUE INDEX user_gems_user_id_idx ON public.user_gems (user_id);

-- User items (streak freezes, etc.)
CREATE TABLE public.user_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_type text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own items" ON public.user_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own items" ON public.user_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON public.user_items FOR UPDATE USING (auth.uid() = user_id);

CREATE UNIQUE INDEX user_items_user_id_type_idx ON public.user_items (user_id, item_type);
