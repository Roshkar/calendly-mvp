-- Fix username uniqueness issue in handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    base_username VARCHAR(50);
    final_username VARCHAR(50);
    counter INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    -- Get base username from metadata or email
    base_username := COALESCE(
        NEW.raw_user_meta_data->>'username', 
        split_part(NEW.email, '@', 1)
    );
    
    -- Sanitize username (remove special chars, limit length)
    base_username := REGEXP_REPLACE(base_username, '[^a-zA-Z0-9_]', '', 'g');
    base_username := SUBSTRING(base_username, 1, 40); -- Reserve space for suffix
    
    -- Make sure base_username is not empty
    IF base_username = '' THEN
        base_username := 'user';
    END IF;
    
    final_username := base_username;
    
    -- Check if username exists and append counter if needed
    WHILE counter < max_attempts LOOP
        -- Try to find existing username
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) THEN
            -- Username is available
            EXIT;
        END IF;
        
        -- Username exists, try with counter
        counter := counter + 1;
        final_username := base_username || '_' || counter;
    END LOOP;
    
    -- If max attempts reached, use UUID suffix
    IF counter >= max_attempts THEN
        final_username := base_username || '_' || SUBSTRING(NEW.id::TEXT, 1, 8);
    END IF;
    
    -- Insert profile with unique username
    INSERT INTO public.profiles (id, username, first_name, last_name, avatar_url, onboarding_completed)
    VALUES (
        NEW.id,
        final_username,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'avatar_url',
        FALSE
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add onboarding_completed field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.onboarding_completed 
IS 'Indicates whether the user has completed the onboarding process';

-- Update existing users to have onboarding_completed as false
UPDATE public.profiles 
SET onboarding_completed = FALSE 
WHERE onboarding_completed IS NULL;

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user() 
IS 'Handles new user creation with unique username generation. Appends counter or UUID suffix if base username already exists.'; 