#!/usr/bin/env node

/**
 * This script tests the Supabase authentication configuration
 * Run it with: node scripts/test-auth.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Check if required environment variables are set
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease add these variables to your .env.local file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test connection by getting the session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('   Session data:', data.session ? 'Active session found' : 'No active session');
    
    console.log('\n📋 Next steps:');
    console.log('1. Make sure you\'ve configured Google OAuth in the Supabase dashboard');
    console.log('2. Make sure you\'ve added the correct redirect URIs in Google Cloud Console');
    console.log('3. Test the authentication flow in your application');
    
  } catch (error) {
    console.error('❌ Error testing Supabase connection:', error.message);
    process.exit(1);
  }
}

testSupabaseConnection(); 