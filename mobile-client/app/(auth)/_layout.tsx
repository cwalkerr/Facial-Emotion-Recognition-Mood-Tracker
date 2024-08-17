import { Stack } from 'expo-router';
import React from 'react';
import { SignedIn } from '@clerk/clerk-expo';
import { RefreshDataStateProvider } from '@/contexts/RefreshDataContext';

export default function AuthLayout() {
  return (
    <SignedIn>
      <RefreshDataStateProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="cameraPreview" />
          <Stack.Screen name="results" />
        </Stack>
      </RefreshDataStateProvider>
    </SignedIn>
  );
}
