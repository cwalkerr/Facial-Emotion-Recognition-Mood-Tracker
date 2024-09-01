import { ClerkAPIError } from '@clerk/types';
import { isClerkAPIResponseError } from '@clerk/clerk-expo';
import { Alert } from 'react-native';

/**
 * Error handling for login and sign up screens
 * @param e ClerkAPIError or a JWT unauthorized error
 * @returns Alert with user-friendly error message
 */
const handleAuthError = (e: unknown): void => {
  if (isClerkAPIResponseError(e)) {
    const firstError: ClerkAPIError = e.errors[0];
    if (firstError.longMessage === 'email_address must be a valid email address.') {
      return Alert.alert('Please enter a valid email address.');
    }
    return Alert.alert(firstError.longMessage || firstError.message);
  } else if (e instanceof Error && e.message.includes('Unauthorized')) {
    return Alert.alert('Authentication with server failed, please try again.');
  }
  return Alert.alert('An error occurred, please try again.');
};

export default handleAuthError;
