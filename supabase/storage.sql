-- Configure Storage Buckets for CampusRide

-- 1. Create 'avatars' bucket (Public)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Policy: Anyone can view avatars
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Policy: Authenticated users can upload their own avatars
CREATE POLICY "Users can upload their own avatars." ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid() = owner
);

-- Policy: Users can update their own avatars
CREATE POLICY "Users can update their own avatars." ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid() = owner
);

-- Policy: Users can delete their own avatars
CREATE POLICY "Users can delete their own avatars." ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid() = owner
);

-- --------------------------------------------------------

-- 2. Create 'id_documents' bucket (Private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('id_documents', 'id_documents', false);

-- Policy: Users can upload their own ID documents
CREATE POLICY "Users can upload their own ID." ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'id_documents' AND auth.uid() = owner
);

-- Policy: Users can view their own ID documents (and admins later if added)
CREATE POLICY "Users can view their own ID." ON storage.objects
FOR SELECT USING (
  bucket_id = 'id_documents' AND auth.uid() = owner
);

-- Policy: Users can update their own ID documents
CREATE POLICY "Users can update their own ID." ON storage.objects
FOR UPDATE USING (
  bucket_id = 'id_documents' AND auth.uid() = owner
);
