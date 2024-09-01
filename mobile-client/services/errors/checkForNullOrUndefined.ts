/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from 'react-native';

// checks for null or undefined values in an object, used to check things that are provided by clerk
export const checkForNullOrUndefined = (values: { [key: string]: any }): boolean => {
  for (const [key, value] of Object.entries(values)) {
    if (value === null || value === undefined) {
      console.error(`${key} is null or undefined`);
      // generic error message as not related to null user input
      if (key === 'userData') {
        Alert.alert(
          'Error',
          `There was a problem locating your user data, please reload the app`
        );
      } else {
        Alert.alert('Error', `An error occurred on our end, please try again`);
      }
      return false;
    }
  }
  return true;
};
