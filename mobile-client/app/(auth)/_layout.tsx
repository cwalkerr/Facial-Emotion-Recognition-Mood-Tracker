import { Stack } from 'expo-router';
import React from 'react';
import { SignedIn } from '@clerk/clerk-expo';

export default function AuthLayout() {
  return (
    <SignedIn>
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="cameraPreview" />
        <Stack.Screen name="results" />
      </Stack>
    </SignedIn>
  );
}
