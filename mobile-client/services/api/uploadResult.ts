export interface ReadingData {
  emotion: string;
  is_accurate: boolean;
  location?: string;
  note?: string;
  timestamp: string;
  clerk_id: string;
}

// uploads the reading data to the server
const uploadResult = async (
  readingData: ReadingData,
  token: string
): Promise<void> => {
  const response = await fetch(process.env.EXPO_PUBLIC_API_DEV_URL + '/reading', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(readingData),
  });
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(
      `Failed to upload reading: ${response.status} ${response.statusText} - ${errorMessage}`
    );
  }
};

export default uploadResult;
