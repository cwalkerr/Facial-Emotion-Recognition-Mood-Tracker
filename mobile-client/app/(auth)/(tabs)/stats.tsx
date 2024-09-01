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
import { checkForNullOrUndefined } from '@/services/errors/checkForNullOrUndefined';
import { useRefreshDataContext } from '@/contexts/RefreshDataContext';
export default function Stats() {
  const { getToken, userId, isLoaded } = useAuth();
  const [countData, setCountData] = useState<EmotionCountsOverTime | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { isFromResults } = useRefreshDataContext(); // if clerk is not loaded show loading spinner
  if (!isLoaded) {
    return (
      <ActivityIndicator size={'large'} className="justify-center items-center" />
    );
  }
  // fetch the default filters on page load
  useEffect(() => {
    const fetchEmotionCountData = async (
      timeframe: string = '30d',
      emotions: string[] = [Emotions.Happy, Emotions.Sad]
    ) => {
      try {
        const token = await getToken();

        if (!checkForNullOrUndefined({ userId, token })) {
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
  }, [userId, getToken, isFromResults]);

  // set time for loading as countData is defined but chart still not rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [isFromResults]);

  return (
    <View className="flex-1 items-center justify-center">
      <View className="mx-4 mb-28">
        {/* display loading spinner defined at top of component */}
        {isLoading ? (
          <ActivityIndicator />
        ) : countData ? (
          // if user has data, display the line chart with the default filters
          <EmotionLineChart data={countData} />
        ) : (
          <Text>No data to display, get started by taking a photo!</Text>
        )}
      </View>
    </View>
  );
}
