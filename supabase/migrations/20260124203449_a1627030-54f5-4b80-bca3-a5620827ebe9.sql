-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('generation-uploads', 'generation-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'generation-uploads' 
  AND auth.uid() IS NOT NULL
);

-- Create policy for public to read files
CREATE POLICY "Public can read uploaded files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'generation-uploads');

-- Create policy for users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'generation-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);