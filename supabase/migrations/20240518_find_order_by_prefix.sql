
-- Function to find orders by the prefix of their ID
-- This allows us to search for orders with a partial UUID match
CREATE OR REPLACE FUNCTION public.find_order_by_prefix(prefix TEXT)
RETURNS SETOF public.orders
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM public.orders
  WHERE SUBSTRING(id::text, 1, LENGTH(prefix)) = prefix
  ORDER BY created_at DESC
  LIMIT 5;
$$;
