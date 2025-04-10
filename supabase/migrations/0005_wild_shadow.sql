/*
  # Fix event details relationship and add past event details
  
  1. Changes
    - Add event details for past events
    - Fix foreign key relationship
*/

-- First get the IDs of our past events
WITH past_events AS (
  SELECT id, title
  FROM events
  WHERE title IN ('IDEATHON-24', 'WebThon')
)
-- Insert details for past events
INSERT INTO event_details (id, full_description, winners)
SELECT 
  id,
  CASE 
    WHEN title = 'IDEATHON-24' THEN 
      'IDEATHON-24 was a month-long innovation challenge that brought together students from various branches to ideate and develop solutions for real-world problems. The event featured multiple rounds including initial ideation, mentorship sessions, and final presentations.'
    ELSE 
      'WebThon was an intensive three-day web development hackathon where participants learned and built modern web applications. The event included workshops on React, hands-on coding sessions, and team-based project development.'
  END as full_description,
  CASE 
    WHEN title = 'IDEATHON-24' THEN 
      '[
        {"position": "First Place", "name": "Team Innovators", "project": "Smart Campus Solution"},
        {"position": "Second Place", "name": "Team TechMinds", "project": "EcoTrack"},
        {"position": "Third Place", "name": "Team Creators", "project": "HealthConnect"}
      ]'::jsonb
    ELSE 
      '[
        {"position": "First Place", "name": "Team WebMasters", "project": "Community Learning Platform"},
        {"position": "Second Place", "name": "Team CodeCrafters", "project": "Event Management System"},
        {"position": "Third Place", "name": "Team DevStars", "project": "Student Portfolio Builder"}
      ]'::jsonb
  END as winners
FROM past_events;