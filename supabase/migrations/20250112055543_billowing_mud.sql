/*
  # Fix Database Errors

  1. Changes
    - Add last_login column to profiles table
    - Add trigger to update last_login on auth.users changes
    - Fix resources table policies

  2. Security
    - Maintains existing RLS policies
    - Adds proper authentication checks
*/

-- Add last_login column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- Create function to sync last_sign_in_at from auth.users
CREATE OR REPLACE FUNCTION sync_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_login = NEW.last_sign_in_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync last_login
DROP TRIGGER IF EXISTS sync_user_last_login ON auth.users;
CREATE TRIGGER sync_user_last_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_last_login();

-- Update existing last_login values
UPDATE profiles p
SET last_login = u.last_sign_in_at
FROM auth.users u
WHERE p.id = u.id;

-- Fix resources policies
DROP POLICY IF EXISTS "Resources are viewable by authenticated users" ON resources;
CREATE POLICY "Resources are viewable by authenticated users"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Only admins can insert resources" ON resources;
CREATE POLICY "Only admins can insert resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );