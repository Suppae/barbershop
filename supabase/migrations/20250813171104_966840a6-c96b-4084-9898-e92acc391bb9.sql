-- Add new fields to the Marcações table
ALTER TABLE public."Marcações" 
ADD COLUMN phone_number TEXT,
ADD COLUMN haircut_type TEXT;

-- Fix the security issue by dropping the permissive policy
DROP POLICY IF EXISTS "Allow checking occupied time slots" ON public."Marcações";

-- Create a secure function that only returns time slots without personal data
CREATE OR REPLACE FUNCTION public.get_occupied_time_slots_secure(target_date date)
RETURNS TABLE(time_slot time without time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT appointment_time
  FROM public."Marcações"
  WHERE appointment_date = target_date
  AND appointment_time IS NOT NULL;
$$;

-- Grant execute permission to anon users for the secure function only
GRANT EXECUTE ON FUNCTION public.get_occupied_time_slots_secure(date) TO anon;
REVOKE EXECUTE ON FUNCTION public.get_occupied_time_slots(date) FROM anon;