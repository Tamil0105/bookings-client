import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheaterStore } from '../store/theaterStore';
import { useBookingStore, BookingType, BookingStatus } from '../store/bookingStore';
import { Armchair, Check, AlertCircle, ShoppingCart, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SeatSelectionPage: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { seats, fetchSeats, lockSeat, confirmBooking, isLoading, error } = useTheaterStore();
  const { createBooking } = useBookingStore();
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (showId) {
      fetchSeats(showId);
      const interval = setInterval(() => fetchSeats(showId), 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [showId, fetchSeats]);

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
      // 1. Confirm with Theater Service
      await confirmBooking(selectedSeatIds);

      // 2. Create Global Booking Record
      await createBooking({
        type: BookingType.THEATER,
        status: BookingStatus.CONFIRMED,
        totalAmount: selectedSeatIds.length * 15, // Mock price $15
        items: { showId, seatIds: selectedSeatIds },
      });

      navigate('/bookings');
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  // Group seats by row
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, typeof seats>);

  const sortedRowKeys = Object.keys(rows).sort();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="text-emerald-600 font-medium hover:underline mb-2 flex items-center"
          >
            ← Back to Shows
          </button>
          <h1 className="text-3xl font-bold text-emerald-950">Select Seats</h1>
        </div>
        
        <div className="flex space-x-4 text-sm font-medium">
          <div className="flex items-center"><div className="w-4 h-4 bg-white border border-gray-300 rounded mr-2" /> Available</div>
          <div className="flex items-center"><div className="w-4 h-4 bg-emerald-600 rounded mr-2" /> Selected</div>
          <div className="flex items-center"><div className="w-4 h-4 bg-gray-300 rounded mr-2" /> Booked</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="glass-panel p-12 rounded-3xl shadow-sm border border-emerald-100/50 overflow-x-auto">
        {/* Screen */}
        <div className="w-full h-2 bg-emerald-100/50 rounded-full mb-16 relative shadow-inner">
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-emerald-900/40 text-xs font-bold uppercase tracking-widest">
            Cinema Screen This Way
          </div>
        </div>

        {/* Grid */}
        <div className="space-y-4 min-w-[600px]">
          {sortedRowKeys.map((rowKey) => (
            <div key={rowKey} className="flex items-center justify-center space-x-4">
              <div className="w-6 text-emerald-900/60 font-bold text-sm">{rowKey}</div>
              <div className="flex space-x-2">
                {rows[rowKey].sort((a,b) => a.number - b.number).map((seat) => {
                  const isSelected = selectedSeatIds.includes(seat.id);
                  const isBooked = seat.status === 'BOOKED';
                  const isLocked = seat.status === 'LOCKED' && !isSelected;

                  return (
                    <button
                      key={seat.id}
                      disabled={isBooked || (isLocked && !isSelected)}
                      onClick={() => handleSeatClick(seat.id, seat.status)}
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 border relative group",
                        isSelected 
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-lg -translate-y-1" 
                          : isBooked
                            ? "bg-stone-200 border-stone-200 text-stone-400 cursor-not-allowed"
                            : isLocked
                              ? "bg-amber-100 border-amber-300 text-amber-600 cursor-wait"
                              : "bg-white border-emerald-100 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50"
                      )}
                      title={`Row ${seat.row}, Seat ${seat.number}`}
                    >
                      <Armchair className="h-5 w-5" />
                      {!isBooked && !isSelected && (
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {seat.row}{seat.number} - ${15}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="w-6 text-emerald-900/60 font-bold text-sm text-right">{rowKey}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Bar */}
      <div className={cn(
        "glass-panel p-6 rounded-2xl shadow-xl border border-white/60 flex items-center justify-between sticky bottom-4 transition-all duration-300 transform",
        selectedSeatIds.length > 0 ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center space-x-8">
          <div>
            <p className="text-emerald-900/60 text-sm font-medium uppercase tracking-wider">Seats Selected</p>
            <p className="text-xl font-bold flex items-center text-emerald-950">
              {selectedSeatIds.length} <span className="text-emerald-200 mx-2 text-sm font-normal">|</span> 
              <span className="text-emerald-600">{selectedSeatIds.map(id => {
                const s = seats.find(x => x.id === id);
                return s ? `${s.row}${s.number}` : '';
              }).join(', ')}</span>
            </p>
          </div>
          <div>
            <p className="text-emerald-900/60 text-sm font-medium uppercase tracking-wider">Total Price</p>
            <p className="text-2xl font-black text-emerald-950">${selectedSeatIds.length * 15}</p>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs flex items-center border border-emerald-100 max-w-[200px]">
            <Info className="h-4 w-4 mr-2 flex-shrink-0" />
            Seats are locked for 10 mins after selection.
          </div>
          <button
            onClick={handleConfirm}
            disabled={isLoading || isProcessing}
            className="btn-primary px-10 py-4 rounded-xl font-bold flex items-center"
          >
            {isLoading || isProcessing ? 'Processing...' : (
              <>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Book Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
