import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Card } from '@/components/ui/gluestack-imports/card';
import getEmoji from '../helpers/getEmoji';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Search } from 'lucide-react-native';
import { UserDataResponse } from '@/services/api/fetchUserData';

interface EmotionBarChartProps {
  counts: UserDataResponse['counts'];
}

const Bars = ({ counts }: EmotionBarChartProps) => {
  const emotions = Object.keys(counts);
  // map over keys of counts to access the values and create the bars labels, colours and values
  const bars = emotions.map(emotion => {
    const frontColor = Colors[emotion.toUpperCase()];
    console.log(
      `Emotion: ${emotion}, Value: ${counts[emotion]}, Color: ${frontColor}`
    );
    return {
      value: counts[emotion],
      labelComponent: () =>
        getEmoji({
          emotion: emotion,
          height: Sizes.BAR_CHART_LABEL_SIZE,
          width: Sizes.BAR_CHART_LABEL_SIZE,
        }),
      frontColor: frontColor,
    };
  });
  console.log(bars);
  return bars;
};

export default function EmotionBarChart({
  counts,
}: EmotionBarChartProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (counts) {
      setIsLoading(false);
    }
  }, [counts]);

  // check the total count, if 0 display a message to take a reading
  let totalCount = 0;
  if (!isLoading && counts) {
    for (const key in counts) {
      totalCount += counts[key];
    }
  }
  return (
    <Card
      key={'barchart'}
      variant="elevated"
      className="shadow-sm rounded-3xl mt-4 pb-8 relative flex items-center justify-center">
      <Text className="text-center pt-1">This Week</Text>
      {isLoading && <ActivityIndicator />}
      {!isLoading && totalCount === 0 && (
        <Text className="text-center italic text-gray-400 absolute pb-6">
          No readings yet, take a photo to start tracking!
        </Text>
      )}
      <Pressable className="absolute top-5 right-5">
        <Search color={'grey'} />
      </Pressable>
      {!isLoading && (
        <BarChart
          data={Bars({ counts })}
          isAnimated
          barBorderRadius={6}
          barWidth={26}
          height={170}
          yAxisLabelWidth={14}
          spacing={15}
          labelsDistanceFromXaxis={1}
          hideAxesAndRules
          disableScroll
          showValuesAsTopLabel
        />
      )}
    </Card>
  );
}
