/*
  # Add Resources Management

  1. New Tables
    - `resources`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `url` (text)
      - `category` (text)
      - `uploaded_by` (uuid, references profiles)
      - `downloads` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
  2. Security
    - Enable RLS
    - Add policies for authenticated users and admins
*/

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  category text NOT NULL,
  uploaded_by uuid REFERENCES profiles(id),
  downloads integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Resources are viewable by authenticated users"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

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

CREATE POLICY "Only admins can update resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Only admins can delete resources"
  ON resources FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Create updated_at trigger
CREATE TRIGGER resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();