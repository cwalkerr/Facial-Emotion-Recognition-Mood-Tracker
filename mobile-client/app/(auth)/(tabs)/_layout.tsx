import React, { useEffect } from 'react';
import { Href, Tabs, router } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import CameraFAB from '@/components/ui/CameraFab';
import { useRefreshDataContext } from '@/contexts/RefreshDataContext';
import { fetchWeeklyData } from '@/services/api/userDataUtils';
import { useAuth } from '@clerk/clerk-expo';
import { ActivityIndicator, Alert, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSameWeek } from 'date-fns';
import { formatDate } from '@/services/formatDateTime';

export default function TabLayout() {
  const { getToken, userId, isLoaded } = useAuth();
  const { setUserData, isFromResults } = useRefreshDataContext();

  const handleError = (
    logMessage: string,
    alertMessage: string = 'Something went wrong, please reload the app'
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
      // fetching weekly data in this case is not necessary, i suppose the recently added result could be passsed here in query params
      // then added to the existing data, but this is fine for now
      if (isFromResults) {
        const data = await fetchWeeklyData(userId, token);
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
          // if its a new week, or no data in storage, get fresh data, again, probably redundant as there will be no data, but easy way to reset the persistant storage to null
          const data = await fetchWeeklyData(userId, token);
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
      <View className="flex-1">
        <Tabs
          screenOptions={{
            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor: 'transparent',
              borderTopWidth: 0,
            },
            headerStyle: {
              backgroundColor: 'transparent',
            },
            headerTitle: () => (
              <View className="items-center justify-center mt-5">
                {/* todays date formatted i.e. "18th August 2024" */}
                <Text className="text-2xl">{formatDate(new Date())}</Text>
              </View>
            ),
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
      </View>
      {/* Opens Camera Preview - Positioned centre of tabs raised*/}
      <CameraFAB
        onPress={() => {
          router.push('cameraPreview' as Href);
        }}
      />
    </>
  );
}
