import { Location } from '@/constants/Locations';

// defines the types of each reading object
export interface EmotionReading {
  id: number;
  emotion: string;
  location?: Location;
  datetime: string;
  note?: string;
}
export interface EmotionCounts {
  [emotion: string]: number;
}
// tells ts that these reading objects are an array of readings
export interface UserDataResponse {
  readings: EmotionReading[];
  counts: EmotionCounts;
}
// list of optional filters
export interface UserDataFilters {
  start_date?: string;
  end_date?: string;
  emotion?: string;
  location?: Location;
}

const fetchUserData = async (
  clerk_id: string,
  token: string,
  filters?: UserDataFilters
): Promise<UserDataResponse> => {
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

  const result: UserDataResponse = await response.json();
  return result;
};

export default fetchUserData;
