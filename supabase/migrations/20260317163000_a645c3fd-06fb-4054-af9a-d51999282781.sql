
-- Paper trading portfolio (cash balance + positions)
CREATE TABLE public.paper_portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cash numeric NOT NULL DEFAULT 100000,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.paper_portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own portfolio" ON public.paper_portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolio" ON public.paper_portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolio" ON public.paper_portfolios FOR UPDATE USING (auth.uid() = user_id);

-- Paper positions (stocks held)
CREATE TABLE public.paper_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  shares integer NOT NULL DEFAULT 0,
  avg_price numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol)
);

ALTER TABLE public.paper_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own positions" ON public.paper_positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own positions" ON public.paper_positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own positions" ON public.paper_positions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own positions" ON public.paper_positions FOR DELETE USING (auth.uid() = user_id);

-- Paper trades (history)
CREATE TABLE public.paper_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  action text NOT NULL,
  shares integer NOT NULL,
  price numeric NOT NULL,
  total numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.paper_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trades" ON public.paper_trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.paper_trades FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_paper_portfolios_updated_at BEFORE UPDATE ON public.paper_portfolios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_paper_positions_updated_at BEFORE UPDATE ON public.paper_positions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
