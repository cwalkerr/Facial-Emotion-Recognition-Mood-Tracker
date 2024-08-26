import { Location } from '@/constants/Locations';
import { customFetch } from './customFetch';

// defines the types of each reading object
export interface EmotionReading {
  id: number;
  emotion: string;
  location?: Location;
  datetime: string;
  note?: string;
}
export interface ReadingCounts {
  [emotion: string]: number;
}
// tells ts that these reading objects are an array of readings
export interface ReadingsResponse {
  readings: EmotionReading[];
  counts: ReadingCounts;
}

export interface EmotionCount {
  date: string;
  count: number;
}

export interface EmotionCountsOverTime {
  [emotion: string]: EmotionCount[];
}

// list of optional filters
export interface UserDataFilters {
  start_date?: string;
  end_date?: string;
  emotion?: string;
  location?: Location;
}

export const fetchReadings = async (
  clerk_id: string,
  token: string,
  filters?: UserDataFilters
): Promise<ReadingsResponse> => {
  // query params object, always include clerk id, include any filters specified
  const queryParams = new URLSearchParams({
    clerk_id,
    ...filters,
  });
  try {
    const response = await customFetch(
      `${process.env.EXPO_PUBLIC_API_DEV_URL}/reading?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response as ReadingsResponse;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw new Error(`${error.message || 'Failed to fetch Readings'}`);
    }
    throw new Error('Failed to fetch readings');
  }
};

export const fetchCountsOverTime = async (
  clerk_id: string,
  token: string,
  timeframe: string, // ('7d', '30d', '1y')
  emotions: string[]
): Promise<EmotionCountsOverTime> => {
  const queryParams = new URLSearchParams({
    clerk_id,
    timeframe,
  });
  emotions.forEach(emotion => queryParams.append('emotions', emotion));
  try {
    const response = await customFetch(
      `${process.env.EXPO_PUBLIC_API_DEV_URL}/reading/emotion-counts?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response as EmotionCountsOverTime;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw new Error(`${error.message || 'Failed to fetch counts over time'}`);
    }
    throw new Error('Failed to fetch counts over time');
  }
};
