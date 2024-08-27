import React from 'react';
import { View, ActivityIndicator, Text, FlatList } from 'react-native';
import { Card } from '@/components/ui/gluestack-imports/card';
import { useUser } from '@clerk/clerk-expo';
import getEmoji from '@/components/helpers/getEmoji';
import { useRefreshDataContext } from '@/contexts/RefreshDataContext';
import { formatTime } from '@/services/formatDateTime';
import { ReadingsResponse, EmotionReading } from '@/services/api/fetchUserData';
import EmotionBarChart from '@/components/ui/EmotionBarChart';
import { format } from 'date-fns';

// list of support messages to display as placeholders for reading cards
const supportMessages: string[] = [
  'You’re doing great, one step at a time. Keep going!',
  'Even the darkest night will end, and the sun will rise.',
  '“Life can only be understood backwards; but it must be lived forwards.” — Søren Kierkegaard',
  '"Each day provides its own gifts - Marcus Aurelius"',
  'Small progress is still progress. Celebrate every little win!',
  '“You have power over your mind — not outside events. Realize this, and you will find strength.” — Marcus Aurelius',
  '"The journey of a thousand miles begins with a single step.” — Lao Tzu',
  'Don’t forget to take a moment to appreciate how far you’ve come.',
];
// defining this here makes more sense, fetch a weeks data from api as the weekly data will be needed for the chart
// filter that weekly data to get the days data here as this is the only place that will need it
const getTodaysReadings = (userDataResponse: ReadingsResponse): EmotionReading[] => {
  const today = format(new Date(), 'yyyy-MM-dd');
  // filter weekly readings to create new array with only todays readings
  const todaysReadings: EmotionReading[] = userDataResponse.readings.filter(
    reading => reading.datetime.startsWith(today)
  );
  return todaysReadings;
};

export default function Home() {
  const { user } = useUser();
  const { userData } = useRefreshDataContext();

  if (!user) throw new Error('User is null');

  // load todays readings
  let todaysReadings: EmotionReading[] = [];
  if (userData) todaysReadings = getTodaysReadings(userData);

  const displayedCards = [...todaysReadings];
  // if there are less than 3 readings, add placeholders - keeps the layout in place
  const noOfPlaceholders = Math.max(0, 3 - todaysReadings.length);
  for (let i = 0; i < noOfPlaceholders; i++) {
    displayedCards.push({
      id: -1,
      emotion: 'null',
      datetime: 'null',
      note: 'Wait for the first notification or start today off by taking a photo!',
    });
  }

  return (
    <View className="flex-1 justify-start items-center p-4 mt-4">
      {!userData && (
        <ActivityIndicator size={'large'} className="absolute top-1/2 " />
      )}
      <Text className="self-start ml-4 mb-2">Today&rsquo;s Readings</Text>
      {userData && (
        <FlatList
          className="w-full flex-grow-0 p-1"
          data={displayedCards}
          renderItem={({ item: reading, index }) => {
            let placeholderMessage: string = '....';
            // check if the reading is a placeholder, -1 is the placeholder id
            if (reading.id === -1) {
              // if the first card is a placeholder, display the placeholder note
              if (index === 0) {
                placeholderMessage = reading.note!;
                // if the previous card is not a placeholder, but this one is, display a random support message
              } else if (index > 0 && displayedCards[index - 1].id !== -1) {
                placeholderMessage =
                  supportMessages[
                    Math.floor(Math.random() * supportMessages.length)
                  ];
              }
            }
            return reading.id === -1 ? (
              <Card
                variant="elevated"
                className="shadow-sm flex-row items-center rounded-3xl my-2 w-full">
                <View className="flex-row items-center">
                  <View className="items-center justify-center h-[48px]">
                    <Text className="font-semibold items-center justify-center text-gray-400">
                      {placeholderMessage}
                    </Text>
                  </View>
                </View>
              </Card>
            ) : (
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
                      {reading.location && ` : ${reading.location}`}
                    </Text>
                    <Text className="text-lg capitalize">{reading.emotion}</Text>
                  </View>
                </View>
              </Card>
            );
          }}
          keyExtractor={(reading, index) =>
            reading.id === -1 ? `placeholder-${index}` : reading.id.toString()
          }
          scrollEnabled={displayedCards.length > 3} // scroll if more than 3 cards
          style={{ height: 3 * 92 }} //  the height of 3 cards - from the devices i have tested on these all work at the fixed height - should cover most devices, small devices may have a slight overflow with CameraFAB
          showsVerticalScrollIndicator={false}
        />
      )}
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
