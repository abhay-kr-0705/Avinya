/*
  # Add events and registrations tables

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `location` (text)
      - `max_participants` (integer, nullable)
      - `registration_deadline` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `event_registrations`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key to events)
      - `name` (text)
      - `email` (text)
      - `registration_no` (text)
      - `phone` (text)
      - `created_at` (timestamptz)
      - `ticket_sent` (boolean)

  2. Security
    - Enable RLS on both tables
    - Add policies for event access and registration
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text NOT NULL,
  max_participants integer,
  registration_deadline timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  registration_no text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  ticket_sent boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Events are viewable by everyone"
  ON events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can insert events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete events"
  ON events
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policies for event_registrations
CREATE POLICY "Users can view their own registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (email = auth.email());

CREATE POLICY "Anyone can register for events"
  ON event_registrations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create updated_at trigger for events
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- Insert Web Development Bootcamp event
INSERT INTO events (
  title,
  description,
  start_date,
  end_date,
  location,
  registration_deadline
) VALUES (
  'Web Development Bootcamp',
  'Join us for an intensive 4-day web development bootcamp where you''ll learn the fundamentals of web development, including HTML, CSS, JavaScript, and modern frameworks.',
  '2025-02-02 09:00:00+00',
  '2025-02-05 17:00:00+00',
  'SEC Computer Lab (Room 320)',
  '2025-01-25 23:59:59+00'
);