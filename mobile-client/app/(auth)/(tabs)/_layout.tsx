import React from 'react';
import { Href, Tabs, router } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import CameraFAB from '@/components/ui/CameraFab';
import { useAuth } from '@clerk/clerk-expo';
import { View, Text, Pressable } from 'react-native';
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

// Tab layout for the app, contains the header, tabs and camera FAB, also handles sign out from the header
export default function TabLayout() {
  const { userId } = useAuth();
  const { signOut } = useClerk();

  // clear notification token and sign out
  const handleSignOut = async (): Promise<void> => {
    unregisterIndieDevice(userId, 23234, 'FKm0BCSKvpNzIANZW8cif5');
    signOut({ redirectUrl: '(public)' });
  };

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
          router.replace('cameraPreview' as Href);
        }}
      />
    </>
  );
}
