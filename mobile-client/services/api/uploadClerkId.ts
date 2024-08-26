import { customFetch } from './customFetch';

export const uploadId = async (clerkId: string, token: string): Promise<void> => {
  try {
    await customFetch(process.env.EXPO_PUBLIC_API_DEV_URL + '/id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: clerkId }),
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw new Error(`${error.message || 'Failed to upload ID'}`);
    }
    throw new Error('Failed to upload ID');
  }
};
