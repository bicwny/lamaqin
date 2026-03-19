#!/bin/bash

# Push Supabase environment variables to EAS as environment variables
# Run this script after authenticating with: eas login
#
# These variables are required for production and preview EAS builds
# to connect to the Supabase backend.

set -e

echo "Checking EAS authentication..."
if ! npx eas whoami &>/dev/null; then
  echo "Error: Not logged in to EAS. Run 'eas login' first."
  exit 1
fi

if [ -z "$EXPO_PUBLIC_SUPABASE_URL" ]; then
  echo "Error: EXPO_PUBLIC_SUPABASE_URL is not set in the environment."
  exit 1
fi

if [ -z "$EXPO_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "Error: EXPO_PUBLIC_SUPABASE_ANON_KEY is not set in the environment."
  exit 1
fi

push_env_var() {
  local name="$1"
  local value="$2"
  local env="$3"
  local visibility="$4"

  local output
  if output=$(npx eas env:create --name "$name" --value "$value" --environment "$env" --visibility "$visibility" --non-interactive 2>&1); then
    echo "  Created $name for $env"
  elif echo "$output" | grep -qi "already exists\|duplicate\|conflict"; then
    echo "  $name already exists for $env (skipping)"
  else
    echo "  Error creating $name for $env:"
    echo "  $output"
    return 1
  fi
}

echo "Pushing EAS environment variables..."

push_env_var "EXPO_PUBLIC_SUPABASE_URL" "$EXPO_PUBLIC_SUPABASE_URL" "production" "public"
push_env_var "EXPO_PUBLIC_SUPABASE_URL" "$EXPO_PUBLIC_SUPABASE_URL" "preview" "public"

push_env_var "EXPO_PUBLIC_SUPABASE_ANON_KEY" "$EXPO_PUBLIC_SUPABASE_ANON_KEY" "production" "sensitive"
push_env_var "EXPO_PUBLIC_SUPABASE_ANON_KEY" "$EXPO_PUBLIC_SUPABASE_ANON_KEY" "preview" "sensitive"

echo ""
echo "Done! Verify with: npx eas env:list"
