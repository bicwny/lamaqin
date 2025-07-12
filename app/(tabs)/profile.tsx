
import { useEffect } from 'react';
import { router } from 'expo-router';

// Profile moved to app/profile.tsx
// This file redirects to the main profile screen
export default function ProfileTabPlaceholder() {
  useEffect(() => {
    // If someone navigates here, redirect to the main profile
    router.replace('/profile');
  }, []);

  return null;
}
