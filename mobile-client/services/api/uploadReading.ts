import { customFetch, ErrorResponse } from './customFetch';

export interface ReadingData {
  emotion: string;
  is_accurate: boolean;
  location?: string;
  note?: string;
  timestamp: string;
  clerk_id: string;
}

interface UploadReadingResponse {
  message: string;
}

// uploads the reading data to the server
export const uploadReading = async (
  readingData: ReadingData,
  token: string
): Promise<UploadReadingResponse | ErrorResponse> => {
  try {
    const response = await customFetch<UploadReadingResponse | ErrorResponse>(
      process.env.EXPO_PUBLIC_API_DEV_URL + '/reading',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(readingData),
      }
    );
    if ('error' in response) {
      return response as ErrorResponse;
    }
    return response as UploadReadingResponse;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw new Error(`${error.message || 'Failed to upload reading'}`);
    }
    throw new Error('Failed to upload reading');
  }
};
