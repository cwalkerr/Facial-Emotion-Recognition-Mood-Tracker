import { View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
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

export default function Results(): React.JSX.Element {
  const { emotion: initialEmotion } = useLocalSearchParams<{ emotion: string }>();
  const keyboard = useAnimatedKeyboard();
  const [emotion, setEmotion] = useState<string>(initialEmotion);
  const [isAccurate, setIsAccurate] = useState<boolean | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [showCarousel, setShowCarousel] = useState<boolean>(false);

  // listens for changes in isAccurate; when false, shows the carousel that the user uses to select the correct emotion
  useEffect(() => {
    if (isAccurate === false) setShowCarousel(true);
  }, [isAccurate]);

  // toggles the active location button
  const toggleActiveLocation = (button: string) => {
    location === button ? setLocation(null) : setLocation(button);
  };

  const storeResults = () => {
    const data = {
      emotion,
      isAccurate,
      location,
      note,
    };
    console.log(data);
    // send data to the server...
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
                      onPress={() => toggleActiveLocation('home')}
                    />
                    <Text className="mt-1">Home</Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={BriefcaseBusiness}
                      onPress={() => toggleActiveLocation('work')}
                    />
                    <Text className="mt-1">Work</Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={GraduationCap}
                      onPress={() => {
                        toggleActiveLocation('school');
                      }}
                    />
                    <Text className="mt-1">School</Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={Dumbbell}
                      onPress={() => {
                        toggleActiveLocation('gym');
                      }}
                    />
                    <Text className="mt-1">Gym</Text>
                  </View>
                </ButtonGroup>
              </View>
              <View className="mt-2 p-2">
                <ButtonGroup space="xl">
                  <View className="items-center">
                    <IconButton
                      icon={TrainFront}
                      onPress={() => toggleActiveLocation('commute')}
                    />
                    <Text className="mt-1">Commute</Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={Trees}
                      onPress={() => toggleActiveLocation('outdoors')}
                    />
                    <Text className="mt-1">Outdoors</Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={Utensils}
                      onPress={() => toggleActiveLocation('restaurant')}
                    />
                    <Text className="mt-1">Restaurant</Text>
                  </View>
                  <View className="items-center">
                    <IconButton
                      icon={ShoppingCart}
                      onPress={() => toggleActiveLocation('shopping')}
                    />
                    <Text className="mt-1">Shopping</Text>
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
                onPress={() => storeResults()}>
                <ButtonText>Continue</ButtonText>
              </Button>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}
