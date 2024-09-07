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
  const mockDataLessThanFour: EmotionCountsOverTime = {
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
  const mockDataEqualToTen: EmotionCountsOverTime = {
    happy: [
      { date: '2024-01-01', count: 9 },
      { date: '2024-01-02', count: 3 },
    ],
    sad: [
      { date: '2024-01-01', count: 2 },
      { date: '2024-01-02', count: 4 },
    ],
  };

  const mockDataEqualToTwenty: EmotionCountsOverTime = {
    happy: [
      { date: '2024-01-01', count: 19 },
      { date: '2024-01-02', count: 3 },
    ],
    sad: [
      { date: '2024-01-01', count: 2 },
      { date: '2024-01-02', count: 4 },
    ],
  };

  const mockDataEqualToForty: EmotionCountsOverTime = {
    happy: [
      { date: '2024-01-01', count: 39 },
      { date: '2024-01-02', count: 3 },
    ],
    sad: [
      { date: '2024-01-01', count: 2 },
      { date: '2024-01-02', count: 4 },
    ],
  };

  const mockDataEqualToFifty: EmotionCountsOverTime = {
    happy: [
      { date: '2024-01-01', count: 49 },
      { date: '2024-01-02', count: 3 },
    ],
    sad: [
      { date: '2024-01-01', count: 2 },
      { date: '2024-01-02', count: 4 },
    ],
  };
  const mockDataCountOverFifty: EmotionCountsOverTime = {
    happy: [
      { date: '2024-01-01', count: 51 },
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

  // Test Case ID: 5.4.5.1
  it('should increment the highest count by 1 if larger than 4', () => {
    const result = formatLineChartData(mockData);
    expect(result.maxValue).toBe(6);
  });

  // Test Case ID: 5.4.5.2
  it('should adjust the highest count to 4 if less than 4', () => {
    const result = formatLineChartData(mockDataLessThanFour);
    expect(result.maxValue).toBe(4);
  });

  // Test Case ID: 5.4.5.3
  it('should adjust the highest count to 5 if equal to 4', () => {
    const result = formatLineChartData(mockDataMaxCountEdgeCase);
    expect(result.maxValue).toBe(5);
  });

  it('should calculate the number of sections and step value correctly for highest count less than 4', () => {
    const result = formatLineChartData(mockDataLessThanFour);
    expect(result.noOfSections).toBe(4);
    expect(result.stepValue).toBe(1);
  });

  it('should calculate the number of sections and step value correctly for highest count equal to 10', () => {
    const result = formatLineChartData(mockDataEqualToTen);
    expect(result.noOfSections).toBe(10);
    expect(result.stepValue).toBe(1);
  });

  it('should calculate the number of sections and step value correctly for highest count equal to 20', () => {
    const result = formatLineChartData(mockDataEqualToTwenty);
    expect(result.noOfSections).toBe(10);
    expect(result.stepValue).toBe(2);
  });

  it('should calculate the number of sections and step value correctly for highest count equal to 40', () => {
    const result = formatLineChartData(mockDataEqualToForty);
    expect(result.noOfSections).toBe(12);
    expect(result.stepValue).toBe(3);
  });

  it('should calculate the number of sections and step value correctly for highest count equal to 50', () => {
    const result = formatLineChartData(mockDataEqualToFifty);
    expect(result.noOfSections).toBe(14);
    expect(result.stepValue).toBe(3);
  });

  it('should calculate the number of sections and step value correctly for the largest bracket', () => {
    const result = formatLineChartData(mockDataCountOverFifty);
    expect(result.noOfSections).toBe(13);
    expect(result.stepValue).toBe(4);
  });
});
