/*
  # Fix profile role constraints

  1. Changes
    - Update valid_role constraint to ensure proper role values
    - Add default role value for new profiles
    - Fix any existing invalid roles
  
  2. Security
    - Maintain existing RLS policies
*/

-- First, ensure any existing profiles have valid roles
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL OR role NOT IN ('user', 'admin', 'superadmin');

-- Drop and recreate the role constraint
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS valid_role;

ALTER TABLE profiles
  ALTER COLUMN role SET DEFAULT 'user',
  ADD CONSTRAINT valid_role CHECK (role IN ('user', 'admin', 'superadmin'));

-- Ensure role column is not null
ALTER TABLE profiles
  ALTER COLUMN role SET NOT NULL;