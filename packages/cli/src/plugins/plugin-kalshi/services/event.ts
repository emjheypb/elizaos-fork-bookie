import { EventsResponse, EventsResponseSchema, Event, EventSchema } from '../../types/kalshi/event';
import { ErrorResponseSchema } from '../../types/kalshi/base';

const baseUrl: string = process.env.KALSHI_BASE_URL || 'https://demo-api.kalshi.co';
const basePath = '/trade-api/v2/events';

export const getEvent = async (ticker: string): Promise<Event> => {
  const method: string = 'GET';
  const path: string = basePath + `/${ticker}`;

  try {
    const response = await fetch(baseUrl + path, {
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
    const validatedResponse = EventSchema.parse(responseData);
    console.log('Event Response:', validatedResponse);

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

export const getEvents = async (ticker?: string, status?: string): Promise<EventsResponse> => {
  const method: string = 'GET';
  const path: string = basePath;
  const queryParams = new URLSearchParams({
    with_nested_markets: 'true',
    status: status || 'open',
    series_ticker: ticker || '',
  });

  try {
    const response = await fetch(baseUrl + path + '?' + queryParams.toString(), {
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
    const validatedResponse = EventsResponseSchema.parse(responseData);
    // if (validatedResponse.events.length > 0)
    //   console.log(
    //     'Events:',
    //     validatedResponse.events.map((event) => event.event_ticker)
    //   );

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
