
import axios, { AxiosError } from 'axios';
import {
  Property,
  PropertyInput,
  Rental,
  RentalInput,
  Payment,
  PaymentInput,
  MaintenanceRequest,
  MaintenanceRequestInput,
  User,
  TokenResponse,
} from './types';
import {
  INITIAL_MOCK_PROPERTIES,
  INITIAL_MOCK_RENTALS,
  INITIAL_MOCK_PAYMENTS,
  INITIAL_MOCK_MAINTENANCE,
  INITIAL_MOCK_USER,
} from './mockData';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://rent-api-xjs4.onrender.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Helper for local storage token management
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('rent_api_token');
};

export const setToken = (token: string | null) => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('rent_api_token', token);
  } else {
    localStorage.removeItem('rent_api_token');
  }
};

export const getMockMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const item = localStorage.getItem('rent_api_use_mock');
  if (item !== null) return item === 'true';
  if (process.env.NEXT_PUBLIC_USE_MOCK !== undefined) {
    return process.env.NEXT_PUBLIC_USE_MOCK === 'true';
  }
  return false;
};

export const setMockMode = (useMock: boolean) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('rent_api_use_mock', String(useMock));
};

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// In-Memory Storage for Mock Mode Mutations
let mockProperties = [...INITIAL_MOCK_PROPERTIES];
let mockRentals = [...INITIAL_MOCK_RENTALS];
let mockPayments = [...INITIAL_MOCK_PAYMENTS];
let mockMaintenance = [...INITIAL_MOCK_MAINTENANCE];
let mockUser = { ...INITIAL_MOCK_USER };

// Helper to delay simulated responses
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// Format error message cleanly
export const formatApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<any>;
    if (err.response?.data) {
      if (typeof err.response.data === 'string') return err.response.data;
      if (err.response.data.detail) return err.response.data.detail;
      return JSON.stringify(err.response.data);
    }
    if (err.message) return err.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred while contacting the server.';
};

