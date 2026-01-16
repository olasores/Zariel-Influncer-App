/*
  # Add Content Type Support

  ## Overview
  Expand the videos table to support multiple content types (video, image, audio, document, etc.)

  ## Changes
  1. Add content_type column to videos table
  2. Rename video_url to content_url for clarity
  3. Add file_size column for tracking uploads
  4. Update duration to be nullable (not all content has duration)
  5. Add file_extension column

  ## Content Types Supported
  - video (mp4, mov, avi, etc.)
  - image (jpg, png, gif, etc.)
  - audio (mp3, wav, etc.)
  - document (pdf, doc, etc.)
  - other
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'videos' AND column_name = 'content_type'
  ) THEN
    ALTER TABLE videos ADD COLUMN content_type text DEFAULT 'video' CHECK (content_type IN ('video', 'image', 'audio', 'document', 'other'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'videos' AND column_name = 'content_url'
  ) THEN
    ALTER TABLE videos RENAME COLUMN video_url TO content_url;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'videos' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE videos ADD COLUMN file_size bigint;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'videos' AND column_name = 'file_extension'
  ) THEN
    ALTER TABLE videos ADD COLUMN file_extension text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_videos_content_type ON videos(content_type);
