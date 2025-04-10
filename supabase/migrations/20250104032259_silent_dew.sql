-- Update IDEATHON-24 event details
UPDATE events
SET description = 'Empowering Young Innovators: Ideathon (Junior Edition) 2024 - A platform for students from grades 8 to 12 to showcase innovative solutions using advanced technologies.'
WHERE title = 'IDEATHON-24';

UPDATE event_details
SET full_description = 'On October 4, 2024, Sher Shah Engineering College, Sasaram hosted the Ideathon (Junior Edition), a dynamic platform designed to inspire and nurture innovation among students from grades 8 to 12. Students from renowned schools such as ABR Foundation School, St. Paul School, DAV Public School, Narayan World School, Rhythm Foundation School, GS Residential School, and Pragya Niketan Public School participated with great enthusiasm.

The event showcased 25 teams presenting real-world problem-solving ideas using advanced technologies like robotics, IoT, app development, and web development. Each team was evaluated on their presentation skills, technical expertise, and innovative approach by a panel of esteemed judges.

A significant highlight of the event was the dedication of the organizing team, which included Prakhar Prasad, Shantanu Ranjan, Vicky Kumar, Devika Kumari, Pritam Kumari, and others, led by the exceptional guidance of Niraj Kumar. Their hard work and collaborative spirit ensured the event''s seamless execution.

This initiative extended beyond the event, as the organizing team visited schools beforehand, conducting workshops to train and inspire students in emerging technologies. This outreach helped students explore their creative potential and foster a passion for innovation.

The event concluded with an award ceremony to honor the top-performing teams, participants, and the organizing team. Ideathon (Junior Edition) 2024 stands as a testament to the college''s commitment to empowering young innovators and bridging the gap between education and technology.'
WHERE id IN (SELECT id FROM events WHERE title = 'IDEATHON-24');

-- Update gallery photos to use Abhay.png
UPDATE gallery_photos
SET url = '/src/pages/Abhay.png'
WHERE gallery_id IN (
  SELECT id FROM event_galleries 
  WHERE event_id IN (
    SELECT id FROM events 
    WHERE title IN ('WebThon', 'IDEATHON-24')
  )
);

-- Create separate galleries for each event if they don't exist
INSERT INTO event_galleries (event_id, title, description)
SELECT 
  id,
  title || ' Gallery',
  'Photo gallery from ' || title
FROM events 
WHERE title IN ('WebThon', 'IDEATHON-24')
AND id NOT IN (SELECT event_id FROM event_galleries)
ON CONFLICT DO NOTHING;

-- Add photos to galleries
INSERT INTO gallery_photos (gallery_id, url, caption, "order")
SELECT 
  eg.id,
  '/src/pages/Abhay.png',
  'Event Photo ' || gs.n,
  gs.n
FROM event_galleries eg
CROSS JOIN (SELECT generate_series(1,4) as n) gs
WHERE eg.event_id IN (SELECT id FROM events WHERE title IN ('WebThon', 'IDEATHON-24'))
ON CONFLICT DO NOTHING;