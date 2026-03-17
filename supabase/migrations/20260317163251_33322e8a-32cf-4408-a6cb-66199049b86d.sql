
CREATE POLICY "Users can delete own trades" ON public.paper_trades FOR DELETE USING (auth.uid() = user_id);
