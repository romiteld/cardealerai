# Supabase Setup Guide

## Setting up Google Authentication Provider

To enable Google Authentication in your CarDealerAI application, follow these steps:

### 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials** and select **OAuth client ID**
5. Select **Web application** as the application type
6. Add a name for your OAuth client
7. Under **Authorized JavaScript origins**, add your application URL (e.g., https://your-app-url.com or http://localhost:3002 for local development)
8. Under **Authorized redirect URIs**, add:
   - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
   - `http://localhost:3002/api/auth/callback` (for local development)
9. Click **Create**
10. Note down the **Client ID** and **Client Secret**

### 2. Configure Supabase Auth

1. Go to your [Supabase Dashboard](https://app.supabase.io/)
2. Select your project
3. Navigate to **Authentication > Providers**
4. Find **Google** in the list and click on it
5. Toggle the **Enable** switch to on
6. Enter the **Client ID** and **Client Secret** from the steps above
7. Add your domain to **Authorized domains** (e.g., localhost for development)
8. Save the changes

### 3. Update Environment Variables

Ensure your application has the correct Supabase environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 4. Restart Your Application

After completing the configuration, restart your development server to apply the changes.

## Troubleshooting Authentication Issues

If you encounter authentication errors:

1. **"Provider is not enabled"** - Verify that you've enabled the Google provider in the Supabase dashboard
2. **Redirect URI errors** - Ensure the redirect URI in your Google Cloud Console exactly matches the one in your application
3. **CORS errors** - Check that your domain is added to the authorized domains list
4. **Invalid Client ID/Secret** - Verify you've entered the correct credentials from Google Cloud Console 