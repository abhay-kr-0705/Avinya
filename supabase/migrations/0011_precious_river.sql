-- Grant admin privileges to specific user
DO $$
BEGIN
  -- Update or insert admin user
  INSERT INTO profiles (
    id,
    name,
    registration_no,
    branch,
    year,
    role
  )
  SELECT 
    id,
    COALESCE(raw_user_meta_data->>'name', 'Admin User'),
    COALESCE(raw_user_meta_data->>'registration_no', 'ADMIN-' || SUBSTRING(id::text, 1, 8)),
    'CSE',
    '4',
    'admin'
  FROM auth.users
  WHERE email = 'abhayk7481@gmail.com'
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin',
      updated_at = now();
END $$;