const API_BASE = '/api';

let authToken: string | null = localStorage.getItem('nearskill_token');

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('nearskill_token', token);
  else localStorage.removeItem('nearskill_token');
}

export function getToken() {
  return authToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: { phone: string; password: string; name: string; role?: string }) =>
    request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { phone: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<any>('/auth/me'),

  upgradeToProfessional: () =>
    request<any>('/auth/upgrade-professional', { method: 'POST' }),

  updateProfile: (data: { name?: string; preferredLang?: string }) =>
    request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  updateLocation: (data: { city: string; pincode?: string; state?: string; lat?: number; lng?: number }) =>
    request<any>('/auth/location', { method: 'PUT', body: JSON.stringify(data) }),

  // Categories
  getCategories: () => request<any[]>('/categories'),

  // Professionals
  searchProfessionals: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/professionals${query}`);
  },

  getProfessional: (id: string) => request<any>(`/professionals/${id}`),

  updateOnboarding: (data: any) =>
    request<any>('/professionals/onboarding', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  addService: (data: any) =>
    request<any>('/professionals/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateService: (id: string, data: any) =>
    request<any>(`/professionals/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteService: (id: string) =>
    request<any>(`/professionals/services/${id}`, {
      method: 'DELETE',
    }),

  // Bookings
  createBooking: (data: any) =>
    request<any>('/bookings', { method: 'POST', body: JSON.stringify(data) }),

  getBookings: () => request<any[]>('/bookings'),

  getBooking: (id: string) => request<any>(`/bookings/${id}`),

  updateBookingStatus: (id: string, data: { status: string; notes?: string }) =>
    request<any>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  cancelBooking: (id: string, reason?: string) =>
    request<any>(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  rescheduleBooking: (id: string, data: { scheduledDate: string; scheduledSlot?: string }) =>
    request<any>(`/bookings/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Reviews
  createReview: (data: { bookingId: string; rating: number; comment?: string; isAnonymous?: boolean }) =>
    request<any>('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  getProfessionalReviews: (professionalId: string) =>
    request<any[]>(`/reviews/professional/${professionalId}`),

  // Payments
  initiatePayment: (data: { bookingId: string; method: string }) =>
    request<any>('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getReceipt: (bookingId: string) =>
    request<any>(`/payments/${bookingId}/receipt`),

  releasePayment: (bookingId: string) =>
    request<any>(`/payments/${bookingId}/release`, { method: 'POST' }),

  // Disputes
  createDispute: (data: { bookingId?: string; category: string; description: string }) =>
    request<any>('/disputes', { method: 'POST', body: JSON.stringify(data) }),

  getDisputes: () => request<any[]>('/disputes'),

  // Premium
  getPremiumPlans: () => request<any>('/premium/plans'),

  subscribePremium: (tier: string) =>
    request<any>('/premium/subscribe', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    }),

  checkUpgradeEligibility: () => request<any>('/premium/suggest-upgrade'),

  // Waitlist
  joinWaitlist: (data: { phone: string; category: string; city: string; name?: string }) =>
    request<any>('/waitlist', { method: 'POST', body: JSON.stringify(data) }),
};
