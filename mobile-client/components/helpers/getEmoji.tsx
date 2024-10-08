import React from 'react';
import Angry from '@/assets/emojis/Angry.jsx';
import Happy from '@/assets/emojis/Happy.jsx';
import Sad from '@/assets/emojis/Sad.jsx';
import Neutral from '@/assets/emojis/Neutral.jsx';
import Disgust from '@/assets/emojis/Disgust.jsx';
import Fear from '@/assets/emojis/Fear.jsx';
import Surprise from '@/assets/emojis/Surprise.jsx';
import { Text } from 'react-native';

interface EmojiProps {
  emotion: string;
  height: number;
  width: number;
  textStyles?: string;
}

// EmojiComponent returns the JSX render of Emoji svg based on the emotion passed, can be styled with height and width
const getEmoji = ({
  emotion,
  height,
  width,
  textStyles,
}: EmojiProps): React.JSX.Element => {
  let EmojiComponent;
  emotion = emotion.toUpperCase();
  switch (emotion) {
    case 'ANGRY':
      EmojiComponent = <Angry height={height} width={width} />;
      break;
    case 'HAPPY':
      EmojiComponent = <Happy height={height} width={width} />;
      break;
    case 'SAD':
      EmojiComponent = <Sad height={height} width={width} />;
      break;
    case 'NEUTRAL':
      EmojiComponent = <Neutral height={height} width={width} />;
      break;
    case 'DISGUSTED':
      EmojiComponent = <Disgust height={height} width={width} />;
      break;
    case 'SCARED':
      EmojiComponent = <Fear height={height} width={width} />;
      break;
    case 'SURPRISED':
      EmojiComponent = <Surprise height={height} width={width} />;
      break;
    default:
      throw new Error('Invalid emotion');
  }
  // only add the text component if styles for it are provided
  return (
    <>
      {EmojiComponent}
      {textStyles && <Text className={textStyles}> {emotion} </Text>}
    </>
  );
};

export default getEmoji;
