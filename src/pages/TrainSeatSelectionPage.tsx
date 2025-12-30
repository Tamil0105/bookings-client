import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrainStore } from '../store/trainStore';
import { useBookingStore, BookingType, BookingStatus } from '../store/bookingStore';
import { Train, AlertCircle, ShoppingCart, Info, Check, Briefcase } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TrainSeatSelectionPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { seats, fetchSeats, lockSeat, confirmBooking, isLoading, error } = useTrainStore();
  const { createBooking } = useBookingStore();
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCoach, setActiveCoach] = useState('A1');

  useEffect(() => {
    if (tripId) {
      fetchSeats(tripId);
      const interval = setInterval(() => fetchSeats(tripId), 10000);
      return () => clearInterval(interval);
    }
  }, [tripId, fetchSeats]);

  const handleSeatClick = async (seatId: string, status: string) => {
    if (status !== 'AVAILABLE') return;

    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds(prev => prev.filter(id => id !== seatId));
    } else {
      try {
        await lockSeat(seatId);
        setSelectedSeatIds(prev => [...prev, seatId]);
      } catch (err) {
        console.error('Failed to lock seat', err);
      }
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    // Simulate Payment Delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // 1. Confirm with Train Service
      await confirmBooking(selectedSeatIds);

      // 2. Create Global Booking Record
      await createBooking({
        type: BookingType.TRAIN,
        status: BookingStatus.CONFIRMED,
        totalAmount: selectedSeatIds.length * 85, // Mock price
        items: { tripId, seatIds: selectedSeatIds },
      });

      navigate('/bookings');
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const coaches = Array.from(new Set(seats.map(s => s.coachNumber))).sort();
  const coachSeats = seats.filter(s => s.coachNumber === activeCoach);

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-32">
       {/* ... (Header and Coach Navigation) ... */}
       <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="text-emerald-900 font-black hover:underline mb-2 flex items-center text-xs uppercase tracking-[0.2em]"
          >
            ← Back to Trains
          </button>
          <h1 className="text-4xl font-black text-emerald-950 tracking-tighter flex items-center">
            <Train className="h-8 w-8 mr-4 text-emerald-600" /> Choose Your Coach & Seat
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-3xl flex items-center shadow-sm">
          <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
          <p className="text-red-700 font-bold">{error}</p>
        </div>
      )}

      {/* Coach Navigation */}
      <div className="flex space-x-4 bg-emerald-50/50 p-2 rounded-[2.5rem] w-fit mx-auto shadow-inner border border-emerald-100/50">
        {coaches.map(coach => (
          <button
            key={coach}
            onClick={() => setActiveCoach(coach)}
            className={cn(
               "px-10 py-4 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all",
               activeCoach === coach 
                 ? "bg-white text-emerald-950 shadow-xl scale-105" 
                 : "text-emerald-900/40 hover:text-emerald-700"
            )}
          >
            Coach {coach}
          </button>
        ))}
      </div>

      {/* Train Compartment View */}
      <div className="glass-panel p-16 rounded-[5rem] shadow-2xl shadow-emerald-100/50 border border-white/60 relative group">
        <div className="absolute top-0 left-0 w-full h-4 bg-emerald-950 rounded-t-[5rem] opacity-5" />
        <div className="absolute bottom-0 left-0 w-full h-4 bg-emerald-950 rounded-b-[5rem] opacity-5" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {coachSeats.map((seat) => {
            const isSelected = selectedSeatIds.includes(seat.id);
            const isBooked = seat.status === 'BOOKED';
            const isLocked = seat.status === 'LOCKED' && !isSelected;

            return (
              <button
                key={seat.id}
                disabled={isBooked || (isLocked && !isSelected)}
                onClick={() => handleSeatClick(seat.id, seat.status)}
                className={cn(
                  "p-6 rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-500 border-2 relative",
                  isSelected 
                    ? "bg-emerald-950 border-emerald-950 text-white shadow-2xl shadow-emerald-900/30 -translate-y-2" 
                    : isBooked
                      ? "bg-stone-50 border-stone-50 text-stone-200 cursor-not-allowed"
                      : isLocked
                        ? "bg-amber-50 border-amber-100 text-amber-300 cursor-wait"
                        : "bg-white border-emerald-50 text-emerald-900/60 hover:border-emerald-950 hover:bg-emerald-50 shadow-sm"
                )}
              >
                <div className="mb-2">
                   <div className={cn(
                     "w-12 h-14 rounded-xl border-4 flex items-center justify-center transition-colors",
                     isSelected ? "border-emerald-700 bg-emerald-800" : "border-emerald-50 bg-white"
                   )}>
                      <Check className={cn("h-6 w-6", isSelected ? "text-emerald-400 opacity-100" : "opacity-0")} />
                   </div>
                </div>
                <span className="text-lg font-black">{seat.seatNumber}</span>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{seat.seatType}</span>
                
                {!isBooked && !isSelected && (
                   <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-emerald-50 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Checkout */}
      <div className={cn(
        "fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 transition-all duration-700 transform",
        selectedSeatIds.length > 0 ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      )}>
        <div className="bg-emerald-950 text-white p-10 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-10 border border-emerald-800">
           <div className="flex items-center space-x-12 pl-6">
              <div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">Reservation</p>
                <div className="flex items-baseline space-x-4">
                  <span className="text-4xl font-black text-white">{selectedSeatIds.length}</span>
                  <span className="text-emerald-500 font-bold uppercase text-xs tracking-tighter">Seats in {activeCoach}</span>
                </div>
              </div>
              <div className="h-16 w-px bg-emerald-800 hidden md:block" />
              <div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2">Total Payable</p>
                <p className="text-5xl font-black text-emerald-400">
                   ${selectedSeatIds.length * 85}
                </p>
              </div>
           </div>

           <div className="flex items-center space-x-6 pr-4">
              <button
                onClick={handleConfirm}
                disabled={isLoading || isProcessing}
                className="bg-white text-emerald-950 px-14 py-7 rounded-[2.5rem] font-black text-2xl hover:bg-emerald-50 transition-all shadow-2xl flex items-center group active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading || isProcessing ? 'Booking...' : (
                  <>
                    Book Now
                    <ShoppingCart className="h-7 w-7 ml-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
           </div>
        </div>
        
        <div className="mt-8 flex justify-center space-x-6">
            <div className="bg-white/80 backdrop-blur-xl px-6 py-3 rounded-full border border-emerald-100 shadow-xl flex items-center text-[10px] font-black text-emerald-600 uppercase tracking-widest">
               <Info className="h-4 w-4 mr-3 text-emerald-500" />
               Locked for 10 mins
            </div>
            <div className="bg-emerald-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center text-[10px] font-black uppercase tracking-widest">
               <Briefcase className="h-4 w-4 mr-3 text-emerald-400" />
               Insurance included
            </div>
        </div>
      </div>
    </div>
  );
};

export default TrainSeatSelectionPage;
