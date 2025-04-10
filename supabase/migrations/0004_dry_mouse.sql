/*
  # Add superadmin role and past events

  1. Changes
    - Add superadmin role to profiles
    - Add past events data
    - Add event details table
  2. Security
    - Add policies for superadmin operations
*/

-- Add superadmin role
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS valid_role,
  ADD CONSTRAINT valid_role CHECK (role IN ('user', 'admin', 'superadmin'));

-- Update specific user to superadmin
UPDATE profiles 
SET role = 'superadmin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'avinashvats9199@gmail.com'
);

-- Create event_details table
CREATE TABLE IF NOT EXISTS event_details (
  id uuid PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
  full_description text,
  winners jsonb,
  gallery jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE event_details ENABLE ROW LEVEL SECURITY;

-- Policies for event_details
CREATE POLICY "Event details are viewable by everyone"
  ON event_details FOR SELECT TO public
  USING (true);

CREATE POLICY "Only admins can modify event details"
  ON event_details FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Insert past events
INSERT INTO events (
  id,
  title,
  description,
  start_date,
  end_date,
  location
) VALUES 
(
  gen_random_uuid(),
  'IDEATHON-24',
  'A month-long ideation competition focused on innovative solutions',
  '2024-09-14 00:00:00+00',
  '2024-10-04 23:59:59+00',
  'SEC Campus'
),
(
  gen_random_uuid(),
  'WebThon',
  'Three-day web development hackathon',
  '2023-12-21 00:00:00+00',
  '2023-12-23 23:59:59+00',
  'SEC Computer Lab'
);

-- Add trigger for event_details updated_at
CREATE OR REPLACE FUNCTION update_event_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_details_updated_at
  BEFORE UPDATE ON event_details
  FOR EACH ROW
  EXECUTE FUNCTION update_event_details_updated_at();