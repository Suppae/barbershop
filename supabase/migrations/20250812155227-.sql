-- Fix security issue: Remove public read access to personal data
-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Anyone can view appointments" ON public."Marcações";

-- Create a restricted policy that only allows administrators to view appointments
-- For now, we'll create a more restrictive policy and the system owner can manage access through the Supabase dashboard
CREATE POLICY "Only system administrators can view appointments" 
ON public."Marcações" 
FOR SELECT 
USING (false); -- This prevents all public read access

-- Optional: If you need programmatic access for your application, you can create a service role
-- For webhook access or administrative functions, use the service_role key instead of anon key

-- Keep the INSERT policy as is since people need to book appointments
-- The "Anyone can create appointments" policy remains unchanged