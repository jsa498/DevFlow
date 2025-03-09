// Load environment variables from .env.local
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env.local file
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const adminEmail = 'devflow.technologies@gmail.com';

async function setUserAsAdmin() {
  try {
    console.log(`Looking for user with email: ${adminEmail}`);
    
    // Get the user from auth.users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      throw authError;
    }
    
    const user = users.find(u => u.email === adminEmail);
    
    if (!user) {
      console.log(`User with email ${adminEmail} not found. Make sure the user has signed up first.`);
      return;
    }
    
    console.log(`Found user with ID: ${user.id}`);
    
    // Check if profiles table exists
    const { error: tableCheckError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
    
    // If profiles table exists, update the role there
    if (!tableCheckError) {
      console.log('Updating role in profiles table...');
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          email: user.email,
          role: 'ADMIN'
        });
      
      if (profileError) {
        console.warn('Error updating profiles table:', profileError.message);
      } else {
        console.log('Successfully updated profiles table');
      }
    } else {
      console.log('Profiles table does not exist, skipping profile update');
    }
    
    // Update the user's metadata in auth.users
    console.log('Updating user metadata in auth.users...');
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { app_metadata: { role: 'admin' } }
    );
    
    if (updateError) {
      throw updateError;
    }
    
    console.log(`Successfully set ${adminEmail} as an admin!`);
  } catch (error) {
    console.error('Error setting admin role:', error);
  }
}

setUserAsAdmin(); 