import React from 'react';
import { Stack } from 'expo-router';
import { SignedOut } from '@clerk/clerk-expo';

export default function PublicLayout() {
  return (
    <SignedOut>
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="signup" />
        <Stack.Screen name="login" />
      </Stack>
    </SignedOut>
  );
}
