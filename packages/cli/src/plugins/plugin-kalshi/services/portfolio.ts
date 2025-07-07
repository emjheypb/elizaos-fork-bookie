import { buildHeaders } from './base';
import {
  BalanceResponse,
  BalanceResponseSchema,
  CreateOrderRequest,
  CreateOrderResponseSchema,
  OrdersResponse,
  OrdersResponseSchema,
} from '../types/portfolio';
import { ErrorResponseSchema } from '../types/base';

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
    const validatedResponse = OrdersResponseSchema.parse(responseData);
    console.log('Orders Response count:', validatedResponse.orders.length);

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

export const createOrder = async (req: CreateOrderRequest) => {
  const method: string = 'POST';
  const path: string = basePath + '/orders';
  const headers = buildHeaders(method, path);

  console.log('Creating order request:', req);

  try {
    const response = await fetch(baseUrl + path, {
      method,
      headers,
      body: JSON.stringify(req),
    });

    console.log(req.client_order_id, 'Status Code:', response.status);

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
    const validatedResponse = CreateOrderResponseSchema.parse(responseData);
    console.log('Create Order Response:', validatedResponse);

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
