import { Colors } from '@/constants/Colors';
import { EmotionCountsOverTime } from '@/services/api/fetchUserData';
import { formatShortDate } from '@/services/formatDateTime';

// represents a single data set in the chart (arr of { value: number } objs) line, points, colours config refrencing LineChart props
export interface DataSetItem {
  data: { value: number }[];
  startFillColor: string;
  color: string;
  thickness: number;
  dataPointColor: string;
  endFillColor: string;
  key: string;
}

// represents the data that the chart needs to render arr of data sets, labels('dd/MM') , max y axis value etc
export interface LineChartData {
  dataSet: DataSetItem[];
  xAxisLabels: string[];
  maxValue: number;
  noOfSections: number;
  stepValue: number;
}

/*
 * process the data from the api into the format needed for the chart
 */
export const formatLineChartData = (data: EmotionCountsOverTime): LineChartData => {
  if (!data) throw new Error('Data is requrired to process chart data');

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
    0
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
      numSections = 14;
      break;
    default:
      numSections = Math.floor(adjustedHighestCount / 4);
      break;
  }
  const step = Math.floor(adjustedHighestCount / numSections);

  return {
    dataSet: newDataSet,
    xAxisLabels: newXAxisLabels,
    maxValue: adjustedHighestCount,
    noOfSections: numSections,
    stepValue: step,
  };
};
