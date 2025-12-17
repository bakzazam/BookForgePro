/**
 * AIPhDWriter API Service
 * Handles all communication with the backend
 */

import {
  BookFormData,
  PreviewResponse,
  BookStatus,
  PaymentIntentResponse,
  Book
} from '../types';

const API_BASE_URL = 'https://api.k9appbuilder.com';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // Handle FastAPI validation errors (array format)
    let errorMessage = 'An error occurred';
    if (Array.isArray(errorData.detail)) {
      errorMessage = errorData.detail
        .map((err: any) => `${err.loc?.join('.')}: ${err.msg}`)
        .join(', ');
    } else if (typeof errorData.detail === 'string') {
      errorMessage = errorData.detail;
    } else if (errorData.message) {
      errorMessage = errorData.message;
    }

    throw new ApiError(errorMessage, response.status);
  }
  return response.json();
}

/**
 * Generate a FREE book preview (outline + Chapter 1)
 */
export async function generatePreview(data: BookFormData): Promise<PreviewResponse> {
  const response = await fetch(`${API_BASE_URL}/api/preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: data.topic,
      audience: data.audience,
      length: data.length,
      style: data.style,
      user_email: data.userEmail,
    }),
  });

  return handleResponse<PreviewResponse>(response);
}

/**
 * Get book generation status
 */
export async function getBookStatus(bookId: string): Promise<BookStatus> {
  const response = await fetch(`${API_BASE_URL}/api/status/${bookId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<BookStatus>(response);
}

/**
 * Create a Stripe payment intent
 */
export async function createPaymentIntent(
  bookId: string,
  addOns: string[] = []
): Promise<PaymentIntentResponse> {
  const response = await fetch(`${API_BASE_URL}/api/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      book_id: bookId,
      add_ons: addOns,
    }),
  });

  return handleResponse<PaymentIntentResponse>(response);
}

/**
 * Confirm purchase and start full book generation
 */
export async function confirmPurchase(
  bookId: string,
  paymentIntentId: string,
  email: string,
  addOns: string[] = []
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      book_id: bookId,
      payment_intent_id: paymentIntentId,
      email: email,
      add_ons: addOns,
    }),
  });

  return handleResponse<{ success: boolean; message: string }>(response);
}

/**
 * Get download URL for a completed book
 */
export async function getDownloadUrl(
  bookId: string,
  format: 'pdf' | 'docx' | 'epub'
): Promise<string> {
  const response = await fetch(
    `${API_BASE_URL}/api/download/${bookId}?format=${format}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await handleResponse<{ url: string }>(response);
  return data.url;
}

/**
 * Get user's books (for dashboard)
 * Note: This would require authentication in production
 */
export async function getUserBooks(email: string): Promise<Book[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/books?email=${encodeURIComponent(email)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return handleResponse<Book[]>(response);
}

/**
 * Health check
 */
export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
  });

  return handleResponse<{ status: string }>(response);
}

export { ApiError };
