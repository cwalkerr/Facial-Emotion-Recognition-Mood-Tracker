import React, { useEffect } from 'react';
import { Href, Tabs, router } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import CameraFAB from '@/components/CameraFab';
import { useRefreshDataContext } from '@/contexts/RefreshDataContext';
import fetchUserData from '@/services/api/fetchUserData';
import { useAuth } from '@clerk/clerk-expo';
import { ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSameWeek } from 'date-fns';

export default function TabLayout() {
  const { getToken, userId, isLoaded } = useAuth();
  const { setUserData, isFromResults } = useRefreshDataContext();

  const handleError = (
    logMessage: string,
    alertMessage: string = 'Failed to upload reading, please try again'
  ): void => {
    console.error(logMessage);
    Alert.alert('Error', alertMessage);
  };

  // will listen for path returning from results and refresh user data, sets it in state to be used in home/stats pages
  useEffect(() => {
    const getData = async () => {
      if (!isLoaded) return <ActivityIndicator />;

      const token = await getToken();

      if (!userId) {
        handleError('ClerkID is null');
        return;
      }
      if (token === null) {
        handleError('Token is null');
        return;
      }
      // if navigated from results call api to refresh data
      if (isFromResults) {
        const data = await fetchUserData(userId, token);
        setUserData(data);
        // save new data in persistant storage
        await AsyncStorage.setItem('userData', JSON.stringify(data));
        await AsyncStorage.setItem('lastFetchedDate', new Date().toISOString());
      } else {
        // on component mount (app reload) check if data exists in persistant storage
        const storedData = await AsyncStorage.getItem('userData');
        const lastFetchedDate = await AsyncStorage.getItem('lastFetchedDate');
        const currentDate = new Date();
        // if data stored is within the current week, retrieve from persistant storage
        if (
          storedData &&
          lastFetchedDate &&
          isSameWeek(new Date(lastFetchedDate), currentDate)
        ) {
          setUserData(JSON.parse(storedData));
        } else {
          // if its a new week, or no data in storage, get fresh data (default view will show this weeks data)
          const data = await fetchUserData(userId, token);
          setUserData(data);
          await AsyncStorage.setItem('userData', JSON.stringify(data));
          await AsyncStorage.setItem('lastFetchedDate', new Date().toISOString());
        }
      }
    };
    getData();
  }, [isFromResults, getToken, userId, isLoaded]);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="stats-chart" color={color} />
            ),
          }}
        />
      </Tabs>
      {/* Opens Camera Preview - Positioned centre of tabs raised*/}
      <CameraFAB
        onPress={() => {
          router.push('cameraPreview' as Href);
        }}
      />
    </>
  );
}
