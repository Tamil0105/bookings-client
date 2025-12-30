import { create } from 'zustand';
import api from '../services/api';

export const BookingType = {
  CALENDAR: 'CALENDAR',
  THEATER: 'THEATER',
  BUS: 'BUS',
  FLIGHT: 'FLIGHT',
  TRAIN: 'TRAIN',
} as const;

export type BookingType = typeof BookingType[keyof typeof BookingType];

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

interface Booking {
  id: string;
  userId: string;
  type: BookingType;
  status: BookingStatus;
  totalAmount: number;
  items: any;
  createdAt: string;
}

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  fetchMyBookings: () => Promise<void>;
  createBooking: (bookingData: Partial<Booking>) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  isLoading: false,
  error: null,

  fetchMyBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/bookings/my-bookings');
      set({ bookings: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch bookings', isLoading: false });
    }
  },

  createBooking: async (bookingData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/bookings', bookingData);
      set({ isLoading: false });
      // Optionally refresh list
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create booking', isLoading: false });
    }
  },
}));
