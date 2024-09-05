import { customFetch } from './customFetch';

// Add a user with notification configuartion to the database, starts the scheduled notifications on the server.
export const addUser = async (
  clerkId: string,
  token: string,
  start_time: string,
  end_time: string
): Promise<void> => {
  try {
    await customFetch(process.env.EXPO_PUBLIC_API_DEV_URL + '/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: clerkId, start_time, end_time }),
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw new Error(`${error.message || 'Failed to upload ID'}`);
    }
    throw new Error('Failed to upload ID');
  }
};
