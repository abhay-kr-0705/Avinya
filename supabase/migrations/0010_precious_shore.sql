-- Update admin privileges for specific user
DO $$
BEGIN
  -- First ensure the user exists in auth.users
  IF EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'abhayk7481@gmail.com'
  ) THEN
    -- Update or insert the profile with admin role
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
      COALESCE(raw_user_meta_data->>'branch', 'CSE'),
      COALESCE(raw_user_meta_data->>'year', '4'),
      'admin'
    FROM auth.users
    WHERE email = 'abhayk7481@gmail.com'
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin',
        updated_at = now();
  END IF;
END $$;