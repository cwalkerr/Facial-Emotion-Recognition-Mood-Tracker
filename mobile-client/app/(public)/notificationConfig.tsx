import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { TimePicker } from '@/components/ui/TimePicker';
import { Image } from 'expo-image';
import { Button, ButtonText } from '@/components/ui/gluestack-imports/button';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { addUser } from '@/services/api/addUser';
import handleAuthError from '@/services/errors/handleAuthError';
import { registerIndieID } from 'native-notify';
import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';

export default function NotificationConfig() {
  // set the default start and end times for the time picker and set the state
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // gets the device's timezone
  const defaultStartTime = toZonedTime(new Date(), timeZone);
  defaultStartTime.setHours(9, 0, 0, 0); // 9am default
  const defaultEndTime = toZonedTime(new Date(), timeZone);
  defaultEndTime.setHours(21, 0, 0, 0); // 9pm default
  const [startTime, setStartTime] = useState<Date>(defaultStartTime);
  const [endTime, setEndTime] = useState<Date>(defaultEndTime);
  const { clerkId } = useLocalSearchParams();
  const { getToken } = useAuth();

  if (typeof clerkId !== 'string') {
    console.log('Clerk ID is not a string', clerkId);
  }

  // handle the press of the continue button, add the user to the database and navigate to the home screen
  const handlePress = async () => {
    // format the start and end times to HH:mm
    const formattedStartTime = format(startTime, 'HH:mm');
    const formattedEndTime = format(endTime, 'HH:mm');
    const token = await getToken();

    try {
      if (!token) {
        throw new Error('No token found');
      }
      // add the user to the database
      await addUser(
        typeof clerkId === 'string' ? clerkId : clerkId[0],
        token,
        formattedStartTime,
        formattedEndTime
      );
      // register the user with the notification service
      registerIndieID(clerkId, 23234, 'FKm0BCSKvpNzIANZW8cif5');
      router.replace('(auth)' as Href);
    } catch (error) {
      handleAuthError(error);
    }
  };

  return (
    <View className="flex-1 justify-start items-center mt-6 p-6">
      <Image
        source={require('@/assets/Logo.png')}
        style={{ width: 200, height: 200 }}
        className="flex-start"
        priority={'high'}
      />
      <Text className="text-center text-lg">
        MoodMirror sends 3 notifications each day to remind you to track your mood.
        {'\n\n'}
        Please choose your prefered start and end times for these reminders below.
        {'\n\n'}
        For the best experience, set the start time just after you wake up and the
        end time just before you go to bed.
      </Text>
      <TimePicker
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
      />
      <Button
        size="xl"
        className="mt-16 rounded-2xl bg-custom-primary"
        onPress={handlePress}>
        <ButtonText>Continue</ButtonText>
      </Button>
    </View>
  );
}
