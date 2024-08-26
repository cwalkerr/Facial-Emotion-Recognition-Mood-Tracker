// currently only checks for Immature Signature error, can be expanded for other errors

export const customFetch = async (
  url: string,
  options: RequestInit,
  retries: number = 3,
  delay = 500
): Promise<unknown> => {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      return await response.json();
    }
    if (response.status === 401) {
      const errorResponse = await response.json();
      const error = errorResponse.message;
      // check for immature signature error, retry if found
      if (error === 'Token not yet valid' && retries > 0) {
        console.log('Token not yet valid, retrying...');
        await new Promise(resolve => setTimeout(resolve, delay));
        return customFetch(url, options, retries - 1, delay);
      }
    }
    throw new Error('Request failed for an unknown reason');
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
