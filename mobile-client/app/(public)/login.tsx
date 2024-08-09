import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  TextInput,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Href, Link, router } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import handleAuthError from '@/services/errors/handleAuthError';

export default function Login(): React.JSX.Element {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [emailAddress, setEmail] = React.useState('');
  // see comments in /signup.tsx for more info on isLoading
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [password, setPassword] = React.useState('');

  const onSignInPress = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    if (!isLoaded) return;
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        // will just check token and fetch user data in auth before render
        // prevents checking token here just to send it again 1 second later
        router.replace('(auth)' as Href);
      }
    } catch (e) {
      handleAuthError(e);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, emailAddress, password]);

  return (
    <View className="flex-1 justify-center items-center px-5">
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text className="text-xl">Register</Text>
          <TextInput
            placeholder="example@email.com"
            value={emailAddress}
            onChangeText={emailAddress => setEmail(emailAddress)}
            className="h-12 border border-grey-300 rounded-lg w-1/2 px-4 mt-5 mb-6"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={password => setPassword(password)}
            secureTextEntry={true}
            className="h-12 border border-grey-300 rounded-lg w-1/2 px-4 mt-5 mb-6"
          />
          <Button
            onPress={onSignInPress}
            size="lg"
            className="rounded-lg"
            disabled={!isLoaded || isLoading || !emailAddress || !password}>
            <ButtonText>Sign In</ButtonText>
          </Button>
          <View>
            <Text className="text-lg">Don&apos;t have an account?</Text>
            <Link href="/signup" asChild>
              <TouchableOpacity>
                <Text className="text-xl">Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </>
      )}
    </View>
  );
}
