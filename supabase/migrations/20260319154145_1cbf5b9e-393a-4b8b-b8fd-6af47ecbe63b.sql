
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE status = 'accepted' 
      AND ((friendships.user_id = auth.uid() AND friendships.friend_id = profiles.user_id) 
        OR (friendships.friend_id = auth.uid() AND friendships.user_id = profiles.user_id))
    )
  );

DROP POLICY IF EXISTS "Users can view own streak" ON public.user_streaks;
CREATE POLICY "Users can view streaks" ON public.user_streaks
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE status = 'accepted' 
      AND ((friendships.user_id = auth.uid() AND friendships.friend_id = user_streaks.user_id) 
        OR (friendships.friend_id = auth.uid() AND friendships.user_id = user_streaks.user_id))
    )
  );

DROP POLICY IF EXISTS "Users can view own xp" ON public.user_xp;
CREATE POLICY "Users can view xp" ON public.user_xp
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE status = 'accepted' 
      AND ((friendships.user_id = auth.uid() AND friendships.friend_id = user_xp.user_id) 
        OR (friendships.friend_id = auth.uid() AND friendships.user_id = user_xp.user_id))
    )
  );
