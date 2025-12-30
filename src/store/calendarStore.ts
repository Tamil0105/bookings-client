import { create } from 'zustand';
import api from '../services/api';

interface Slot {
  id: string;
  providerId: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'LOCKED';
  bookedBy?: string;
}

interface CalendarState {
  slots: Slot[];
  isLoading: boolean;
  error: string | null;
  fetchSlots: (providerId?: string) => Promise<void>;
  createSlot: (data: { startTime: string; endTime: string }) => Promise<void>;
  bookSlot: (slotId: string) => Promise<void>;
  cancelBooking: (slotId: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  slots: [],
  isLoading: false,
  error: null,

  fetchSlots: async (providerId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/calendar/slots', { params: { providerId } });
      set({ slots: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to fetch slots', isLoading: false });
    }
  },

  createSlot: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/calendar/slots', data);
      await useCalendarStore.getState().fetchSlots();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to create slot', isLoading: false });
      throw error;
    }
  },

  bookSlot: async (slotId) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/calendar/slots/${slotId}/book`);
      await useCalendarStore.getState().fetchSlots();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to book slot', isLoading: false });
      throw error;
    }
  },

  cancelBooking: async (slotId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/calendar/slots/${slotId}`);
      await useCalendarStore.getState().fetchSlots();
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Failed to cancel booking', isLoading: false });
      throw error;
    }
  },
}));
