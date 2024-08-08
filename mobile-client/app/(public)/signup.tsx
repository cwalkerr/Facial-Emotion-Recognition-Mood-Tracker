import React from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { useState } from 'react';
import { isClerkAPIResponseError, useSignUp } from '@clerk/clerk-expo';
import { ClerkAPIError } from '@clerk/types';
import { Href, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function SignUp() {
  // these states may seem confusing, to clarify:
  // isLoaded indicates whether Clerk has finished initialising and its components are ready to use
  // isLoading is used to track the state of ongoing sign up or verificaion processes initiated by the user
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailAddress, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [pendingVerification, setPendingVerification] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');
  /**
   * Basic error handling for SignUp
   * @param e: Error, likely a ClerkAPIError
   * @returns Alert to user with error message
   */
  const handleSignUpError = (e: unknown): void => {
    if (isClerkAPIResponseError(e)) {
      const firstError: ClerkAPIError = e.errors[0];
      if (
        // this particular error message is not very user friendly, rest i can find are ok
        firstError.longMessage === 'email_address must be a valid email address.'
      ) {
        return Alert.alert('Please enter a valid email address.');
      }
      return Alert.alert(firstError.longMessage || firstError.message);
    } else {
      console.error('Unknown Error: ', e);
      return Alert.alert('An error occurred, please try again.');
    }
  };

  /**
   * Sends a request to Clerk to sign up a new user
   * sends email verification code if successful
   */
  const onSignUpPress = async (): Promise<void> => {
    if (!isLoaded) return; // don't attempt to sign up if Clerk hasn't loaded yet
    setIsLoading(true); // user has initiated sign up process

    try {
      await signUp.create({
        emailAddress,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (e) {
      handleSignUpError(e);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify the email address via code sent to user
   */
  const onPressVerify = async (): Promise<void> => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId }); // set active session

        const clerkUserId = completeSignUp.createdUserId;
        if (!clerkUserId) {
          throw new Error('No Clerk ID returned');
        }
        // store the clerk ID in secure storage
        await SecureStore.setItemAsync('clerkUserId', clerkUserId);

        router.replace('(auth)' as Href); // redirect to home page after successful sign up
      }
    } catch (e) {
      handleSignUpError(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center px-5">
      {/* Render the view to enter email and password */}
      {!pendingVerification && (
        <>
          {/* loading spinner if user initiated actions still processing, though this state shouldnt be true before signup button pressed */}
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <>
              <Text className="text-xl">Register</Text>
              <TextInput
                className="h-12 border border-grey-300 rounded-lg w-full px-4 mt-5"
                placeholder="example@email.com"
                value={emailAddress}
                onChangeText={email => setEmail(email)}
              />
              <TextInput
                className="h-12 border border-grey-300 rounded-lg w-full px-4 mt-4 mb-6"
                placeholder="Password"
                value={password}
                secureTextEntry={true} // hide password
                onChangeText={password => setPassword(password)}
              />
              <Button
                size="lg"
                className="rounded-lg"
                onPress={onSignUpPress}
                disabled={!isLoaded || !emailAddress || !password || isLoading}>
                <ButtonText>Sign Up</ButtonText>
              </Button>
            </>
          )}
        </>
      )}
      {/* Render the view to enter email verification code */}
      {pendingVerification && (
        <>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <>
              <Text className="text-xl">
                Check your email for a verification code
              </Text>
              <TextInput
                className="h-12 border border-grey-300 rounded-lg w-1/2 px-4 mt-5 mb-6"
                placeholder="Verification Code"
                value={code}
                onChangeText={code => setCode(code)}
              />
              <Button
                onPress={onPressVerify}
                size="lg"
                className="rounded-lg"
                disabled={!isLoaded || isLoading || !code}>
                <ButtonText>Verify Email</ButtonText>
              </Button>
            </>
          )}
        </>
      )}
    </View>
  );
}
