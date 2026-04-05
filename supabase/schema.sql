-- Schema for CampusRide

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('rider', 'passenger', 'both')) DEFAULT 'passenger',
  college_id TEXT,
  is_verified BOOLEAN DEFAULT FALSE
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create rides table
CREATE TABLE rides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  driver_id UUID REFERENCES profiles(id) NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
  available_seats INTEGER NOT NULL CHECK (available_seats > 0),
  price_per_seat DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  driver_lat DOUBLE PRECISION,
  driver_lng DOUBLE PRECISION
);

ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rides are viewable by everyone." ON rides FOR SELECT USING (true);
CREATE POLICY "Drivers can insert their own rides." ON rides FOR INSERT WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "Drivers can update their own rides." ON rides FOR UPDATE USING (auth.uid() = driver_id);

-- Create bookings table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ride_id UUID REFERENCES rides(id) NOT NULL,
  passenger_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
  seats_booked INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Passengers can view their own bookings." ON bookings FOR SELECT USING (auth.uid() = passenger_id);
CREATE POLICY "Drivers can view bookings for their rides." ON bookings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM rides WHERE id = bookings.ride_id AND driver_id = auth.uid()
  )
);
CREATE POLICY "Passengers can insert their own bookings." ON bookings FOR INSERT WITH CHECK (auth.uid() = passenger_id);
CREATE POLICY "Involved users can update bookings." ON bookings FOR UPDATE USING (
  auth.uid() = passenger_id OR 
  EXISTS (
    SELECT 1 FROM rides WHERE id = bookings.ride_id AND driver_id = auth.uid()
  )
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ride_id UUID REFERENCES rides(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages for their rides." ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM rides WHERE id = messages.ride_id AND driver_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM bookings WHERE ride_id = messages.ride_id AND passenger_id = auth.uid()
  )
);
CREATE POLICY "Users can insert messages for their rides." ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND (
    EXISTS (
      SELECT 1 FROM rides WHERE id = messages.ride_id AND driver_id = auth.uid()
    ) OR 
    EXISTS (
      SELECT 1 FROM bookings WHERE ride_id = messages.ride_id AND passenger_id = auth.uid()
    )
  )
);

-- Create alerts table (SOS)
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  ride_id UUID REFERENCES rides(id),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT DEFAULT 'active'
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own alerts." ON alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Security can view all alerts." ON alerts FOR SELECT USING (true); -- Simplified for MVP
