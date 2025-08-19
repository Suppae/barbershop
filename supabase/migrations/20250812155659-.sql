-- Fix security warning: Set search_path for the function
DROP FUNCTION IF EXISTS public.get_occupied_time_slots(date);

CREATE OR REPLACE FUNCTION public.get_occupied_time_slots(target_date date)
RETURNS TABLE(time_slot time) 
LANGUAGE SQL 
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT appointment_time
  FROM public."Marcações"
  WHERE appointment_date = target_date
  AND appointment_time IS NOT NULL;
$$;