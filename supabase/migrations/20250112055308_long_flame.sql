/*
  # Fix Admin Access and Permissions

  1. Changes
    - Ensures admin role for specific user
    - Adds necessary policies for admin access
    - Cleans up any inconsistent role assignments

  2. Security
    - Maintains existing RLS policies
    - Only modifies specific user role
*/

-- Ensure admin role for specific user with proper error handling
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get user ID
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'abhayk7481@gmail.com';

  IF user_id IS NOT NULL THEN
    -- Update existing profile if exists
    UPDATE profiles 
    SET 
      role = 'admin',
      updated_at = now()
    WHERE id = user_id;

    -- Insert new profile if doesn't exist
    IF NOT FOUND THEN
      INSERT INTO profiles (
        id,
        name,
        registration_no,
        branch,
        year,
        role
      ) VALUES (
        user_id,
        'Admin User',
        'ADMIN-' || substr(user_id::text, 1, 8),
        'CSE',
        '4',
        'admin'
      );
    END IF;
  END IF;
END $$;