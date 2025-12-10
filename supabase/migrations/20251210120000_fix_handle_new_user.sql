CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name', 
      split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1), 
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'last_name', 
      CASE 
        WHEN position(' ' in COALESCE(NEW.raw_user_meta_data->>'full_name', '')) > 0 
        THEN substring(COALESCE(NEW.raw_user_meta_data->>'full_name', '') from position(' ' in COALESCE(NEW.raw_user_meta_data->>'full_name', '')) + 1)
        ELSE ''
      END, 
      ''
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
