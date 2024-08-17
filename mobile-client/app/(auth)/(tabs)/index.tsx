import { useUser } from '@clerk/clerk-expo';
import { useRefreshDataContext } from '@/contexts/RefreshDataContext';

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function Home() {
  const { user } = useUser();
  const { userData } = useRefreshDataContext();

  if (!user) return <ActivityIndicator />;

  return (
    <View className="flex-1 justify-center items-center">
      <Text>Email: {user.primaryEmailAddress?.emailAddress}</Text>
      <Text>User ID: {user.id}</Text>
      {userData && <Text>{JSON.stringify(userData)}</Text>}
    </View>
  );
}
