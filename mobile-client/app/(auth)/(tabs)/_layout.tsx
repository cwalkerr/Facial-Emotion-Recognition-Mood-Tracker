import React from 'react';
import { Href, Tabs, router } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import CameraFAB from '@/components/CameraFab';

export default function TabLayout() {
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
