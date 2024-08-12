import { View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState } from 'react';
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
  Check,
  X,
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

export default function Results(): React.JSX.Element {
  const { emotion: initialEmotion } = useLocalSearchParams<{ emotion: string }>();
  const keyboard = useAnimatedKeyboard();
  const [emotion, setEmotion] = useState<string>(initialEmotion);
  const [isAccurate, setIsAccurate] = useState<boolean | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  // toggles the active location button
  const toggleActiveLocation = (button: string) => {
    location === button ? setLocation(null) : setLocation(button);
  };

  const handleAccuracy = (accuracy: boolean) => {
    setIsAccurate(accuracy);
    if (!accuracy) {
      // show modal to ask for the correct emotion
    }
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
          <View className="items-center absolute top-16">
            {getEmoji({
              emotion,
              height: 72,
              width: 72,
              textStyles: 'mt-4 text-2xl capitalize',
            })}
          </View>
          <View className="mt-56 items-center">
            <Text className="text-xl mb-3">Is this accurate?</Text>
            <ButtonGroup space="4xl" className="p-2">
              <IconButton
                icon={Check}
                btnStyles="w-12 h-12 rounded-full shadow-sm"
                iconStroke={2}
                onPress={() => handleAccuracy(true)}
              />
              <IconButton
                icon={X}
                btnStyles="w-12 h-12 rounded-full shadow-sm"
                iconStroke={2}
                onPress={() => handleAccuracy(false)}
              />
            </ButtonGroup>
          </View>
          <View className="mt-4">
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
                        console.log('gym');
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
          <View className="mt-5 absolute bottom-10">
            <Button size="xl" className="rounded-3xl" onPress={() => storeResults}>
              <ButtonText>Continue</ButtonText>
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}
