const uploadId = async (clerkId: string, token: string): Promise<void> => {
  const response = await fetch(process.env.EXPO_PUBLIC_API_DEV_URL + '/id', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id: clerkId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`${response.status}, ${error.message || 'Failed to upload ID'}`);
  }
};

export default uploadId;
