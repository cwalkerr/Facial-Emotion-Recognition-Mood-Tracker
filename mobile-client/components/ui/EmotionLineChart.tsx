import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, View, Text, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmotionCountsOverTime } from '@/services/api/fetchUserData';
import { Colors } from '@/constants/Colors';
import { formatShortDate } from '@/services/formatDateTime';
import { Card } from './gluestack-imports/card';
import getEmoji from '../helpers/getEmoji';
import { Sizes } from '@/constants/Sizes';
import { Menu } from 'lucide-react-native';
import { CurveType } from 'gifted-charts-core';
import LineChartFilters from './LineChartFilterActionSheet';

interface EmotionLineChartProps {
  data: EmotionCountsOverTime;
}

// represents a single data set in the chart (arr of { value: number } objs) line, points, colours config refrencing LineChart props
interface DataSetItem {
  data: { value: number }[];
  startFillColor: string;
  color: string;
  thickness: number;
  dataPointColor: string;
  endFillColor: string;
  key: string;
}

// represents the data that the chart needs to render arr of data sets, labels('dd/MM') , max y axis value etc
interface ChartData {
  dataSet: DataSetItem[];
  xAxisLabels: string[];
  maxValue: number;
  noOfSections: number;
  stepValue: number;
}

// process the data from the api into the format needed for the chart
const processChartData = (data: EmotionCountsOverTime): ChartData => {
  if (!data) throw new Error('Data is requriredto process chart data');

  // create the data sets for each emotion present
  const newDataSet: DataSetItem[] = Object.keys(data).map(emotion => ({
    // iterate over date: count array for each emotion included and create value: count obj for each date
    data: data[emotion].map(arrItem => ({ value: arrItem.count })),
    // styling for the line and points
    startFillColor: Colors[emotion.toUpperCase()],
    color: Colors[emotion.toUpperCase()],
    thickness: 6,
    dataPointColor: Colors[emotion.toUpperCase()],
    endFillColor: '#ffffff',
    key: `${emotion}`,
  }));
  // create the x axis labels from the first data set dates (all data sets will have the same dates)
  const newXAxisLabels =
    data[Object.keys(data)[0]].map(arrItem => formatShortDate(arrItem.date)) || [];

  // calculate the highest count in the data to set the max value of the chart
  const highestCount = Object.keys(data).reduce(
    (accumulator: number, emotion: string) => {
      for (const item of data[emotion]) {
        if (item.count > accumulator) {
          accumulator = item.count;
        }
      }
      return accumulator;
    },
    2
  );
  // if the highest count is less than 4, set the max value to 4, otherwise add 1 to the highest count - makes the chart look better
  const adjustedHighestCount = highestCount < 4 ? 4 : highestCount + 1;
  // calculate the number of sections and step value for the y axis
  let numSections: number = 0;
  switch (true) {
    case adjustedHighestCount <= 10:
      numSections = adjustedHighestCount;
      break;
    case adjustedHighestCount <= 20:
      numSections = 10;
      break;
    case adjustedHighestCount <= 40:
      numSections = 12;
      break;
    case adjustedHighestCount <= 50:
      numSections = 15;
      break;
    default:
      numSections = adjustedHighestCount / 5;
      break;
  }
  const step = adjustedHighestCount / numSections;

  return {
    dataSet: newDataSet,
    xAxisLabels: newXAxisLabels,
    maxValue: adjustedHighestCount,
    noOfSections: numSections,
    stepValue: step,
  };
};

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
  const initialProcessedData = processChartData(initialChartData);
  const [chartData, setChartData] = useState<ChartData>(initialProcessedData);

  const activeEmotions: string[] = Object.keys(filteredData || data); // send to LineChartFilters to display emotions already selected
  console.log('activeEmotions', activeEmotions);
  // update chart data when new filters are selected - called after handleFetchFilteredData
  useEffect(() => {
    if (filteredData) {
      const updatedChartData = processChartData(filteredData);
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
