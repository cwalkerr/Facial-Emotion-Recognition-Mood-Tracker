/**
 * POST request to upload a photo to the server
 * This function currently sends the base64 encoded image to the server.
 * This is not the most efficient way to send images, using FormData with a Blob is better.
 * however, this causes an error seeminly relating to the way FastAPI handles file uploads.
 * This is a common issue from what I've read when using React Native - though i cant understand why it would be an issue.
 * ive tried wrappiing the blob in a File object as well as using XMLHttpRequest,
 * Axios and Fetch, and omitting/including headers and different form data configurations.
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
