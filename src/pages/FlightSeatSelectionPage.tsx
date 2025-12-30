import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlightStore } from '../store/flightStore';
import { useBookingStore, BookingType, BookingStatus } from '../store/bookingStore';
import { Plane, AlertCircle, ShoppingCart, Info, CheckCircle2, Award } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FlightSeatSelectionPage: React.FC = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const { seats, fetchSeats, lockSeat, confirmBooking, isLoading, error } = useFlightStore();
  const { createBooking } = useBookingStore(); // Use global booking store
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (scheduleId) {
      fetchSeats(scheduleId);
      const interval = setInterval(() => fetchSeats(scheduleId), 10000);
      return () => clearInterval(interval);
    }
  }, [scheduleId, fetchSeats]);

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
      // 1. Confirm with Flight Service
      await confirmBooking(selectedSeatIds);

      // 2. Create Global Booking Record
      await createBooking({
        type: BookingType.FLIGHT,
        status: BookingStatus.CONFIRMED,
        totalAmount: selectedSeatIds.length * 240, // Mock price
        items: { scheduleId, seatIds: selectedSeatIds },
      });

      navigate('/bookings');
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  // Group seats by row
  const rows = seats.reduce((acc, seat) => {
    const rowNum = seat.seatNumber.match(/\d+/)?.[0] || '0';
    if (!acc[rowNum]) acc[rowNum] = [];
    acc[rowNum].push(seat);
    return acc;
  }, {} as Record<string, typeof seats>);

  const sortedRowKeys = Object.keys(rows).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-32">
       <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="text-indigo-600 font-black hover:underline mb-2 flex items-center text-xs uppercase tracking-widest"
          >
            ← Back to Results
          </button>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Pick Your Seat</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white border-2 border-gray-200 rounded-sm" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-indigo-600 rounded-sm" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 rounded-sm" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sold Out</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-2xl flex items-center shadow-sm">
          <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
          <p className="text-red-700 font-bold">{error}</p>
        </div>
      )}

      {/* Aircraft Layout */}
      <div className="bg-white p-12 rounded-[60px] shadow-2xl shadow-indigo-100 border border-indigo-50 relative overflow-hidden">
        {/* Plane Nose Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-gray-50 rounded-b-full border-b border-gray-200 flex items-center justify-center -translate-y-10 group hover:translate-y-0 transition-transform cursor-pointer">
            <div className="bg-white p-2 rounded-full shadow-inner mt-6">
              <Award className="h-4 w-4 text-indigo-200" />
            </div>
        </div>

        <div className="space-y-6 pt-8">
          {sortedRowKeys.map((rowKey) => (
            <div key={rowKey} className="flex items-center justify-center space-x-8">
              <div className="w-8 text-[10px] font-black text-gray-300 uppercase italic">{rowKey}</div>
              <div className="flex space-x-3">
                {rows[rowKey].sort((a,b) => a.seatNumber.localeCompare(b.seatNumber)).map((seat, index) => {
                  const isSelected = selectedSeatIds.includes(seat.id);
                  const isBooked = seat.status === 'BOOKED';
                  const isLocked = seat.status === 'LOCKED' && !isSelected;
                  const isAisle = index === 3;

                  return (
                    <React.Fragment key={seat.id}>
                      {isAisle && <div className="w-12 flex items-center justify-center text-[8px] font-black text-gray-200 uppercase tracking-widest rotate-90">Aisle</div>}
                      <button
                        disabled={isBooked || (isLocked && !isSelected)}
                        onClick={() => handleSeatClick(seat.id, seat.status)}
                        className={cn(
                          "w-12 h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-300 border relative group",
                          seat.class === 'BUSINESS' ? "border-amber-200" : "border-gray-100",
                          isSelected 
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xl -translate-y-1 scale-110" 
                            : isBooked
                              ? "bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed"
                              : isLocked
                                ? "bg-indigo-50 border-indigo-200 text-indigo-300 cursor-wait"
                                : "bg-white text-gray-600 hover:border-indigo-400 hover:shadow-lg"
                        )}
                      >
                        <Plane className={cn("h-4 w-4 mb-1 opacity-20", isSelected && "opacity-100")} />
                        <span className="text-[9px] font-black">{seat.seatNumber}</span>
                        {seat.class === 'BUSINESS' && !isSelected && !isBooked && (
                           <div className="absolute -top-1 right-0 w-2 h-2 bg-amber-400 rounded-full shadow-sm" />
                        )}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="w-8 text-[10px] font-black text-gray-300 uppercase italic text-right">{rowKey}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Checkout Bar */}
      <div className={cn(
        "fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 transition-all duration-700 transform",
        selectedSeatIds.length > 0 ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      )}>
        <div className="bg-white/80 backdrop-blur-2xl p-8 rounded-[40px] shadow-2xl shadow-indigo-900/10 border border-white/50 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="flex items-center space-x-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Passenger Seats</p>
                <div className="flex flex-wrap gap-2">
                   {selectedSeatIds.map(id => (
                     <span key={id} className="text-xl font-black text-gray-900 bg-indigo-50 px-3 py-1 rounded-lg">
                       {seats.find(x => x.id === id)?.seatNumber}
                     </span>
                   ))}
                </div>
              </div>
              <div className="h-12 w-px bg-indigo-100 hidden md:block" />
              <div className="space-y-1">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Final Total</p>
                <p className="text-4xl font-black text-gray-900">${selectedSeatIds.length * 240}</p>
              </div>
           </div>

           <div className="flex items-center space-x-6">
              <div className="text-right hidden lg:block">
                 <p className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center justify-end">
                   <CheckCircle2 className="h-3 w-3 mr-1" /> Best Price Guarantee
                 </p>
                 <p className="text-xs font-bold text-gray-400 mt-1 italic">Taxes and fees included</p>
              </div>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="bg-indigo-600 text-white px-12 py-6 rounded-[24px] font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center group"
              >
                {isLoading ? 'Booking...' : (
                  <>
                    Complete Booking
                    <ShoppingCart className="h-6 w-6 ml-4 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </button>
           </div>
        </div>
        
        <div className="mt-6 flex justify-center">
            <div className="bg-indigo-950 text-indigo-200 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center border border-indigo-900">
               <Info className="h-3 w-3 mr-3 text-indigo-500" />
               Locked for <span className="text-white mx-1">10:00</span> minutes
            </div>
        </div>
      </div>
    </div>
  );
};

export default FlightSeatSelectionPage;
