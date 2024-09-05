/**
 * POST request to upload a photo to the server returning a prediction of the emotion in the photo
 */

import { customFetch, ErrorResponse } from './customFetch';

export interface PredictionResponse {
  prediction: string;
  confidence: number;
}

export const uploadPhoto = async (
  photoBase64: string,
  token: string
): Promise<PredictionResponse | ErrorResponse> => {
  try {
    const response: PredictionResponse | ErrorResponse = await customFetch<
      PredictionResponse | ErrorResponse
    >(process.env.EXPO_PUBLIC_API_DEV_URL + '/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ image: photoBase64 }),
    });
    if ('error' in response) {
      return response as ErrorResponse;
    }
    return response as PredictionResponse;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw new Error(`${error.message || 'Failed to upload photo'}`);
    }
    throw new Error('Failed to upload photo');
  }
};
