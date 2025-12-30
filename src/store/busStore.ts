import { create } from 'zustand';
import api from '../services/api';

interface Trip {
  id: string;
  busId: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
}

interface BusSeat {
  id: string;
  seatNumber: string;
  isSleeper: boolean;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
}

interface BusState {
  trips: Trip[];
  seats: BusSeat[];
  isLoading: boolean;
  error: string | null;
  searchTrips: (source: string, destination: string, date: string) => Promise<void>;
  fetchSeats: (tripId: string) => Promise<void>;
  lockSeat: (seatId: string) => Promise<void>;
  confirmBooking: (seatIds: string[]) => Promise<void>;
}

export const useBusStore = create<BusState>((set) => ({
  trips: [],
  seats: [],
  isLoading: false,
  error: null,

  searchTrips: async (source, destination, date) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/bus/search', { params: { source, destination, date } });
      set({ trips: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to search trips', isLoading: false });
    }
  },

  fetchSeats: async (tripId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/bus/trips/${tripId}/seats`);
      set({ seats: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch seats', isLoading: false });
    }
  },

  lockSeat: async (seatId) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/bus/seats/${seatId}/lock`);
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
      await api.put('/bus/bookings/confirm', { seatIds });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to confirm booking', isLoading: false });
      throw error;
    }
  },
}));
