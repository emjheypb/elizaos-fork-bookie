import { buildHeaders } from './base';
import {
  BalanceResponse,
  BalanceResponseSchema,
  OrdersResponse,
  OrdersResponseSchema,
} from '../../types/kalshi/portfolio';
import { ErrorResponseSchema } from '../../types/kalshi/base';

const baseUrl: string = process.env.KALSHI_BASE_URL || 'https://demo-api.kalshi.co';
const basePath = '/trade-api/v2/portfolio';

export const getBalance = async (): Promise<BalanceResponse> => {
  const method: string = 'GET';
  const path: string = basePath + '/balance';
  const headers = buildHeaders(method, path);

  try {
    const response = await fetch(baseUrl + path, {
      method,
      headers,
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
    const validatedResponse = BalanceResponseSchema.parse(responseData);
    console.log('Balance Response:', validatedResponse);

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

export const getOrders = async (): Promise<OrdersResponse> => {
  const method: string = 'GET';
  const path: string = basePath + '/orders';
  const headers = buildHeaders(method, path);
  const queryParams = new URLSearchParams({
    status: 'executed',
  });

  try {
    const response = await fetch(baseUrl + path + '?' + queryParams.toString(), {
      method,
      headers,
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
    const validatedResponse = OrdersResponseSchema.parse(responseData);
    console.log('Orders Response:', validatedResponse);

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
