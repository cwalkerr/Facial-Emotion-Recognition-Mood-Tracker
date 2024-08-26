import { customFetch } from './customFetch';

export interface ReadingData {
  emotion: string;
  is_accurate: boolean;
  location?: string;
  note?: string;
  timestamp: string;
  clerk_id: string;
}

// uploads the reading data to the server
export const uploadResult = async (
  readingData: ReadingData,
  token: string
): Promise<void> => {
  try {
    await customFetch(process.env.EXPO_PUBLIC_API_DEV_URL + '/reading', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(readingData),
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw new Error(`${error.message || 'Failed to upload reading'}`);
    }
    throw new Error('Failed to upload reading');
  }
};
