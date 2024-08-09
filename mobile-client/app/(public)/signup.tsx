import React from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { useState } from 'react';
import { isClerkAPIResponseError, useSignUp, useAuth } from '@clerk/clerk-expo';
import { ClerkAPIError } from '@clerk/types';
import { Href, router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import uploadId from '@/services/api/uploadClerkId';

export default function SignUp() {
  // isLoaded indicates whether Clerk has finished initialising and its components are ready to use
  // isLoading is used to track the state of ongoing sign up or verificaion processes initiated by the user
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [emailAddress, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [pendingVerification, setPendingVerification] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');
  const { getToken } = useAuth();
  /**
   * Basic error handling for SignUp
   * @param e: Error, likely a ClerkAPIError or JWT error
   * @returns Alert to user with error message
   * this is a mess need to sort it out later
   */
  const handleSignUpError = (e: unknown): void => {
    if (isClerkAPIResponseError(e)) {
      const firstError: ClerkAPIError = e.errors[0];
      if (
        firstError.longMessage === 'email_address must be a valid email address.'
      ) {
        return Alert.alert('Please enter a valid email address.');
      }
      return Alert.alert(firstError.longMessage || firstError.message);
    } else if (e instanceof Error && e.message.includes('Unauthorized')) {
      return Alert.alert('Authentication failed, please try again later.');
    }
    return Alert.alert('An error occurred, please try again.');
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

        const token = await getToken(); // get the JWT token
        if (!token) {
          throw new Error('No token found');
        }
        await uploadId(clerkUserId, token); // upload the clerk ID to the API to be stored in db

        router.replace('(auth)' as Href); // redirect to home page after successful sign up and ID upload
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
