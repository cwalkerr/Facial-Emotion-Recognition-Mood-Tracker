import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Card } from './gluestack-imports/card';
import { toZonedTime } from 'date-fns-tz';

interface TimePickerProps {
  startTime: Date;
  setStartTime: React.Dispatch<React.SetStateAction<Date>>;
  endTime: Date;
  setEndTime: React.Dispatch<React.SetStateAction<Date>>;
}

// TimePicker component - allows user to select start and end time for notifications
export const TimePicker = ({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
}: TimePickerProps): React.JSX.Element => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // gets the device's timezone

  const onStartTimeChange = (
    event: DateTimePickerEvent,
    selectedTime: Date | undefined
  ) => {
    if (selectedTime === undefined) {
      return;
    }
    if (endTime < selectedTime) {
      return;
    }
    const newStartTime = toZonedTime(selectedTime, timeZone);
    setStartTime(newStartTime);
  };

  const onEndTimeChange = (
    event: DateTimePickerEvent,
    selectedTime: Date | undefined
  ) => {
    if (selectedTime === undefined) {
      return;
    }
    const newEndTime = toZonedTime(selectedTime, timeZone);
    setEndTime(newEndTime);
  };

  return (
    <SafeAreaView>
      <Card variant="elevated" className="shadow-sm rounded-3xl mt-6 p-6">
        <View className="justify-center align-center">
          <View className="flex-row align-center">
            <Text className="text-lg font-semibold mt-1 mr-2">
              Notification Start Time :{' '}
            </Text>
            <DateTimePicker
              themeVariant="light"
              style={{ width: 100 }}
              value={startTime}
              mode="time"
              is24Hour={true}
              onChange={onStartTimeChange}
            />
          </View>
        </View>
        <View className="mt-6 justify-center align-center">
          <View className="flex-row align-center">
            <Text className="text-lg font-semibold mt-1 mr-2">
              Notification End Time :{' '}
            </Text>
            <DateTimePicker
              themeVariant="light"
              style={{ width: 100, marginLeft: 9 }}
              value={endTime}
              mode="time"
              is24Hour={true}
              onChange={onEndTimeChange}
            />
          </View>
        </View>
      </Card>
    </SafeAreaView>
  );
};
