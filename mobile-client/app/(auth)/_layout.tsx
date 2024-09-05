import { Stack } from 'expo-router';
import React from 'react';
import { SignedIn, useAuth } from '@clerk/clerk-expo';
import { UserDataStateProvider } from '@/contexts/RefreshDataContext';
import { ActivityIndicator, View } from 'react-native';

export default function AuthLayout() {
  const { userId } = useAuth();
  console.log('userId', userId);

  if (!userId) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <SignedIn>
      <UserDataStateProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="cameraPreview" />
          <Stack.Screen name="results" />
        </Stack>
      </UserDataStateProvider>
    </SignedIn>
  );
}
