# Environment Setup Guide

## Required API Keys and Setup

### 1. Supabase Database
- Go to https://supabase.com/dashboard
- Create a new project or use existing one
- Go to Settings > API
- Copy the Project URL and anon/public key
- Replace in .env.local:
  - NEXT_PUBLIC_SUPABASE_URL=your_project_url
  - NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

### 2. Groq API (for LangChain video analysis)
- Go to https://console.groq.com/
- Create an account and generate API key
- Replace in .env.local:
  - GROQ_API_KEY=your_groq_api_key

### 3. YouTube API (for video metadata)
- Go to https://console.developers.google.com/
- Create a project and enable YouTube Data API v3
- Create credentials (API key)
- Replace in .env.local:
  - YOUTUBE_API_KEY=your_youtube_api_key

### 4. Resend (for emails)
- Go to https://resend.com/
- Create account and generate API key
- Replace in .env.local:
  - RESEND_API_KEY=your_resend_api_key

### 5. Admin Password
- Set a secure password for admin access
- Replace in .env.local:
  - ADMIN_PASSWORD=your_chosen_password

## Important Notes:
- Never commit .env.local to git
- Restart your development server after updating environment variables
- Make sure all values are valid URLs/keys without quotes
