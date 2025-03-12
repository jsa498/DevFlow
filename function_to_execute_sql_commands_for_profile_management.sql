-- Create a function to execute SQL commands from the client
CREATE OR REPLACE FUNCTION create_profiles_table_manually(sql_command text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_command;
END;
$$;

-- Create a function to update existing users
CREATE OR REPLACE FUNCTION update_existing_users_profiles(sql_command text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_command;
END;
$$;