/**
 * POST request to upload a photo to the server
 * Note for future developers: This function currently sends the base64 encoded image to the server.
 * This is not the most efficient way to send images, using FormData with a Blob is better.
 * however, this causes an error seeminly relating to the way FastAPI handles file uploads.
 * This is a common issue from what I've read when using React Native - though i cant understand why it would be an issue.
 * ive tried wrappiing the blob in a File object as well as using XMLHttpRequest,
 * Axios and Fetch, and omitting/including headers and different form data configurations.
 */
const uploadPhoto = async (photoBase64: string) => {
  try {
    const response = await fetch(process.env.EXPO_PUBLIC_API_DEV_URL + '/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: photoBase64 }),
    });
    const result = await response.json();

    console.log('Photo uploaded', result);
  } catch (error) {
    console.error('Error uploading photo', error);
  }
};
export default uploadPhoto;