// ==================== AUTH SERVICE ====================
export const authApi = {
  async login(username: string, password: string): Promise<TokenResponse> {
    if (getMockMode()) {
      await delay(500);
      if (username && password) {
        const mockToken = { access: 'mock_jwt_access_token_12345', refresh: 'mock_jwt_refresh_token_12345' };
        setToken(mockToken.access);
        return mockToken;
      }
      throw new Error('Invalid credentials provided.');
    }

    try {
      const res = await apiClient.post<TokenResponse>('/api/accounts/token/', { username, password });
      setToken(res.data.access);
      return res.data;
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async register(data: { username: string; email?: string; password: string; role?: string }) {
    if (getMockMode()) {
      await delay(500);
      mockUser = {
        ...mockUser,
        username: data.username,
        email: data.email || `${data.username}@example.com`,
        role: (data.role as any) || 'landlord',
      };
      return mockUser;
    }

    try {
      const res = await apiClient.post('/api/accounts/register/', data);
      return res.data;
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async getMe(): Promise<User> {
    if (getMockMode()) {
      await delay(300);
      return mockUser;
    }

    try {
      const res = await apiClient.get<User>('/api/accounts/me/');
      return res.data;
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },
};

// ==================== PROPERTIES SERVICE ====================
export const propertiesApi = {
  async list(): Promise<Property[]> {
    if (getMockMode()) {
      await delay(400);
      return [...mockProperties];
    }

    try {
      const res = await apiClient.get<Property[]>('/api/properties/');
      // Handle pagination wrapper if present
      return Array.isArray(res.data) ? res.data : (res.data as any).results || [];
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async get(id: number): Promise<Property> {
    if (getMockMode()) {
      await delay(300);
      const prop = mockProperties.find((p) => p.id === id);
      if (!prop) throw new Error(`Property #${id} not found.`);
      return prop;
    }

    try {
      const res = await apiClient.get<Property>(`/api/properties/${id}/`);
      return res.data;
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async create(data: PropertyInput): Promise<Property> {
    if (getMockMode()) {
      await delay(500);
      let previewUrl = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
      if (typeof window !== 'undefined' && data.image instanceof File) {
        previewUrl = URL.createObjectURL(data.image);
      } else if (typeof data.image === 'string' && data.image) {
        previewUrl = data.image;
      }
      const newProp: Property = {
        id: Date.now(),
        title: data.title,
        description: data.description,
        address: data.address,
        rent_amount: data.rent_amount,
        image: previewUrl,
        landlord: mockUser.id,
        landlord_username: mockUser.username,
      };
      mockProperties = [newProp, ...mockProperties];
      return newProp;
    }

    try {
      if (typeof window !== 'undefined' && data.image instanceof File) {
        const formData = new FormData();
        formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        formData.append('address', data.address);
        formData.append('rent_amount', String(data.rent_amount));
        formData.append('image', data.image);

        const res = await apiClient.post<Property>('/api/properties/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return res.data;
      } else {
        // Django REST Framework ImageField expects a File or null/omitted. Sending string URLs triggers validation errors.
        const payload: Record<string, any> = {
          title: data.title,
          description: data.description || '',
          address: data.address,
          rent_amount: data.rent_amount,
        };
        if (data.image === null) {
          payload.image = null;
        }
        const res = await apiClient.post<Property>('/api/properties/', payload);
        return res.data;
      }
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async update(id: number, data: Partial<PropertyInput>): Promise<Property> {
    if (getMockMode()) {
      await delay(500);
      let previewUrl: string | undefined = undefined;
      if (typeof window !== 'undefined' && data.image instanceof File) {
        previewUrl = URL.createObjectURL(data.image);
      } else if (typeof data.image === 'string' && data.image) {
        previewUrl = data.image;
      }
      mockProperties = mockProperties.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            ...data,
            image: previewUrl !== undefined ? previewUrl : (data.image === null ? null : p.image),
          };
        }
        return p;
      });
      const updated = mockProperties.find((p) => p.id === id);
      if (!updated) throw new Error(`Property #${id} not found.`);
      return updated;
    }

    try {
      if (typeof window !== 'undefined' && data.image instanceof File) {
        const formData = new FormData();
        if (data.title !== undefined) formData.append('title', data.title);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.address !== undefined) formData.append('address', data.address);
        if (data.rent_amount !== undefined) formData.append('rent_amount', String(data.rent_amount));
        formData.append('image', data.image);

        const res = await apiClient.patch<Property>(`/api/properties/${id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return res.data;
      } else {
        const payload: Record<string, any> = {};
        if (data.title !== undefined) payload.title = data.title;
        if (data.description !== undefined) payload.description = data.description;
        if (data.address !== undefined) payload.address = data.address;
        if (data.rent_amount !== undefined) payload.rent_amount = data.rent_amount;
        if (data.image === null) payload.image = null;
        // String URLs are omitted to prevent DRF ImageField "The submitted data was not a file" error

        const res = await apiClient.patch<Property>(`/api/properties/${id}/`, payload);
        return res.data;
      }
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async delete(id: number): Promise<void> {
    if (getMockMode()) {
      await delay(400);
      mockProperties = mockProperties.filter((p) => p.id !== id);
      return;
    }

    try {
      await apiClient.delete(`/api/properties/${id}/`);
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },
};

// ==================== RENTALS SERVICE ====================
export const rentalsApi = {
  async list(): Promise<Rental[]> {
    if (getMockMode()) {
      await delay(400);
      return [...mockRentals];
    }

    try {
      const res = await apiClient.get<Rental[]>('/api/rentals/');
      return Array.isArray(res.data) ? res.data : (res.data as any).results || [];
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async get(id: number): Promise<Rental> {
    if (getMockMode()) {
      await delay(300);
      const item = mockRentals.find((r) => r.id === id);
      if (!item) throw new Error(`Rental #${id} not found.`);
      return item;
    }

    try {
      const res = await apiClient.get<Rental>(`/api/rentals/${id}/`);
      return res.data;
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async create(data: RentalInput): Promise<Rental> {
    if (getMockMode()) {
      await delay(500);
      const prop = mockProperties.find((p) => p.id === Number(data.property));
      const newRental: Rental = {
        id: Date.now(),
        property: Number(data.property),
        property_title: prop ? prop.title : `Property #${data.property}`,
        tenant: data.tenant || 2,
        tenant_username: 'sarah_jenkins',
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
      };
      mockRentals = [newRental, ...mockRentals];
      return newRental;
    }

    try {
      const res = await apiClient.post<Rental>('/api/rentals/', data);
      return res.data;
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async update(id: number, data: Partial<RentalInput>): Promise<Rental> {
    if (getMockMode()) {
      await delay(500);
      mockRentals = mockRentals.map((r) => {
        if (r.id === id) {
          const prop = data.property ? mockProperties.find((p) => p.id === Number(data.property)) : null;
          return {
            ...r,
            ...data,
            property: data.property ? Number(data.property) : r.property,
            property_title: prop ? prop.title : r.property_title,
          };
        }
        return r;
      });
      const updated = mockRentals.find((r) => r.id === id);
      if (!updated) throw new Error(`Rental #${id} not found.`);
      return updated;
    }

    try {
      const res = await apiClient.patch<Rental>(`/api/rentals/${id}/`, data);
      return res.data;
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async delete(id: number): Promise<void> {
    if (getMockMode()) {
      await delay(400);
      mockRentals = mockRentals.filter((r) => r.id !== id);
      return;
    }

    try {
      await apiClient.delete(`/api/rentals/${id}/`);
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },
};

// ==================== PAYMENTS SERVICE ====================
export const paymentsApi = {
  async list(): Promise<Payment[]> {
    if (getMockMode()) {
      await delay(400);
      return [...mockPayments];
    }

    try {
      const res = await apiClient.get<Payment[]>('/api/payments/');
      return Array.isArray(res.data) ? res.data : (res.data as any).results || [];
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async get(id: number): Promise<Payment> {
    if (getMockMode()) {
      await delay(300);
      const item = mockPayments.find((p) => p.id === id);
      if (!item) throw new Error(`Payment #${id} not found.`);
      return item;
    }

    try {
      const res = await apiClient.get<Payment>(`/api/payments/${id}/`);
      return res.data;
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async create(data: PaymentInput): Promise<Payment> {
    if (getMockMode()) {
      await delay(500);
      const rentalObj = mockRentals.find((r) => r.id === Number(data.rental));
      const newPayment: Payment = {
        id: Date.now(),
        rental: Number(data.rental),
        property_title: rentalObj ? rentalObj.property_title : `Rental #${data.rental}`,
        tenant_username: rentalObj ? rentalObj.tenant_username : 'sarah_jenkins',
        amount: data.amount,
        date_paid: data.date_paid || new Date().toISOString(),
        status: data.status,
        payment_method: data.payment_method || 'Credit Card',
      };
      mockPayments = [newPayment, ...mockPayments];
      return newPayment;
    }

    try {
      const res = await apiClient.post<Payment>('/api/payments/', data);
      return res.data;
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async update(id: number, data: Partial<PaymentInput>): Promise<Payment> {
    if (getMockMode()) {
      await delay(500);
      mockPayments = mockPayments.map((p) => (p.id === id ? { ...p, ...data } : p));
      const updated = mockPayments.find((p) => p.id === id);
      if (!updated) throw new Error(`Payment #${id} not found.`);
      return updated;
    }

    try {
      const res = await apiClient.patch<Payment>(`/api/payments/${id}/`, data);
      return res.data;
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async delete(id: number): Promise<void> {
    if (getMockMode()) {
      await delay(400);
      mockPayments = mockPayments.filter((p) => p.id !== id);
      return;
    }

    try {
      await apiClient.delete(`/api/payments/${id}/`);
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },
};

// ==================== MAINTENANCE SERVICE ====================
export const maintenanceApi = {
  async list(): Promise<MaintenanceRequest[]> {
    if (getMockMode()) {
      await delay(400);
      return [...mockMaintenance];
    }

    try {
      const res = await apiClient.get<MaintenanceRequest[]>('/api/maintenance/');
      return Array.isArray(res.data) ? res.data : (res.data as any).results || [];
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async get(id: number): Promise<MaintenanceRequest> {
    if (getMockMode()) {
      await delay(300);
      const item = mockMaintenance.find((m) => m.id === id);
      if (!item) throw new Error(`Maintenance Request #${id} not found.`);
      return item;
    }

    try {
      const res = await apiClient.get<MaintenanceRequest>(`/api/maintenance/${id}/`);
      return res.data;
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async create(data: MaintenanceRequestInput): Promise<MaintenanceRequest> {
    if (getMockMode()) {
      await delay(500);
      const rentalObj = mockRentals.find((r) => r.id === Number(data.rental));
      const now = new Date().toISOString();
      const newTicket: MaintenanceRequest = {
        id: Date.now(),
        rental: Number(data.rental),
        tenant: rentalObj ? rentalObj.tenant : 2,
        tenant_username: rentalObj ? rentalObj.tenant_username : 'sarah_jenkins',
        property_title: rentalObj ? rentalObj.property_title : `Rental #${data.rental}`,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        created_at: now,
        updated_at: now,
      };
      mockMaintenance = [newTicket, ...mockMaintenance];
      return newTicket;
    }

    try {
      const res = await apiClient.post<MaintenanceRequest>('/api/maintenance/', data);
      return res.data;
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async update(id: number, data: Partial<MaintenanceRequestInput>): Promise<MaintenanceRequest> {
    if (getMockMode()) {
      await delay(500);
      const now = new Date().toISOString();
      mockMaintenance = mockMaintenance.map((m) =>
        m.id === id ? { ...m, ...data, updated_at: now } : m
      );
      const updated = mockMaintenance.find((m) => m.id === id);
      if (!updated) throw new Error(`Maintenance Request #${id} not found.`);
      return updated;
    }

    try {
      const res = await apiClient.patch<MaintenanceRequest>(`/api/maintenance/${id}/`, data);
      return res.data;
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },

  async delete(id: number): Promise<void> {
    if (getMockMode()) {
      await delay(400);
      mockMaintenance = mockMaintenance.filter((m) => m.id !== id);
      return;
    }

    try {
      await apiClient.delete(`/api/maintenance/${id}/`);
    } catch (err) {
      throw new Error(formatApiError(err));
    }
  },
};
