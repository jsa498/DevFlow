# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for your DevFlow application, focusing on Google OAuth integration.

## Google OAuth Configuration

### In Google Cloud Console:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select your existing project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add the following Authorized JavaScript origins:
   - `http://localhost:3000` (for local development)
   - `https://devflow.ca` (for production)
7. Add the following Authorized redirect URIs:
   - `https://uqadiypewcxhwflcqpnj.supabase.co/auth/v1/callback` (Supabase callback)
   - `http://localhost:3000/auth/callback` (local development)
   - `https://devflow.ca/auth/callback` (production)
8. Click "Create" to generate your client ID and client secret
9. Copy the client ID and client secret

### In Supabase Dashboard:

1. Go to your [Supabase project dashboard](https://supabase.com/dashboard)
2. Navigate to "Authentication" > "Providers"
3. Enable "Google" provider
4. Paste your Google client ID and client secret from the Google Cloud Console
5. Save the changes

### In Your Application:

1. Make sure your Supabase URL and anon key are correctly set in your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. No need to add Google OAuth credentials to your application's environment variables - Supabase handles this for you!

## Testing Authentication

1. Start your development server:
   ```
   npm run dev
   ```

2. Navigate to the sign-in page
3. Click "Sign in with Google"
4. You should be redirected to Google's authentication page
5. After successful authentication, you should be redirected back to your application

## Troubleshooting

- If you encounter CORS errors, make sure your Authorized JavaScript origins are correctly set in Google Cloud Console
- If the redirect fails, check that your Authorized redirect URIs are correctly set
- Verify that your client ID and client secret are correctly entered in the Supabase dashboard
- Check the browser console for any errors during the authentication process

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js with Supabase Auth](https://supabase.com/docs/guides/auth/auth-helpers/nextjs) 