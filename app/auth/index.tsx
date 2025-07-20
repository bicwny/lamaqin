
import { Redirect } from 'expo-router';

export default function AuthIndex() {
  // Redirect to the unified auth screen as the default
  return <Redirect href="/auth/unified" />;
}
