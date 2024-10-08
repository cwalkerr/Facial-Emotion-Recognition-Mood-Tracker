import { Location } from '@/constants/Locations';
import { customFetch, ErrorResponse } from './customFetch';

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
): Promise<ReadingsResponse | ErrorResponse> => {
  // query params object, always include clerk id, include any filters specified
  const queryParams = new URLSearchParams({
    clerk_id,
    ...filters,
  });
  try {
    const response: ReadingsResponse | ErrorResponse = await customFetch<
      ReadingsResponse | ErrorResponse
    >(`${process.env.EXPO_PUBLIC_API_DEV_URL}/readings?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if ('error' in response) {
      return response as ErrorResponse;
    }
    return response as ReadingsResponse;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw new Error(`${error.message || 'Failed to fetch Readings'}`);
    }
    throw new Error('Failed to fetch readings');
  }
};

// fetches the emotion counts over a specified time frame used for the line chart
export const fetchCountsOverTime = async (
  clerk_id: string,
  token: string,
  timeframe: string, // ('7d', '30d', '1y')
  emotions: string[]
): Promise<EmotionCountsOverTime | ErrorResponse> => {
  const queryParams = new URLSearchParams({
    clerk_id,
    timeframe,
  });
  emotions.forEach(emotion => queryParams.append('emotions', emotion));
  try {
    const response: EmotionCountsOverTime | ErrorResponse = await customFetch<
      EmotionCountsOverTime | ErrorResponse
    >(
      `${process.env.EXPO_PUBLIC_API_DEV_URL}/readings/emotion-counts?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if ('error' in response) {
      return response as ErrorResponse;
    }
    return response as EmotionCountsOverTime;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw new Error(`${error.message || 'Failed to fetch counts over time'}`);
    }
    throw new Error('Failed to fetch counts over time');
  }
};
