import React, { useEffect } from 'react';
import { Href, router, Slot, usePathname } from 'expo-router';
import { GluestackUIProvider } from '@/components/ui/gluestack-imports/gluestack-ui-provider';
import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ClerkProvider,
  ClerkLoaded,
  ClerkLoading,
  useAuth,
} from '@clerk/clerk-expo';
import { tokenCache } from '@/services/tokenCache';
import { ActivityIndicator } from 'react-native';
import registerNNPushToken from 'native-notify';

const publishableKey: string = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing Clerk Publishable Key');
}

// redirect to auth or public based on sign in status
const AuthConditionalRender = () => {
  const { isSignedIn } = useAuth();
  const path = usePathname();

  useEffect(() => {
    if (isSignedIn && !path.includes('/notificationConfig')) {
      router.replace('(auth)' as Href);
    } else {
      router.replace('(public)/login' as Href);
    }
  }, [isSignedIn]);
  // Return Slot to ensure rendering root layout before redirecting
  return <Slot />;
};

export default function RootLayout() {
  registerNNPushToken(
    process.env.EXPO_PUBLIC_NATIVE_NOTIFY_APP_ID,
    process.env.EXPO_PUBLIC_NATIVE_NOTIFY_TOKEN
  );
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <GluestackUIProvider mode="light">
        <SafeAreaProvider>
          <GestureHandlerRootView className="flex-1">
            <ClerkLoading>
              {/* render loading spinner if Clerk has not loaded yet */}
              <ActivityIndicator />
            </ClerkLoading>
            <ClerkLoaded>
              <AuthConditionalRender />
            </ClerkLoaded>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </GluestackUIProvider>
    </ClerkProvider>
  );
}
