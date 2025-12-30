import { create } from 'zustand';
import api from '../services/api';

interface TrainTrip {
  id: string;
  trainId: string;
  originStationId: string;
  destinationStationId: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
}

interface TrainSeat {
  id: string;
  coachNumber: string;
  seatNumber: number;
  seatType: string;
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
}

interface TrainState {
  trips: TrainTrip[];
  seats: TrainSeat[];
  isLoading: boolean;
  error: string | null;
  searchTrips: (origin: string, destination: string, date: string) => Promise<void>;
  fetchSeats: (tripId: string) => Promise<void>;
  lockSeat: (seatId: string) => Promise<void>;
  confirmBooking: (seatIds: string[]) => Promise<void>;
}

export const useTrainStore = create<TrainState>((set) => ({
  trips: [],
  seats: [],
  isLoading: false,
  error: null,

  searchTrips: async (origin, destination, date) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/train/search', { params: { origin, destination, date } });
      set({ trips: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to search trains', isLoading: false });
    }
  },

  fetchSeats: async (tripId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/train/trips/${tripId}/seats`);
      set({ seats: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch seats', isLoading: false });
    }
  },

  lockSeat: async (seatId) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/train/seats/${seatId}/lock`);
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
      await api.put('/train/bookings/confirm', { seatIds });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to confirm booking', isLoading: false });
      throw error;
    }
  },
}));
