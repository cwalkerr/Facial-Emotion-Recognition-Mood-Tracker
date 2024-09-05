export interface ErrorResponse {
  error: string;
  status?: number;
}

// custom fetch function that retries on 401 errors
export const customFetch = async <T>(
  url: string,
  options: RequestInit,
  retries: number = 3,
  delay = 1000
): Promise<T | ErrorResponse> => {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      return (await response.json()) as T;
    }
    if (response.status === 401 && retries > 0) {
      // retry if 401, likely due to immature signature, but could be other reasons
      // 401 issues noticed are always resolved by retrying the request
      await new Promise(resolve => setTimeout(resolve, delay));
      return customFetch<T>(url, options, retries - 1, delay);
    }
    // Handle non-OK responses that are not 401
    const errorResponse: ErrorResponse = {
      error:
        (await response.json()).error ||
        'Request failed for an unknown reason, please try again',
      status: response.status,
    };
    return errorResponse;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to fetch data' };
  }
};
