import React, { useEffect } from 'react';
import { Href, router, Slot, usePathname } from 'expo-router';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  ClerkProvider,
  ClerkLoaded,
  ClerkLoading,
  useAuth,
} from '@clerk/clerk-expo';
import { tokenCache } from '@/services/tokenCache';
import { ActivityIndicator } from 'react-native';

const publishableKey: string = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error('Missing Clerk Publishable Key');
}

// redirect to auth or public based on sign in status
const AuthConditionalRender = () => {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      router.replace('(auth)' as Href);
    } else {
      // this should work wihtout the /login, (public)/_layout.tsx should deal with routing to its first screen,
      // but get unmatched route error without it
      router.replace('(public)/login' as Href);
    }
  }, [isSignedIn]);
  // Return Slot to ensure rendering root layout before redirecting - error without it
  return <Slot />;
  // NOTE: cant render a stack because <SignedIn>/<SignedOut> are not allowed as children of a stack
  // bit of a hack as this renders home page first if not signed in, then redirects to signup - though its not noticeable user side
  // home content is blocked by wrapping in <SignedIn> from Clerk, so it's not a critical issue
};

export default function RootLayout() {
  const path = usePathname();
  console.log('Current path: ', path);
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <GluestackUIProvider mode="light">
        <SafeAreaProvider>
          <ClerkLoading>
            {/* render loading spinner if Clerk has not loaded yet
                should still check for !isLoaded in sign in/up processes
                for component specific states */}
            <ActivityIndicator />
          </ClerkLoading>
          <ClerkLoaded>
            <AuthConditionalRender />
          </ClerkLoaded>
        </SafeAreaProvider>
      </GluestackUIProvider>
    </ClerkProvider>
  );
}
