import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Card } from '@/components/ui/gluestack-imports/card';
import getEmoji from '../helpers/getEmoji';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Menu } from 'lucide-react-native';
import { ReadingsResponse } from '@/services/api/fetchUserData';
import ChartFilterActionSheet from './BarChartFilterActionSheet';
import formatFilterDescription from '@/services/formatFilterDescription';
import { Location } from '@/constants/Locations';

interface EmotionBarChartProps {
  counts: ReadingsResponse['counts'];
}

const Bars = ({ counts }: EmotionBarChartProps) => {
  const emotions = Object.keys(counts);
  // map over keys of counts to access the values and create the bars labels, colours and values
  const bars = emotions.map(emotion => {
    const frontColor = Colors[emotion.toUpperCase()];
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
  return bars;
};

export default function EmotionBarChart({
  counts,
}: EmotionBarChartProps): React.JSX.Element {
  const [showActionsheet, setShowActionsheet] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<ReadingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterDescription, setFilterDescription] = useState<string>('This Week');

  // fetch the filtered data from the action sheet, format the description and set the data in state
  const handleFetchFilteredData = (
    data: ReadingsResponse,
    filters: { timeframe: string; location?: Location }
  ) => {
    setFilteredData(data);
    setFilterDescription(
      formatFilterDescription(filters.timeframe, filters.location)
    );
  };

  // check the total count, if 0 display a message to take a reading
  let totalCount = 0;
  if (counts) {
    // counts will always be 0 if there are no readings, wait incase actual data is loading
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
    for (const key in counts) {
      totalCount += counts[key];
    }
  }
  return (
    <>
      <Card
        key={'barchart'}
        variant="elevated"
        className="shadow-sm rounded-3xl mt-2 pb-8 relative flex items-center justify-center">
        <Text className="text-center pt-1">{filterDescription}</Text>
        {isLoading && <ActivityIndicator />}
        {totalCount === 0 && !isLoading && (
          <Text className="text-center italic text-gray-400 absolute pb-6">
            No readings yet, take a photo to start tracking!
          </Text>
        )}
        <Pressable
          className="absolute top-2 right-2 p-4 w-50 h-50 justify-center align-center z-50"
          onPress={() => setShowActionsheet(true)}>
          <Menu color={'grey'} size={28} />
        </Pressable>
        <BarChart
          data={Bars({
            counts: filteredData ? filteredData.counts : counts,
          })}
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
      </Card>
      <ChartFilterActionSheet
        showActionsheet={showActionsheet}
        setShowActionsheet={setShowActionsheet}
        onFetchFilteredData={handleFetchFilteredData}
      />
    </>
  );
}
