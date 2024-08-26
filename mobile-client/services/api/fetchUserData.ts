import { Location } from '@/constants/Locations';

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

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_DEV_URL}/reading?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `${response.status}, ${error.message || 'Failed to get User Data'}`
    );
  }

  const result: ReadingsResponse = await response.json();
  return result;
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

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_DEV_URL}/reading/emotion-counts?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `${response.status}, ${error.message || 'Failed to get Counts Over Time'}`
    );
  }

  const result: EmotionCountsOverTime = await response.json();
  return result as EmotionCountsOverTime;
};
