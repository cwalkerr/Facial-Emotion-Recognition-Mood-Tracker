import { View } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import getEmoji from '@/components/helpers/getEmoji';
import { Button } from '@/components/ui/gluestack-imports/button';

export default function Results(): React.JSX.Element {
  const { emotion } = useLocalSearchParams<{ emotion: string }>();

  return (
    <View className="flex-1 items-center">
      {/* maybe remove the container styles prop and just wrap in a view, thats more consistant with what ill be doing for the rest of the ui? */}
      {getEmoji({
        emotion,
        height: 72,
        width: 72,
        containerStyles: 'items-center absolute top-20',
        textStyles: 'mt-4 text-xl text-center capitalize',
      })}
      <View>
        <Button></Button>
      </View>
    </View>
  );
}
