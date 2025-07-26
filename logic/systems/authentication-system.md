
# Authentication System Logic

## Overview
The authentication system handles user registration, login, email verification, and session management using Supabase Auth.

## Core Components

### 1. AuthContext (`/contexts/AuthContext.tsx`)
- Manages global authentication state
- Provides user session information
- Handles authentication state changes
- Exposes login, logout, and registration methods

### 2. Authentication Screens
- **Login Screen** (`/app/auth/login.tsx`)
- **Registration Screen** (`/app/auth/register.tsx`)
- **Email Verification** (`/app/auth/email-verification.tsx`)
- **Unified Auth** (`/app/auth/unified.tsx`)

## Authentication Flow

### Registration Process
1. User enters email, password, and profile information
2. System validates input requirements
3. Creates Supabase auth user account
4. Sends verification email
5. Creates user profile record in `users` table
6. Redirects to email verification screen

### Login Process
1. User enters email and password
2. System authenticates with Supabase
3. Verifies email confirmation status
4. Sets authentication context
5. Redirects to main application

### Email Verification
1. User receives verification email
2. Clicks verification link
3. Supabase confirms email
4. User can now fully access application

## Security Features
- Password strength validation
- Email format validation
- Session management
- Automatic token refresh
- Protected route handling

## Database Integration
- Uses Supabase Auth for user management
- Syncs with custom `users` table for profile data
- Implements Row Level Security (RLS) policies

## Error Handling
- Input validation errors
- Network connectivity issues
- Authentication failures
- Session expiration handling
