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
import { uploadResult, ReadingData } from '@/services/api/uploadResult';
import { useRefreshDataContext } from '@/contexts/RefreshDataContext';

export default function Results(): React.JSX.Element {
  const { emotion: initialEmotion } = useLocalSearchParams<{ emotion: string }>();
  const keyboard = useAnimatedKeyboard();
  const [emotion, setEmotion] = useState<string>(initialEmotion);
  const [isAccurate, setIsAccurate] = useState<boolean | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [showCarousel, setShowCarousel] = useState<boolean>(false);
  const { getToken, userId } = useAuth();
  const { setIsFromResults } = useRefreshDataContext();

  // listens for changes in isAccurate; when false, shows the carousel that the user uses to select the correct emotion
  useEffect(() => {
    if (isAccurate === false) setShowCarousel(true);
  }, [isAccurate]);

  // toggles the active location button
  const toggleActiveLocation = (button: string) => {
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

  const handleError = (
    logMessage: string,
    alertMessage: string = 'Failed to upload reading, please try again'
  ): void => {
    console.error(logMessage);
    Alert.alert('Error', alertMessage);
  };

  // gathers the reading data and token and sends it to the server
  const sendReading = useCallback(async (): Promise<void> => {
    // its best to get the token within the function that needs it, rather than on page mount
    // clerk doesnt tell you how long the token is valid for
    const token = await getToken();
    const timestamp = new Date().toISOString();

    if (!userId) {
      handleError('ClerkID is null');
      return;
    }
    if (token === null) {
      handleError('Token is null');
      return;
    }
    // keeps ts happy - cannot and should not be null at this point
    // id say this is better than using a non-null assertion operator or making it optional within the ReadingData interface
    if (isAccurate === null) {
      handleError('isAccurate is null');
      return;
    }

    const readingData: ReadingData = {
      emotion,
      is_accurate: isAccurate,
      timestamp,
      clerk_id: userId,
    };
    // only add optional values if they are not null
    // better defining a helper function to clean any object
    // though this is the only place that null values are being removed
    if (location !== null) readingData.location = location;
    if (note !== null) readingData.note = note;

    // send the reading data to the server
    try {
      await uploadResult(readingData, token);
      setIsFromResults(true); // pass state to tell tabs layout to refresh user data as coming from results
      // using replace here scraps stack to unmount the camera view, preventing memory leak,
      // keep camera mounted before here, allows users to go back to camera from results with quicker load times
      router.replace(`/` as Href);
    } catch (error) {
      if (error instanceof Error) {
        handleError(error.message);
      } else {
        handleError('Unknown error occurred');
      }
    }
  }, [getToken, emotion, isAccurate, location, note, uploadResult, router]);

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
            {/* this can likely be done programatically mapping icons names to location names and
             iterating over a loop to display rather than adding each on its own*/}
            <Card variant="elevated" className="shadow-sm rounded-3xl">
              <View className="p-2 items-center">
                <ButtonGroup space="2xl">
                  <View className="items-center">
                    <IconButton
                      icon={House}
                      onPress={() => toggleActiveLocation('Home')}
                      btnStyles={
                        location === 'Home'
                          ? 'bg-custom-base border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text
                      className={`mt-1 ${location === 'Home' ? 'font-semibold' : ''}`}>
                      Home
                    </Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={BriefcaseBusiness}
                      onPress={() => toggleActiveLocation('Work')}
                      btnStyles={
                        location === 'Work'
                          ? 'bg-custom-base border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text
                      className={`mt-1 ${location === 'Work' ? 'font-semibold' : ''}`}>
                      Work
                    </Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={GraduationCap}
                      onPress={() => {
                        toggleActiveLocation('School');
                      }}
                      btnStyles={
                        location === 'School'
                          ? 'bg-custom-base border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text
                      className={`mt-1 ${location === 'School' ? 'font-semibold' : ''}`}>
                      School
                    </Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={Dumbbell}
                      onPress={() => toggleActiveLocation('Gym')}
                      btnStyles={
                        location === 'Gym'
                          ? 'bg-custom-base border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text
                      className={`mt-1 ${location === 'Gym' ? 'font-semibold' : ''}`}>
                      Gym
                    </Text>
                  </View>
                </ButtonGroup>
              </View>
              <View className="mt-2 p-2">
                <ButtonGroup space="xl">
                  <View className="items-center">
                    <IconButton
                      icon={TrainFront}
                      onPress={() => toggleActiveLocation('Commute')}
                      btnStyles={
                        location === 'Commute'
                          ? 'bg-custom-base border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text
                      className={`mt-1 ${location === 'Commute' ? 'font-semibold' : ''}`}>
                      Commute
                    </Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={Trees}
                      onPress={() => toggleActiveLocation('Outdoors')}
                      btnStyles={
                        location === 'Outdoors'
                          ? 'bg-custom-base border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text
                      className={`mt-1 ${location === 'Outdoors' ? 'font-semibold' : ''}`}>
                      Outdoors
                    </Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={Utensils}
                      onPress={() => toggleActiveLocation('Restaurant')}
                      btnStyles={
                        location === 'Restaurant'
                          ? 'bg-custom-base border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text
                      className={`mt-1 ${location === 'Restaurant' ? 'font-semibold' : ''}`}>
                      Restaurant
                    </Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={ShoppingCart}
                      onPress={() => toggleActiveLocation('Shopping')}
                      btnStyles={
                        location === 'Shopping'
                          ? 'bg-custom-base border border-3 border-green-500'
                          : ''
                      }
                    />
                    <Text
                      className={`mt-1 ${location === 'Shopping' ? 'font-semibold' : ''}`}>
                      Shopping
                    </Text>
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
                className="rounded-2xl bg-custom-primary shadow-sm active:bg-custom-base"
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
