import React, { useEffect } from 'react';
import { Href, Tabs, router } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import CameraFAB from '@/components/ui/CameraFab';
import { useRefreshDataContext } from '@/contexts/RefreshDataContext';
import { fetchWeeklyData } from '@/services/api/userDataUtils';
import { useAuth } from '@clerk/clerk-expo';
import { ActivityIndicator, Alert, View, Text, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSameWeek } from 'date-fns';
import { formatDate } from '@/services/formatDateTime';
import { EllipsisIcon } from 'lucide-react-native';
import {
  Menu,
  MenuItem,
  MenuItemLabel,
} from '@/components/ui/gluestack-imports/menu';
import { LogOutIcon } from 'lucide-react-native';
import { useClerk } from '@clerk/clerk-expo';
import { unregisterIndieDevice } from 'native-notify';
import { StatusBar } from 'expo-status-bar';

export default function TabLayout() {
  const { getToken, userId, isLoaded } = useAuth();
  const { setUserData, isFromResults } = useRefreshDataContext();
  const { signOut } = useClerk();

  const handleError = (
    logMessage: string,
    alertMessage: string = 'Something went wrong, please reload the app'
  ): void => {
    console.error(logMessage);
    Alert.alert('Error', alertMessage);
  };

  // clear async storage on sign out, if signing in on a different account, this will prevent the device from loading the previous users data
  const handleSignOut = async (): Promise<void> => {
    await AsyncStorage.clear();
    unregisterIndieDevice(userId, 23234, 'FKm0BCSKvpNzIANZW8cif5');
    signOut({ redirectUrl: '(public)' });
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
      <StatusBar style="dark" />
      <View className="flex-1">
        <Tabs
          screenOptions={{
            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              elevation: 0, // remove shadow on Android
              shadowOpacity: 0, // remove shadow on iOS
            },
            headerStyle: {
              backgroundColor: 'transparent',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleAlign: 'center', // tailwind styling for header title not working on android, adding this here ensures it is centered
            headerTitle: () => (
              <View className=" relative items-center justify-center w-full flex-row mt-5">
                {/* todays date formatted i.e. "18th August 2024" */}
                <Text className="text-2xl text-center mx-20">
                  {formatDate(new Date())}
                </Text>
                <Menu
                  placement="bottom left"
                  offset={5}
                  crossOffset={8}
                  className={'mr-6'}
                  trigger={({ ...triggerProps }) => {
                    return (
                      <Pressable
                        {...triggerProps}
                        className="absolute top-0 right-0">
                        <EllipsisIcon size={32} color={'grey'} />
                      </Pressable>
                    );
                  }}>
                  <MenuItem
                    onPress={handleSignOut}
                    key="signOut"
                    textValue="Sign Out">
                    <LogOutIcon size={26} color={'#692f70'} />
                    <MenuItemLabel size="lg" className="ml-2">
                      Sign Out
                    </MenuItemLabel>
                  </MenuItem>
                </Menu>
              </View>
            ),
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
              tabBarActiveTintColor: '#692f70',
            }}
          />
          <Tabs.Screen
            name="stats"
            options={{
              title: 'Stats',
              tabBarIcon: ({ color }) => (
                <TabBarIcon name="stats-chart" color={color} />
              ),
              tabBarActiveTintColor: '#692f70',
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
