/*
  # Update profiles table schema

  1. Changes
    - Rename student_id to registration_no
    - Add constraints for required fields
    - Add validation for branch and year
    - Add updated_at trigger
    - Update policies

  Note: Handle existing data before adding constraints
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
DROP FUNCTION IF EXISTS update_updated_at();

-- Rename student_id to registration_no
ALTER TABLE profiles 
  RENAME COLUMN student_id TO registration_no;

-- Update any NULL values or invalid data before adding constraints
UPDATE profiles 
  SET branch = 'CSE' 
  WHERE branch IS NULL OR branch NOT IN ('CSE', 'EEE', 'ECE (VLSI)', 'Mining', 'Civil', 'Mechanical');

UPDATE profiles 
  SET year = '1' 
  WHERE year IS NULL OR year NOT IN ('1', '2', '3', '4');

UPDATE profiles 
  SET registration_no = 'TEMP-' || id::text 
  WHERE registration_no IS NULL;

-- Now add constraints
ALTER TABLE profiles 
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN registration_no SET NOT NULL,
  ADD CONSTRAINT unique_registration_no UNIQUE (registration_no),
  ALTER COLUMN branch SET NOT NULL,
  ADD CONSTRAINT valid_branch CHECK (branch IN ('CSE', 'EEE', 'ECE (VLSI)', 'Mining', 'Civil', 'Mechanical')),
  ALTER COLUMN year SET NOT NULL,
  ADD CONSTRAINT valid_year CHECK (year IN ('1', '2', '3', '4'));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Recreate policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);