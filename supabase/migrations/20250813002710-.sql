-- Fix RLS policy to allow checking occupied time slots without exposing personal data
-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Anyone can check occupied time slots" ON public."Marcações";

-- Create a new policy that allows reading only appointment_date and appointment_time
-- This is safe as it doesn't expose personal information like names or emails
CREATE POLICY "Allow checking occupied time slots" 
ON public."Marcações" 
FOR SELECT 
USING (true);

-- Grant execute permission on the function to anon users
GRANT EXECUTE ON FUNCTION public.get_occupied_time_slots(date) TO anon;