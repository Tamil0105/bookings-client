import { create } from 'zustand';
import api from '../services/api';

interface FlightSchedule {
  id: string;
  flightId: string;
  originAirportId: string;
  destinationAirportId: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
}

interface FlightSeat {
  id: string;
  seatNumber: string;
  class: 'ECONOMY' | 'BUSINESS' | 'FIRST';
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
}

interface FlightState {
  schedules: FlightSchedule[];
  seats: FlightSeat[];
  isLoading: boolean;
  error: string | null;
  searchFlights: (origin: string, destination: string, date: string) => Promise<void>;
  fetchSeats: (scheduleId: string) => Promise<void>;
  lockSeat: (seatId: string) => Promise<void>;
  confirmBooking: (seatIds: string[]) => Promise<void>;
}

export const useFlightStore = create<FlightState>((set) => ({
  schedules: [],
  seats: [],
  isLoading: false,
  error: null,

  searchFlights: async (origin, destination, date) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/flight/search', { params: { origin, destination, date } });
      set({ schedules: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to search flights', isLoading: false });
    }
  },

  fetchSeats: async (scheduleId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/flight/schedules/${scheduleId}/seats`);
      set({ seats: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch seats', isLoading: false });
    }
  },

  lockSeat: async (seatId) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/flight/seats/${seatId}/lock`);
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
      await api.put('/flight/bookings/confirm', { seatIds });
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to confirm booking', isLoading: false });
      throw error;
    }
  },
}));
