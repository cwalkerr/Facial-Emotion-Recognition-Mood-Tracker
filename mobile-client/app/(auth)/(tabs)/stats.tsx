import React, { useEffect, useState } from 'react';
import { View, Alert, ActivityIndicator, Text } from 'react-native';
import EmotionLineChart from '@/components/ui/EmotionLineChart';
import { useAuth } from '@clerk/clerk-expo';
import {
  EmotionCountsOverTime,
  fetchCountsOverTime,
} from '@/services/api/fetchUserData';
import { Emotions } from '@/constants/Emotions';
export default function Stats() {
  const { getToken, userId, isLoaded } = useAuth();
  const [countData, setCountData] = useState<EmotionCountsOverTime | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // set time for loading as countData is defined but chart still not rendered - probably better way to do this
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // if clerk is not loaded show loading spinner
  if (!isLoaded) {
    return <ActivityIndicator />;
  }
  const handleError = (
    logMessage: string,
    alertMessage: string = 'Something went wrong, please reload the app'
  ): void => {
    console.error(logMessage);
    Alert.alert('Error', alertMessage);
  };

  // fetch the default filters on page load
  useEffect(() => {
    const fetchEmotionCountData = async (
      timeframe: string = '30d',
      emotions: string[] = [Emotions.Happy, Emotions.Neutral]
    ) => {
      try {
        const token = await getToken();

        if (!userId) {
          handleError('ClerkID is null');
          return;
        }
        if (token === null) {
          handleError('Token is null');
          return;
        }
        const data: EmotionCountsOverTime = await fetchCountsOverTime(
          userId,
          token,
          timeframe,
          emotions
        );
        console.log(data);
        setCountData(data);
      } catch (error) {
        handleError('Failed to fetch emotion count data');
      }
    };

    fetchEmotionCountData();
  }, [userId, getToken]);

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
