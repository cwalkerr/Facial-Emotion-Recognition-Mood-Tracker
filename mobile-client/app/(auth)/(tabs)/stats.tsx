import React, { useEffect, useState } from 'react';
import { View, Alert, ActivityIndicator, Text } from 'react-native';
import EmotionLineChart from '@/components/ui/EmotionLineChart';
import { useAuth } from '@clerk/clerk-expo';
import {
  EmotionCountsOverTime,
  fetchCountsOverTime,
} from '@/services/api/fetchUserData';
import { Emotions } from '@/constants/Emotions';
import { ErrorResponse } from '@/services/api/customFetch';
import { useUserDataContext } from '@/contexts/RefreshDataContext';

export default function Stats() {
  const { userId, getToken } = useAuth();
  const { userData } = useUserDataContext();
  const [countData, setCountData] = useState<EmotionCountsOverTime | undefined>(
    undefined
  );

  // Fetch new data when userData changes
  useEffect(() => {
    const fetchEmotionCountData = async (
      timeframe: string = '30d',
      emotions: string[] = [Emotions.Happy, Emotions.Sad]
    ) => {
      try {
        const token = await getToken();
        if (!userId || !token || !userData) {
          return;
        }
        const response: EmotionCountsOverTime | ErrorResponse =
          await fetchCountsOverTime(userId!, token!, timeframe, emotions);
        if ('error' in response) {
          if (typeof response.error === 'string') {
            Alert.alert('Error', response.error);
          } else {
            Alert.alert('Error', 'An unknown error occurred');
          }
          return;
        }
        setCountData(response);
      } catch (error) {
        console.error('Failed to fetch emotion count data', error);
        Alert.alert('Error', 'Failed to fetch emotion count data, please try again');
      }
    };

    fetchEmotionCountData();
  }, [userData]);

  const getTotalCounts = (countData: EmotionCountsOverTime): number => {
    return Object.keys(countData).reduce((total, emotion) => {
      const emotionCounts = countData[emotion];
      const emotionTotal = emotionCounts.reduce((sum, { count }) => sum + count, 0);
      return total + emotionTotal;
    }, 0);
  };

  return (
    <View className="flex-1 items-center justify-center">
      <View className="mx-4 mb-28">
        {/* display loading spinner defined at top of component */}
        {!countData ? (
          <ActivityIndicator />
        ) : getTotalCounts(countData) > 0 ? (
          // if user has data, display the line chart with the default filters
          <EmotionLineChart data={countData} />
        ) : (
          <Text>No data to display, get started by taking a photo!</Text>
        )}
      </View>
    </View>
  );
}
