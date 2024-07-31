import uuid from "react-native-uuid";
import axios from "axios";

/**
 * POST request to upload a photo to the server
 * @param photoUri The URI of the photo to upload
 * Note for future developers: This function currently sends the base64 encoded image to the server.
 * This is not the most efficient way to send images, using FormData with a Blob is better. Or sending the image as a binary file.
 * however, this causes an error seeminly relating to the way FastAPI handles file uploads.
 * This is a common issue from what I've read. especially when using React Native.
 * ive tried wrappiing the blob in a File object, using XMLHttpRequest, Axios and Fetch, as well as different headers and form data configurations.
 * I have not been able to get it to work. If you can figure it out, please do so.
 */
const uploadPhoto = async (photoBase64: string) => {
  const fileName = uuid.v4() + ".jpg"; // give random name to photo
  
  interface ImageData {
    fileName: string;
    image: string;
  }
  
  const imageData: ImageData = {
    fileName: fileName,
    image: photoBase64,
  };
  try {
    const response = await axios.post(
      process.env.EXPO_PUBLIC_API_DEVELOPMENT_URL + "/images",
      imageData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Photo uploaded", response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.log("Error response", error.response.data);
      } else if (error.request) {
        console.log("No response", error.request);
      } else {
        console.log("Error with request", error.message);
      }
    } else {
      console.error("Unexpected error uploading photo", error);
    }
  }
};
export default uploadPhoto;
