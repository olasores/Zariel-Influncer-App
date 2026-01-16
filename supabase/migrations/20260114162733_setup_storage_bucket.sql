/*
  # Setup Storage Bucket for Videos

  ## Overview
  Creates a storage bucket for video uploads with appropriate policies.

  ## 1. Storage Bucket
  - Create `videos` bucket for video file storage
  - Public access for reading (so videos can be played)
  - Authenticated users can upload to their own folders

  ## 2. Security Policies
  - Creators can upload videos to their own folder (user_id/)
  - Anyone can view videos (public read access)
  - Only owners can delete their videos
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');
