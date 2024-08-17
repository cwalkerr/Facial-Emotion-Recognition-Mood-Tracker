// defines the types of each reading object
interface EmotionReading {
  id: number;
  emotion: string;
  location?: string;
  datetime: string;
  note?: string;
}
// tells ts that these reading objects are an array of readings
export interface UserDataResponse {
  readings: EmotionReading[];
}

const getUserData = async (
  clerk_id: string,
  token: string
): Promise<UserDataResponse> => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_DEV_URL}/reading?clerk_id=${clerk_id}`,
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

export default getUserData;
