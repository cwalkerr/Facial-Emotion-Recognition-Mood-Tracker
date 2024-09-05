import { formatLineChartData } from '@/components/helpers/formatLineChartData';
import { EmotionCountsOverTime } from '@/services/api/fetchUserData';

describe('formatLineChartData', () => {
  const mockData: EmotionCountsOverTime = {
    happy: [
      { date: '2024-01-01', count: 5 },
      { date: '2024-01-02', count: 3 },
    ],
    sad: [
      { date: '2024-01-01', count: 2 },
      { date: '2024-01-02', count: 4 },
    ],
  };
  const mockDataMaxCountLessThanFour: EmotionCountsOverTime = {
    happy: [
      { date: '2024-01-01', count: 1 },
      { date: '2024-01-02', count: 3 },
    ],
    sad: [
      { date: '2024-01-01', count: 2 },
      { date: '2024-01-02', count: 3 },
    ],
  };
  const mockDataMaxCountEdgeCase: EmotionCountsOverTime = {
    happy: [
      { date: '2024-01-01', count: 4 },
      { date: '2024-01-02', count: 1 },
    ],
    sad: [
      { date: '2024-01-01', count: 4 },
      { date: '2024-01-02', count: 3 },
    ],
  };
  const mockDataCountOverFifty: EmotionCountsOverTime = {
    happy: [
      { date: '2024-01-01', count: 50 },
      { date: '2024-01-02', count: 3 },
    ],
    sad: [
      { date: '2024-01-01', count: 2 },
      { date: '2024-01-02', count: 4 },
    ],
  };

  it('should create line chart datasets for the correct emotions', () => {
    const result = formatLineChartData(mockData);
    expect(result.dataSet).toHaveLength(2);
    expect(result.dataSet[0].key).toBe('happy');
    expect(result.dataSet[1].key).toBe('sad');
  });

  it('should create the correct formatted x-axis labels', () => {
    const result = formatLineChartData(mockData);
    expect(result.xAxisLabels).toEqual(['01/01', '02/01']);
  });

  it('should increment the highest count by 1 if larger than 4', () => {
    const result = formatLineChartData(mockData);
    expect(result.maxValue).toBe(6);
  });

  it('should adjust the highest count to 4 if less than 4', () => {
    const result = formatLineChartData(mockDataMaxCountLessThanFour);
    expect(result.maxValue).toBe(4);
  });

  it('should adjust the highest count to 5 if equal to 4', () => {
    const result = formatLineChartData(mockDataMaxCountEdgeCase);
    expect(result.maxValue).toBe(5);
  });

  it('should calculate the number of sections and step value correctly', () => {
    const result = formatLineChartData(mockData);
    expect(result.noOfSections).toBe(6);
    expect(result.stepValue).toBe(1);
  });

  it('should calculate the number of sections and step value correctly for potential floats', () => {
    const result = formatLineChartData(mockDataCountOverFifty);
    expect(result.noOfSections).toBe(12);
    expect(result.stepValue).toBe(4);
  });
});
