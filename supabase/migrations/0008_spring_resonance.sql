-- Set admin role for specific user
UPDATE profiles 
SET role = 'admin'
WHERE id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'abhayk7481@gmail.com'
);

-- Add missing profiles for existing users
INSERT INTO profiles (id, name, registration_no, branch, year, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', 'New User'),
  COALESCE(raw_user_meta_data->>'registration_no', 'TEMP-' || SUBSTRING(id::text, 1, 8)),
  COALESCE(raw_user_meta_data->>'branch', 'CSE'),
  COALESCE(raw_user_meta_data->>'year', '1'),
  'user'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;