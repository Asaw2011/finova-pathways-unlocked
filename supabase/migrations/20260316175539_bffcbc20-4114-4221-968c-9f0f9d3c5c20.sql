
-- Confirm the email for the existing user
UPDATE auth.users 
SET email_confirmed_at = now(), 
    updated_at = now()
WHERE email = 'jonah.vartanov@gmail.com' 
  AND email_confirmed_at IS NULL;

-- Add editor role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'editor'::app_role 
FROM auth.users 
WHERE email = 'jonah.vartanov@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
