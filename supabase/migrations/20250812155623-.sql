-- Create a secure function to check occupied time slots without exposing personal data
CREATE OR REPLACE FUNCTION public.get_occupied_time_slots(target_date date)
RETURNS TABLE(time_slot time) 
LANGUAGE SQL 
SECURITY DEFINER
STABLE
AS $$
  SELECT appointment_time
  FROM public."Marcações"
  WHERE appointment_date = target_date
  AND appointment_time IS NOT NULL;
$$;

-- Create RLS policy to allow public access to this function result
CREATE POLICY "Anyone can check occupied time slots" 
ON public."Marcações" 
FOR SELECT 
USING (false); -- This is handled by the security definer function

-- Grant execute permission to anonymous users for the function
GRANT EXECUTE ON FUNCTION public.get_occupied_time_slots(date) TO anon;