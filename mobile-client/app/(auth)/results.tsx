import { View } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import getEmoji from '@/components/helpers/getEmoji';

export default function Results(): React.JSX.Element {
  const { emotion } = useLocalSearchParams<{ emotion: string }>();

  return (
    <View className="flex-1 items-center">
      {getEmoji({
        emotion,
        height: 72,
        width: 72,
        containerStyles: 'items-center absolute top-20',
        textStyles: 'mt-4 text-xl text-center capitalize',
      })}
    </View>
  );
}
