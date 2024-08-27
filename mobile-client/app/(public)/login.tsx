import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  TextInput,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Button, ButtonText } from '@/components/ui/gluestack-imports/button';
import { Href, Link, router } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import handleAuthError from '@/services/errors/handleAuthError';
import { Image } from 'expo-image';

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
    <>
      <View className="flex-1 justify-start items-center mt-6">
        <Image
          source={require('@/assets/Logo.png')}
          style={{ width: 200, height: 200 }}
          className="flex-start"
          priority={'high'}
        />
        <Text className="text-4xl text-center mb-5">MoodMirror</Text>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <View className="w-full p-6">
            <Text className="text-2xl text-center mb-4">Log in</Text>
            <Text className="text-left mb-1 ml-3">Email</Text>
            <TextInput
              placeholder="example@email.com"
              value={emailAddress}
              onChangeText={emailAddress => setEmail(emailAddress)}
              className="h-12 border border-gray-500 rounded-2xl w-full px-4 mb-6"
            />
            <Text className="text-left mb-1 ml-3">Password</Text>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={password => setPassword(password)}
              secureTextEntry={true}
              className="h-12 border border-gray-500 rounded-2xl w-full px-4 mb-6"
            />
            <Button
              onPress={onSignInPress}
              size="lg"
              className="rounded-2xl bg-custom-primary active:bg-custom-base mx-10 shadow-sm"
              disabled={!isLoaded || isLoading || !emailAddress || !password}>
              <ButtonText>Log In</ButtonText>
            </Button>
            <View className="mt-6">
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text className="text-lg text-center">
                    Don&apos;t have an account? Sign up here!
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        )}
      </View>
    </>
  );
}
