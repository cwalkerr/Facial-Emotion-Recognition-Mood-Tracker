import React, { createContext, useState, useContext, useEffect } from 'react';
import { EmotionReading, ReadingsResponse } from '@/services/api/fetchUserData';
import { ErrorResponse } from '@/services/api/customFetch';
import { fetchWeeklyData } from '@/services/api/userDataUtils';
import { Alert } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { format } from 'date-fns';

// defines the types of the context/states values - UserDataResponse = (array of emotion readings)
interface UserDataContextProps {
  userData: ReadingsResponse | null;
  setUserData: React.Dispatch<React.SetStateAction<ReadingsResponse | null>>;
  todaysReadings: EmotionReading[];
}

// create context, undefined initial value
export const UserDataContext = createContext<UserDataContextProps | undefined>(
  undefined
);

// State provider component - wraps the authenticated routes,
// handles initial fetch of user data setting in state, updates todays readings when user data changes
export const UserDataStateProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { getToken, userId } = useAuth();
  const [userData, setUserData] = useState<ReadingsResponse | null>(null);
  const [todaysReadings, setTodaysReadings] = useState<EmotionReading[]>([]);

  // fetch user data initial mount on authenticated routes, set in state for bar chart and home screen
  useEffect(() => {
    console.log('refreshing data');
    const getUserData = async () => {
      const token = await getToken();
      if (!userId || !token) {
        throw new Error('User ID or token is null');
      }
      const response: ReadingsResponse | ErrorResponse = await fetchWeeklyData(
        userId!,
        token!
      );
      if ('error' in response) {
        if (typeof response.error === 'string') {
          Alert.alert('Error', response.error);
        } else {
          Alert.alert('Error', 'An unknown error occurred');
        }
        return;
      }
      setUserData(response);
    };
    getUserData();
  }, []);

  // format todays readings for home screen - update with new user data most recent first
  useEffect(() => {
    const refreshTodaysReadings = (
      userDataResponse: ReadingsResponse
    ): EmotionReading[] => {
      const today = format(new Date(), 'yyyy-MM-dd');
      // filter weekly readings to create new array with only todays readings
      const todaysReadings: EmotionReading[] = userDataResponse.readings.filter(
        reading => reading.datetime.startsWith(today)
      );
      return todaysReadings.slice(0, 8);
    };
    if (userData) {
      setTodaysReadings(refreshTodaysReadings(userData));
    }
  }, [userData]);

  return (
    <UserDataContext.Provider
      value={{
        userData,
        setUserData,
        todaysReadings,
      }}>
      {children}
    </UserDataContext.Provider>
  );
};

// hook to access the context values
export const useUserDataContext = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('Trying to useStateContext outwith a StateProvider');
  }
  return context;
};
