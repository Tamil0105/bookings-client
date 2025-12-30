import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusStore } from '../store/busStore';
import { useBookingStore, BookingType, BookingStatus } from '../store/bookingStore';
import { Armchair, AlertCircle, ShoppingCart, User, Info, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BusSeatSelectionPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { seats, fetchSeats, lockSeat, confirmBooking, isLoading, error } = useBusStore();
  const { createBooking } = useBookingStore();
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
      // 1. Confirm with Bus Service
      await confirmBooking(selectedSeatIds);

      // 2. Create Global Booking Record
      await createBooking({
        type: BookingType.BUS,
        status: BookingStatus.CONFIRMED,
        totalAmount: selectedSeatIds.length * 45, // Mock price
        items: { tripId, seatIds: selectedSeatIds },
      });

      navigate('/bookings');
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  // ... (rest of the component)

  const lowerDeck = seats.filter(s => s.seatNumber.includes('L'));
  const upperDeck = seats.filter(s => s.seatNumber.includes('U'));

  const renderDeck = (deckSeats: typeof seats, title: string) => (
    <div className="space-y-6">
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest text-center">{title}</h3>
      <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 grid grid-cols-2 gap-4 max-w-[280px] mx-auto relative">
        {/* Steering Wheel for Lower Deck */}
        {title.includes('Lower') && (
          <div className="absolute top-4 right-8 w-8 h-8 rounded-full border-4 border-gray-300 flex items-center justify-center">
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
          </div>
        )}
        
        {deckSeats.map((seat) => {
          const isSelected = selectedSeatIds.includes(seat.id);
          const isBooked = seat.status === 'BOOKED';
          const isLocked = seat.status === 'LOCKED' && !isSelected;

          return (
            <button
              key={seat.id}
              disabled={isBooked || (isLocked && !isSelected)}
              onClick={() => handleSeatClick(seat.id, seat.status)}
              className={cn(
                "h-16 rounded-xl flex items-center justify-center transition-all duration-200 border relative group",
                isSelected 
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-lg -translate-y-1" 
                  : isBooked
                    ? "bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed"
                    : isLocked
                      ? "bg-amber-100 border-amber-300 text-amber-600 cursor-wait"
                      : "bg-white border-emerald-100 text-emerald-900 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md"
              )}
            >
              <div className="flex flex-col items-center">
                <Armchair className={cn("h-6 w-6 mb-1", isSelected ? "text-white" : "text-emerald-200")} />
                <span className="text-[10px] font-black">{seat.seatNumber}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      {/* ... (Search header) ... */}
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="text-emerald-600 font-bold hover:underline mb-2 flex items-center text-sm"
          >
            ← Change Search
          </button>
          <h1 className="text-3xl font-black text-emerald-950 tracking-tight">Select Bus Seats</h1>
        </div>
        
        {/* ... (Legend) ... */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white border border-gray-200 rounded-full" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Free</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-600 rounded-full" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Pick</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 rounded-full" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/80 backdrop-blur-xl p-12 rounded-[50px] shadow-2xl shadow-emerald-900/10 border border-white/50">
        {renderDeck(lowerDeck, 'Lower Deck')}
        {upperDeck.length > 0 && renderDeck(upperDeck, 'Upper Deck')}
      </div>

      {/* Booking Summary */}
      <div className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 transition-all duration-500 transform",
        selectedSeatIds.length > 0 ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}>
        <div className="bg-emerald-950 text-white p-6 rounded-[32px] shadow-2xl flex items-center justify-between border border-emerald-800/50">
          <div className="flex items-center space-x-8 pl-4">
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Boarding Info</p>
              <div className="flex items-center text-sm font-bold">
                Trip <ArrowRight className="h-3 w-3 mx-2 text-emerald-400" /> #{tripId?.slice(-6).toUpperCase()}
              </div>
            </div>
            <div className="h-10 w-px bg-emerald-800" />
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Your Seats</p>
              <p className="text-lg font-black text-emerald-400">
                {selectedSeatIds.map(id => seats.find(x => x.id === id)?.seatNumber).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 pr-2">
            <div className="text-right">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Total Due</p>
              <p className="text-3xl font-black">${selectedSeatIds.length * 45}</p>
            </div>
            <button
              onClick={handleConfirm}
              disabled={isLoading || isProcessing}
              className="bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-900/50 flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading || isProcessing ? 'Processing...' : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Proceed to Pay
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Timer Info */}
        <div className="mt-4 flex justify-center">
          <div className="glass-panel px-4 py-2 rounded-full flex items-center text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
            <Info className="h-3 w-3 mr-2 text-emerald-600" />
            Seats are held for 10 minutes
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusSeatSelectionPage;
