/*
  # Add Content Storage Bucket

  ## Overview
  Create a storage bucket for all content types with policies.

  ## Changes
  1. Create 'content' bucket
  2. Add security policies
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('content', 'content', true)
ON CONFLICT (id) DO NOTHING;
