import React, { useCallback } from 'react';
import { View, Dimensions } from 'react-native';
import { interpolate } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import getEmoji from '@/components/helpers/getEmoji';

// constants for the width and height of the carousel
const window = Dimensions.get('window');
const CAROUSEL_WIDTH = window.width; // full width of the screen
const CAROUSEL_HEIGHT = 124; // hardcoded height, not ideal - needs to fit the emoji plus text underneath

// list of all the emotions - used to pass each into the getEmoji function - which accepts a single string
const emotions = [
  'ANGRY',
  'DISGUSTED',
  'HAPPY',
  'NEUTRAL',
  'SAD',
  'SCARED',
  'SUPRISED',
];

interface EmojiCarouselProps {
  initialEmotion: string;
  onSnapToItem: (emotion: string) => void;
}

/**
 * A carousel to select an emotion, modified from the react-native-reanimated-carousel 'rotate-in-out' example
 */
export default function EmojiCarousel({
  initialEmotion, // the emotion as classified by the model, starts as the initial index of the carousel
  onSnapToItem,
}: EmojiCarouselProps): React.JSX.Element {
  const initialIndex = emotions.indexOf(initialEmotion);

  // when the carousel snaps to an item, assign the active emotion to the selected item, this is passed up to the results screen component.
  const handleSnapToItem = (index: number) => {
    const newEmotion = emotions[index]; // get the emotion from its index in the list, as the carousel keeps track of the index
    onSnapToItem(newEmotion);
  };

  // this is taken from the example, handles the animation of the carousel
  const animationStyle = useCallback((value: number) => {
    'worklet';

    const zIndex = interpolate(value, [-1, 0, 1], [10, 20, 30]);
    const rotateZ = `${interpolate(value, [-1, 0, 1], [-45, 0, 45])}deg`;
    const translateX = interpolate(
      value,
      [-1, 0, 1],
      [-window.width, 0, window.width]
    );

    return {
      transform: [{ rotateZ }, { translateX }],
      zIndex,
    };
  }, []);

  return (
    <View style={{ width: CAROUSEL_WIDTH, height: CAROUSEL_HEIGHT }}>
      <Carousel
        loop
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
        width={CAROUSEL_WIDTH}
        height={CAROUSEL_HEIGHT}
        data={emotions}
        // render each emotion with text in the carousel
        renderItem={({ index }) => {
          const emotion: string = emotions[index];
          return (
            <View className="items-center">
              {getEmoji({
                emotion,
                height: 72,
                width: 72,
                textStyles: 'mt-4 text-2xl capitalize',
              })}
            </View>
          );
        }}
        autoPlay={false}
        customAnimation={animationStyle}
        defaultIndex={initialIndex}
        onSnapToItem={handleSnapToItem}
      />
    </View>
  );
}
