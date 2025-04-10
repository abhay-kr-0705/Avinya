/*
  # Gallery System Implementation

  1. New Tables
    - `event_galleries` - Stores event gallery information
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `title` (text)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `gallery_photos` - Stores individual photos
      - `id` (uuid, primary key)
      - `gallery_id` (uuid, references event_galleries)
      - `url` (text)
      - `caption` (text)
      - `order` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public viewing
    - Add policies for admin management
*/

-- Create event_galleries table
CREATE TABLE IF NOT EXISTS event_galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gallery_photos table
CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid REFERENCES event_galleries(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE event_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for event_galleries
CREATE POLICY "Event galleries are viewable by everyone"
  ON event_galleries FOR SELECT TO public
  USING (true);

CREATE POLICY "Only admins can modify event galleries"
  ON event_galleries FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Create policies for gallery_photos
CREATE POLICY "Gallery photos are viewable by everyone"
  ON gallery_photos FOR SELECT TO public
  USING (true);

CREATE POLICY "Only admins can modify gallery photos"
  ON gallery_photos FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Create updated_at trigger for event_galleries
CREATE OR REPLACE FUNCTION update_event_galleries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_galleries_updated_at
  BEFORE UPDATE ON event_galleries
  FOR EACH ROW
  EXECUTE FUNCTION update_event_galleries_updated_at();

-- Insert sample data for Web Development Workshop
INSERT INTO event_galleries (event_id, title, description)
SELECT 
  id,
  'Web Development Workshop 2024',
  'Photos from our intensive web development workshop held in December 2023'
FROM events 
WHERE title = 'WebThon'
LIMIT 1;

-- Insert sample photos
WITH gallery AS (
  SELECT id FROM event_galleries 
  WHERE title = 'Web Development Workshop 2024'
  LIMIT 1
)
INSERT INTO gallery_photos (gallery_id, url, caption, "order")
SELECT 
  gallery.id,
  url,
  caption,
  "order"
FROM gallery,
(VALUES 
  ('https://images.unsplash.com/photo-1531482615713-2afd69097998', 'Workshop Introduction Session', 1),
  ('https://images.unsplash.com/photo-1517694712202-14dd9538aa97', 'Coding Session', 2),
  ('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5', 'Team Collaboration', 3),
  ('https://images.unsplash.com/photo-1542831371-29b0f74f9713', 'Project Presentations', 4)
) AS photos(url, caption, "order");