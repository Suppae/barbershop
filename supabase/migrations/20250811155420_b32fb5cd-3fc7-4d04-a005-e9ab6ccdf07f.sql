-- Add columns to store appointment data
ALTER TABLE public."Marcações" 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT,
ADD COLUMN appointment_date DATE,
ADD COLUMN appointment_time TIME,
ADD COLUMN email TEXT;

-- Enable Row Level Security
ALTER TABLE public."Marcações" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to insert appointments (since this is a public booking form)
CREATE POLICY "Anyone can create appointments" 
ON public."Marcações" 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow viewing appointments (you may want to restrict this later)
CREATE POLICY "Anyone can view appointments" 
ON public."Marcações" 
FOR SELECT 
USING (true);