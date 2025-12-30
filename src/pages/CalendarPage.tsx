import React, { useEffect, useState } from 'react';
import { useCalendarStore } from '../store/calendarStore';
import { useAuthStore } from '../store/authStore';
import { Calendar as CalendarIcon, Clock, Plus, Check, X, AlertCircle } from 'lucide-react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';

const CalendarPage: React.FC = () => {
  const { user } = useAuthStore();
  const { slots, fetchSlots, createSlot, bookSlot, cancelBooking, isLoading, error } = useCalendarStore();
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSlot, setNewSlot] = useState({ startTime: '', endTime: '' });

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  const filteredSlots = slots.filter((slot) => 
    isSameDay(new Date(slot.startTime), selectedDate)
  ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const start = new Date(`${dateStr}T${newSlot.startTime}`);
    const end = new Date(`${dateStr}T${newSlot.endTime}`);

    try {
      await createSlot({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      setShowCreateModal(false);
      setNewSlot({ startTime: '', endTime: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Appointment Booking</h1>
          <p className="text-slate-500 font-medium">Select a date and book your preferred time slot.</p>
        </div>
        {user?.role === 'PROVIDER' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm font-bold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Slot
          </button>
        )}
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {days.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => setSelectedDate(day)}
            className={`flex flex-col items-center justify-center min-w-[80px] p-4 rounded-2xl border transition-all ${
              isSameDay(day, selectedDate)
                ? 'bg-black border-black text-white shadow-lg scale-105'
                : 'bg-white border-slate-200 text-slate-500 hover:border-black hover:text-black hover:bg-slate-50'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">{format(day, 'EEE')}</span>
            <span className="text-xl font-black">{format(day, 'd')}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-slate-50 border-l-4 border-black p-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-black mr-2" />
          <p className="text-sm text-black font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSlots.length > 0 ? (
          filteredSlots.map((slot) => (
            <div
              key={slot.id}
              className={`p-6 bg-white rounded-2xl border transition-all ${
                slot.status === 'AVAILABLE'
                  ? 'border-slate-200 hover:border-black hover:shadow-xl'
                  : 'bg-slate-50 border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-slate-100 p-2 rounded-lg text-black">
                  <Clock className="h-5 w-5" />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                    slot.status === 'AVAILABLE'
                      ? 'bg-white text-black border-black/10'
                      : 'bg-slate-200 text-slate-500 border-transparent'
                  }`}
                >
                  {slot.status}
                </span>
              </div>
              <div className="space-y-1">
                <p className="font-black text-xl text-slate-900">
                  {format(new Date(slot.startTime), 'p')} - {format(new Date(slot.endTime), 'p')}
                </p>
                <p className="text-sm text-slate-500 font-medium">Duration: 1 hour</p>
              </div>
              
              <div className="mt-6">
                {slot.status === 'AVAILABLE' ? (
                  <button
                    onClick={() => bookSlot(slot.id)}
                    disabled={isLoading}
                    className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Booking...' : 'Book Now'}
                  </button>
                ) : slot.bookedBy === user?.id ? (
                  <button
                    onClick={() => cancelBooking(slot.id)}
                    disabled={isLoading}
                    className="w-full py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:border-black hover:text-black transition-colors disabled:opacity-50"
                  >
                    Cancel Booking
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed"
                  >
                    Unavailable
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <CalendarIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-lg">No available slots for this day.</p>
            {user?.role === 'PROVIDER' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-black font-black hover:underline"
              >
                Create one now
              </button>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-black transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-black text-slate-900 mb-6">Create Time Slot</h2>
            <form onSubmit={handleCreateSlot} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
                  {format(selectedDate, 'PPP')}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none font-medium"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-lg"
              >
                {isLoading ? 'Creating...' : 'Create Slot'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
