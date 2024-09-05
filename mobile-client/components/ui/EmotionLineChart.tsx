import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, View, Text, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmotionCountsOverTime } from '@/services/api/fetchUserData';
import { Card } from './gluestack-imports/card';
import getEmoji from '../helpers/getEmoji';
import { Sizes } from '@/constants/Sizes';
import { Menu } from 'lucide-react-native';
import { CurveType } from 'gifted-charts-core';
import LineChartFilters from './LineChartFilterActionSheet';
import { ChartData, formatLineChartData } from '../helpers/formatLineChartData';

interface EmotionLineChartProps {
  data: EmotionCountsOverTime;
}

export default function EmotionLineChart({
  data,
}: EmotionLineChartProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<EmotionCountsOverTime | null>(
    null
  );
  const [showActionsheet, setShowActionsheet] = useState<boolean>(false);
  const [timeframeLabel, setTimeframeLabel] = useState<string>('Past 30 Days');

  // set the chart dimensions based on the screen size
  const { width, height } = Dimensions.get('window');
  const headerHeight: number = useHeaderHeight();
  const tabBarHeight: number = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const chartHeight: number =
    (height - headerHeight * 2 - tabBarHeight * 2 - insets.top - insets.bottom) /
    1.15; //
  const chartWidth: number = width / 1.3;

  // process initial data - if no filteredData default of happy/sad on weekly timeframe
  const initialChartData: EmotionCountsOverTime = filteredData || data;
  const initialProcessedData = formatLineChartData(initialChartData);
  const [chartData, setChartData] = useState<ChartData>(initialProcessedData);

  const activeEmotions: string[] = Object.keys(filteredData || data); // send to LineChartFilters to display emotions already selected
  // update chart data when new filters are selected - called after handleFetchFilteredData
  useEffect(() => {
    if (filteredData) {
      const updatedChartData = formatLineChartData(filteredData);
      setChartData(updatedChartData);
      setIsLoading(false);
    }
  }, [filteredData]);

  // recieves filtered data from LineChartFilters component, updates state and label
  const handleFetchFilteredData = (
    newData: EmotionCountsOverTime,
    filters: { emotions: string[]; timeframe: string }
  ) => {
    setIsLoading(true);
    setFilteredData(newData);
    switch (filters.timeframe) {
      case '7d':
        setTimeframeLabel('Past 7 Days');
        break;
      case '30d':
        setTimeframeLabel('Past 30 Days');
        break;
      case '1yr':
        setTimeframeLabel('This Year');
        break;
      default:
        setTimeframeLabel('Past 30 Days');
        break;
    }
  };
  return (
    <>
      <Card
        key={'line-chart'}
        variant="elevated"
        className="shadow-sm rounded-3xl mt-12 items-center align-center flex-col-reverse pr-8 justify-center pb-4">
        <Text className="text-center pb-2 pt-4 italic text-lg">
          {timeframeLabel}
        </Text>

        {isLoading && <ActivityIndicator />}
        {(filteredData || data) && (
          <LineChart
            key={JSON.stringify(chartData.dataSet)} // key forces a re-render when data changes fixes a bug where the chart lines wouldnt update
            areaChart={Object.keys(filteredData || data).length < 4} // area chart looks better, but when too many lines data is hard to read
            curved
            curveType={CurveType.QUADRATIC}
            curvature={0.2}
            isAnimated
            xAxisLabelTexts={chartData.xAxisLabels}
            yAxisThickness={0}
            xAxisThickness={0}
            height={chartHeight}
            width={chartWidth}
            maxValue={chartData.maxValue}
            noOfSections={chartData.noOfSections}
            stepValue={chartData.stepValue}
            showVerticalLines
            nestedScrollEnabled
            yAxisOffset={0}
            spacing={50}
            verticalLinesUptoDataPoint
            scrollToEnd
            onDataChangeAnimationDuration={2000}
            dataSet={chartData.dataSet}
            startOpacity={0.6}
            endOpacity={0.3}
          />
        )}
        <View className="flex-row items-center w-full relative gap-3 ml-3 justify-center">
          <Pressable
            className="absolute top-0 right-0 p-2 w-50 h-50 z-50"
            // actionsheet for filtering data
            onPress={() => setShowActionsheet(true)}>
            <Menu color={'grey'} size={28} />
          </Pressable>
          {(filteredData || data) &&
            Object.keys(filteredData || data).map(emotion => (
              <React.Fragment key={emotion}>
                {getEmoji({
                  emotion: emotion,
                  height: Sizes.LINE_CHART_LABEL_SIZE,
                  width: Sizes.LINE_CHART_LABEL_SIZE,
                })}
              </React.Fragment>
            ))}
        </View>
      </Card>
      <LineChartFilters
        showActionsheet={showActionsheet}
        setShowActionsheet={setShowActionsheet}
        activeEmotions={activeEmotions} // pass in the emotions already selected
        timeframeLabel={timeframeLabel} // pass in the current timeframe label
        onFetchFilteredData={handleFetchFilteredData} // callback to update chart data
      />
    </>
  );
}
