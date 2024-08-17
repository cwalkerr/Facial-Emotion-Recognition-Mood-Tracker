import React, { useEffect } from 'react';
import { Href, Tabs, router } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import CameraFAB from '@/components/CameraFab';
import { useRefreshDataContext } from '@/contexts/RefreshDataContext';
import getUserData from '@/services/api/getUserData';
import { useAuth } from '@clerk/clerk-expo';
import { ActivityIndicator, Alert } from 'react-native';

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

      if (isFromResults) {
        const token = await getToken();

        if (!userId) {
          handleError('ClerkID is null');
          return;
        }
        if (token === null) {
          handleError('Token is null');
          return;
        }

        const data = await getUserData(userId, token);
        setUserData(data);
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
