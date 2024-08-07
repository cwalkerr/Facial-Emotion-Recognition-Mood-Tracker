/**
 * POST request to upload a photo to the server
 * Note for future developers: This function currently sends the base64 encoded image to the server.
 * This is not the most efficient way to send images, using FormData with a Blob is better.
 * however, this causes an error seeminly relating to the way FastAPI handles file uploads.
 * This is a common issue from what I've read when using React Native - though i cant understand why it would be an issue.
 * ive tried wrappiing the blob in a File object as well as using XMLHttpRequest,
 * Axios and Fetch, and omitting/including headers and different form data configurations.
 */

interface PredictionResponse {
  prediction: string;
  confidence: number;
}

const uploadPhoto = async (photoBase64: string): Promise<PredictionResponse> => {
  try {
    const response = await fetch(process.env.EXPO_PUBLIC_API_DEV_URL + '/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: photoBase64 }),
    });
    if (!response.ok) {
      throw new Error('Failed to retrevie prediction');
    }
    const result: PredictionResponse = await response.json();
    return result;
  } catch (error) {
    console.log(error);
    return { prediction: 'error', confidence: 0 };
  }
};
export default uploadPhoto;
