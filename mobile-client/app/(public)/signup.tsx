import React, { useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Button, ButtonText } from '@/components/ui/gluestack-imports/button';
import { useState } from 'react';
import { useSignUp } from '@clerk/clerk-expo';
import { Href, Link, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import handleAuthError from '@/services/errors/handleAuthError';
import { Image } from 'expo-image';

export default function SignUp() {
  // isLoaded indicates whether Clerk has finished initialising and its components are ready to use
  // isLoading is used to track the state of ongoing sign up or verificaion processes initiated by the user
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailAddress, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [pendingVerification, setPendingVerification] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');

  /**
   * Sends a request to Clerk to sign up a new user
   * sends email verification code if successful
   */
  const onSignUpPress = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    if (!isLoaded) return; // don't attempt to sign up if Clerk hasn't loaded yet

    try {
      await signUp.create({
        emailAddress,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (e) {
      handleAuthError(e);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, emailAddress, password]);
  /**
   * Verify the email address via code sent to user
   */
  const onPressVerify = async (): Promise<void> => {
    setIsLoading(true);
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId }); // set active session

        const clerkId = completeSignUp.createdUserId;
        if (!clerkId) {
          throw new Error('No Clerk ID returned');
        }
        // store the clerk ID in secure storage
        await SecureStore.setItemAsync('clerkId', clerkId);
        // move to the notification config screen passing the clerk ID as a query param to be sent to the server after the user has set their notification times
        router.replace(`/notificationConfig?clerkId=${clerkId}` as Href);
      }
    } catch (e) {
      handleAuthError(e);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View className="flex-1 justify-start items-center mt-6">
      <Image
        source={require('@/assets/Logo.png')}
        style={{ width: 200, height: 200 }}
        className="flex-start"
        priority={'high'}
      />
      <Text className="text-4xl text-center mb-5">MoodMirror</Text>
      {/* Render the view to enter email and password */}
      {!pendingVerification &&
        (isLoading ? (
          <ActivityIndicator />
        ) : (
          <View className="w-full p-6">
            <Text className="text-2xl text-center mb-4">Sign Up</Text>
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
              onPress={onSignUpPress}
              size="lg"
              className="rounded-2xl bg-custom-primary active:bg-custom-base mx-10 shadow-sm"
              disabled={
                !isLoaded || isLoading || emailAddress == '' || password == ''
              }>
              <ButtonText>Sign Up</ButtonText>
            </Button>
            <View className="mt-6">
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text className="text-lg text-center">
                    Already have an account? Log in here!
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        ))}
      {/* Render the view to enter email verification code */}
      {pendingVerification && (
        <>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <>
              <Text className="text-xl mt-10">
                Check your email for a verification code
              </Text>
              <TextInput
                className="h-12 border border-gray-500 rounded-2xl w-1/2 px-4 my-8"
                placeholder="Verification Code"
                value={code}
                onChangeText={code => setCode(code)}
              />
              <Button
                onPress={onPressVerify}
                size="lg"
                className="rounded-2xl bg-custom-primary active:bg-custom-base mx-10 shadow-sm"
                disabled={!isLoaded || isLoading || code == ''}>
                <ButtonText>Verify Email</ButtonText>
              </Button>
            </>
          )}
        </>
      )}
    </View>
  );
}
