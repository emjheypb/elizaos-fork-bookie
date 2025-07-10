import { SeriesResponse, SeriesResponseSchema, Series, SeriesSchema } from '../types/series';
import { ErrorResponseSchema } from '../types/base';

const baseUrl: string = process.env.KALSHI_BASE_URL || 'https://demo-api.kalshi.co';
const basePath = '/trade-api/v2/series';

export const getSeries = async (ticker: string): Promise<Series> => {
  const method: string = 'GET';
  const path: string = basePath + `/${ticker}`;

  try {
    const response = await fetch(baseUrl + path, {
      method,
    });

    // console.log('Status Code:', response.status);

    const responseData = await response.json();

    if (!response.ok) {
      // Handle error responses
      try {
        // Try to validate error response
        const errorData = ErrorResponseSchema.parse(responseData);
        console.log('Error Response:', errorData);
        throw new Error(`API Error: ${errorData.message || errorData.error || 'Unknown error'}`);
      } catch (parseError) {
        // If error response doesn't match schema, log raw data
        console.log('Raw Error Response:', responseData);
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
    }

    // Validate and parse successful response
    const validatedResponse = SeriesSchema.parse(responseData);
    console.log('Series Response:', validatedResponse);

    return validatedResponse;
  } catch (error: any) {
    console.error('Error:', error.message);

    // If it's already our custom error, re-throw it
    if (error.message.startsWith('API Error:') || error.message.startsWith('HTTP Error:')) {
      throw error;
    }

    // Handle network errors or other fetch errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to Kalshi API');
    }

    // Re-throw any other errors
    throw error;
  }
};

export const getSeriesList = async (words: string[]): Promise<SeriesResponse> => {
  const method: string = 'GET';
  const path: string = basePath;

  try {
    const response = await fetch(baseUrl + path + '?', {
      method,
    });

    console.log('Status Code:', response.status);

    const responseData = await response.json();

    if (!response.ok) {
      // Handle error responses
      try {
        // Try to validate error response
        const errorData = ErrorResponseSchema.parse(responseData);
        console.log('Error Response:', errorData);
        throw new Error(`API Error: ${errorData.message || errorData.error || 'Unknown error'}`);
      } catch (parseError) {
        // If error response doesn't match schema, log raw data
        console.log('Raw Error Response:', responseData);
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
    }

    // Validate and parse successful response
    const validatedResponse = SeriesResponseSchema.parse(responseData);
    const seriesResponse = validatedResponse.series.filter(
      (series) =>
        words.every(
          (word) =>
            series.title.toLowerCase().includes(word) ||
            (series.category && series.category.toLowerCase().includes(word)) ||
            (series.tags && series.tags.map((item) => item.toLowerCase()).includes(word))
        ) || words.includes(series.ticker.toLowerCase())
    );
    console.log('Series Count:', validatedResponse.series.length);

    validatedResponse.series = seriesResponse;
    return validatedResponse;
  } catch (error: any) {
    console.error('Error:', error.message);

    // If it's already our custom error, re-throw it
    if (error.message.startsWith('API Error:') || error.message.startsWith('HTTP Error:')) {
      throw error;
    }

    // Handle network errors or other fetch errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to Kalshi API');
    }

    // Re-throw any other errors
    throw error;
  }
};
