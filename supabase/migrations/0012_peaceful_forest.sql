-- Ensure admin role for specific user
DO $$
BEGIN
  -- First ensure the user exists in auth.users
  IF EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'abhayk7481@gmail.com'
  ) THEN
    -- Update the profile with admin role
    UPDATE profiles 
    SET role = 'admin',
        updated_at = now()
    WHERE id IN (
      SELECT id FROM auth.users WHERE email = 'abhayk7481@gmail.com'
    );
    
    -- If no profile exists, create one
    IF NOT FOUND THEN
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
        'ADMIN-' || SUBSTRING(id::text, 1, 8),
        'CSE',
        '4',
        'admin'
      FROM auth.users
      WHERE email = 'abhayk7481@gmail.com';
    END IF;
  END IF;
END $$;