import { create } from 'zustand';
import api from '../services/api';

interface Theater {
  id: string;
  name: string;
  location: string;
}

interface Show {
  id: string;
  movieName: string;
  startTime: string;
  endTime: string;
  price: number;
}

interface Seat {
  id: string;
  row: string;
  number: number;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
}

interface TheaterState {
  theaters: Theater[];
  shows: Show[];
  seats: Seat[];
  isLoading: boolean;
  error: string | null;
  fetchTheaters: () => Promise<void>;
  fetchShows: (theaterId: string) => Promise<void>;
  fetchSeats: (showId: string) => Promise<void>;
  lockSeat: (seatId: string) => Promise<void>;
  confirmBooking: (seatIds: string[]) => Promise<void>;
}

export const useTheaterStore = create<TheaterState>((set, get) => ({
  theaters: [],
  shows: [],
  seats: [],
  isLoading: false,
  error: null,

  fetchTheaters: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/theater');
      set({ theaters: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch theaters', isLoading: false });
    }
  },

  fetchShows: async (theaterId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/theater/${theaterId}/shows`);
      set({ shows: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch shows', isLoading: false });
    }
  },

  fetchSeats: async (showId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/theater/shows/${showId}/seats`);
      set({ seats: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch seats', isLoading: false });
    }
  },

  lockSeat: async (seatId) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/theater/seats/${seatId}/lock`);
      // Update local seat status to show it as locked
      set(state => ({
        seats: state.seats.map(s => s.id === seatId ? { ...s, status: 'LOCKED' } : s),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to lock seat', isLoading: false });
      throw error;
    }
  },

  confirmBooking: async (seatIds) => {
    set({ isLoading: true, error: null });
    try {
      await api.put('/theater/bookings/confirm', { seatIds });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to confirm booking', isLoading: false });
      throw error;
    }
  }
}));
