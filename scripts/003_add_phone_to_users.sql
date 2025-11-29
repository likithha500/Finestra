-- Add phone_number column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Update existing rows to have NULL for phone_number (optional)
UPDATE public.users SET phone_number = NULL WHERE phone_number IS NULL;
