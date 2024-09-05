import { View, Text, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Href, router, useLocalSearchParams } from 'expo-router';
import getEmoji from '@/components/helpers/getEmoji';
import IconButton from '@/components/ui/IconButton';
import {
  House,
  BriefcaseBusiness,
  GraduationCap,
  Dumbbell,
  Trees,
  TrainFront,
  Utensils,
  ShoppingCart,
} from 'lucide-react-native';
import {
  Button,
  ButtonGroup,
  ButtonText,
} from '@/components/ui/gluestack-imports/button';
import { Textarea, TextareaInput } from '@/components/ui/gluestack-imports/textarea';
import { Card } from '@/components/ui/gluestack-imports/card';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
} from 'react-native-reanimated';
import EmojiCarousel from '@/components/ui/EmojiCarousel';
import { useAuth } from '@clerk/clerk-expo';
import { uploadReading, ReadingData } from '@/services/api/uploadReading';
import { useUserDataContext } from '@/contexts/RefreshDataContext';

export default function Results(): React.JSX.Element {
  const { emotion: initialEmotion } = useLocalSearchParams<{ emotion: string }>();
  const keyboard = useAnimatedKeyboard();
  const [emotion, setEmotion] = useState<string>(initialEmotion);
  const [isAccurate, setIsAccurate] = useState<boolean | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [showCarousel, setShowCarousel] = useState<boolean>(false);
  const { getToken, userId } = useAuth();
  const { userData, setUserData } = useUserDataContext();

  // shows the carousel that the user uses to select the correct emotion if the user selects that the emotion is not accurate
  useEffect(() => {
    if (isAccurate === false) setShowCarousel(true);
  }, [isAccurate]);

  // set a single location at a time allowed active across all location buttons
  const toggleLocation = (button: string) => {
    location === button ? setLocation(null) : setLocation(button);
  };

  // moves the screen up when the keyboard is open to prevent the keyboard from covering the input
  const shiftScreenOnKeyboardInput = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: -keyboard.height.value,
        },
      ],
    };
  });
  // gathers the reading data and token and sends it to the server
  const sendReading = useCallback(async (): Promise<void> => {
    const token = await getToken();
    const timestamp = new Date().toISOString();
    if (!token || !userId) {
      return;
    }
    const readingData: ReadingData = {
      emotion,
      is_accurate: isAccurate as boolean, // user cannot continue without selecting accurate or not
      timestamp,
      clerk_id: userId,
    };
    // only add optional values if they are not null
    if (location !== null) readingData.location = location;
    if (note !== null) readingData.note = note;

    // send the reading data to the server
    try {
      const response = await uploadReading(readingData, token!);
      if ('error' in response) {
        Alert.alert('Error', response.error);
        return;
      }

      // upddate the state with the new reading at the beginning of the array as it will be the most recent
      const newReading = response;
      const updatedReadings = [newReading, ...userData!.readings];
      const updatedCounts = {
        ...userData!.counts,
        [newReading.emotion]: userData!.counts[newReading.emotion] + 1,
      };

      setUserData({
        readings: updatedReadings,
        counts: updatedCounts,
      });
      // redirect home screen, replace to unmount camera
      router.replace(`/` as Href);
    } catch (error) {
      console.error('Error uploading reading', error);
      Alert.alert('Error', 'Failed to upload reading, please try again');
    }
  }, [getToken, emotion, isAccurate, location, note, uploadReading, router]);

  return (
    <Animated.View style={shiftScreenOnKeyboardInput} className="flex-1">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 items-center">
          <View className="items-center justify-start mt-16">
            {showCarousel ? (
              <EmojiCarousel initialEmotion={emotion} onSnapToItem={setEmotion} />
            ) : (
              getEmoji({
                emotion,
                height: 72,
                width: 72,
                textStyles: 'mt-4 text-2xl capitalize',
              })
            )}
          </View>
          {/* only display before choice is made, will be null before being true/false */}
          {isAccurate === null && (
            <View className="mt-7 items-center">
              <Text className="text-xl mb-3 italic">Is this accurate?</Text>
              <ButtonGroup space="4xl" className="p-2">
                <Button
                  size="lg"
                  action="positive"
                  className="rounded-2xl opacity-75 shadow-sm active:bg-green-700"
                  onPress={() => setIsAccurate(true)}>
                  <ButtonText>Yes</ButtonText>
                </Button>
                <Button
                  size="lg"
                  action="negative"
                  className="rounded-2xl opacity-75 shadow-sm active:bg-red-600"
                  onPress={() => setIsAccurate(false)}>
                  <ButtonText>No</ButtonText>
                </Button>
              </ButtonGroup>
            </View>
          )}
          {isAccurate === false && (
            <View className="mt-6 items-center">
              <Text className="mb-3 italic text-grey-500">
                Swipe above to select the correct emotion.
              </Text>
            </View>
          )}
          <View className="mt-6">
            <Text className="text-xl p-2 ml-3">Add location?</Text>
            <Card variant="elevated" className="shadow-sm rounded-3xl">
              <View className="p-2 items-center">
                <ButtonGroup space="2xl">
                  <View className="items-center">
                    <IconButton
                      icon={House}
                      iconColor={location ? 'black' : 'white'}
                      onPress={() => toggleLocation('Home')}
                      btnStyles={
                        location === 'Home'
                          ? 'bg-purple-300 border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text className={`mt-1`}>Home</Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={BriefcaseBusiness}
                      iconColor={location ? 'black' : 'white'}
                      onPress={() => toggleLocation('Work')}
                      btnStyles={
                        location === 'Work'
                          ? 'bg-purple-300 border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text className={`mt-1`}>Work</Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={GraduationCap}
                      iconColor={location ? 'black' : 'white'}
                      onPress={() => {
                        toggleLocation('School');
                      }}
                      btnStyles={
                        location === 'School'
                          ? 'bg-purple-300 border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text className={`mt-1`}>School</Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={Dumbbell}
                      iconColor={location ? 'black' : 'white'}
                      onPress={() => toggleLocation('Gym')}
                      btnStyles={
                        location === 'Gym'
                          ? 'bg-purple-300 border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text className={`mt-1`}>Gym</Text>
                  </View>
                </ButtonGroup>
              </View>
              <View className="mt-2 p-2">
                <ButtonGroup space="xl">
                  <View className="items-center">
                    <IconButton
                      icon={TrainFront}
                      iconColor={location ? 'black' : 'white'}
                      onPress={() => toggleLocation('Commute')}
                      btnStyles={
                        location === 'Commute'
                          ? 'bg-purple-300 border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text className={`mt-1`}>Commute</Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={Trees}
                      iconColor={location ? 'black' : 'white'}
                      onPress={() => toggleLocation('Outdoors')}
                      btnStyles={
                        location === 'Outdoors'
                          ? 'bg-purple-300 border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text className={`mt-1`}>Outdoors</Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={Utensils}
                      iconColor={location ? 'black' : 'white'}
                      onPress={() => toggleLocation('Restaurant')}
                      btnStyles={
                        location === 'Restaurant'
                          ? 'bg-purple-300 border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text className={`mt-1`}>Restaurant</Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={ShoppingCart}
                      iconColor={location ? 'black' : 'white'}
                      onPress={() => toggleLocation('Shopping')}
                      btnStyles={
                        location === 'Shopping'
                          ? 'bg-purple-300 border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text className={`mt-1`}>Shopping</Text>
                  </View>
                </ButtonGroup>
              </View>
            </Card>
            <View className="mt-4">
              <Textarea
                size="lg"
                className="rounded-3xl h-56 bg-white shadow-sm p-4">
                <TextareaInput
                  placeholder="Leave a note....."
                  multiline
                  onChangeText={setNote}
                />
              </Textarea>
            </View>
          </View>
          {isAccurate !== null && (
            <View className="mt-6 justify-end">
              <Button
                size="xl"
                className="rounded-2xl bg-custom-primary shadow-sm active:bg-purple-300"
                onPress={() => sendReading()}>
                <ButtonText>Continue</ButtonText>
              </Button>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}
