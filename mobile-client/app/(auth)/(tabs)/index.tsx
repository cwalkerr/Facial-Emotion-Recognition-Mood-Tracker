import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Card } from '@/components/ui/gluestack-imports/card';
import { useUser } from '@clerk/clerk-expo';
import getEmoji from '@/components/helpers/getEmoji';
import { useRefreshDataContext } from '@/contexts/RefreshDataContext';
import { formatTime } from '@/services/formatDateTime';
import { ReadingsResponse, EmotionReading } from '@/services/api/fetchUserData';
import EmotionBarChart from '@/components/ui/EmotionBarChart';
import { format } from 'date-fns';

// defining this here makes more sense, fetch a weeks data from api as the weekly data will be needed for the chart
// filter that weekly data to get the days data here as this is the only place that will need it
const getTodaysReadings = (userDataResponse: ReadingsResponse): EmotionReading[] => {
  const today = format(new Date(), 'yyyy-MM-dd');
  // filter weekly readings to create new array with only todays readings
  const todaysReadings: EmotionReading[] = userDataResponse.readings.filter(
    reading => reading.datetime.startsWith(today)
  );
  return todaysReadings.slice(0, 3);
};

export default function Home() {
  const { user } = useUser();
  const { userData } = useRefreshDataContext();

  if (!user) return <ActivityIndicator />; // this might lead to infinite loading in rare problem cases - review
  if (!userData)
    return <Text>No readings to display yet, take a photo to get started!</Text>; // this will be displayed if the user has no data

  // load todays readings
  let todaysReadings: EmotionReading[] = [];
  if (userData) todaysReadings = getTodaysReadings(userData);

  return (
    <View className="flex-1 justify-start items-center p-4 mt-4">
      <Text className="self-start ml-4 mb-2">Todays Readings</Text>
      {/* display each of todays readings in a seperate card component */}
      {userData &&
        todaysReadings.map(reading => (
          <Card
            key={reading.id}
            variant="elevated"
            className="shadow-sm flex-row items-center rounded-3xl my-2 w-full">
            <View className="flex-row items-center">
              {getEmoji({
                emotion: reading.emotion,
                height: 48,
                width: 48,
              })}
              <View className="ml-3">
                <Text className="text-lg font-semibold">
                  {formatTime(reading.datetime)}
                </Text>
                <Text className="text-lg capitalize">{reading.emotion}</Text>
              </View>
            </View>
          </Card>
        ))}
      <View className="justify-end p-2">
        {/* still want to display the empty chart if no data... bit of a dodgy workaround for ts error, but is type safe i think */}
        <EmotionBarChart
          counts={
            userData?.counts || {
              Angry: 0,
              Disgusted: 0,
              Scared: 0,
              Happy: 0,
              Neutral: 0,
              Sad: 0,
              Surprised: 0,
            }
          }
        />
      </View>
    </View>
  );
}
