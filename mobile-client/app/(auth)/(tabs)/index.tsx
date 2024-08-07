import { useUser } from '@clerk/clerk-expo';

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function Home() {
  const { user } = useUser();

  if (!user) return <ActivityIndicator />;

  return (
    <View className="flex-1 justify-center items-center">
      <Text>Email: {user.primaryEmailAddress?.emailAddress}</Text>
      <Text>User ID: {user.id}</Text>
    </View>
  );
}
