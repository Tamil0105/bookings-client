import React, { useEffect } from 'react';
import { useBookingStore, BookingType, BookingStatus } from '../store/bookingStore';
import { Calendar, Film, Bus, Plane, Train, Clock, CheckCircle, XCircle, AlertCircle, Receipt } from 'lucide-react';
import { format } from 'date-fns';

const BookingsPage: React.FC = () => {
  const { bookings, fetchMyBookings, isLoading, error } = useBookingStore();

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  const getIcon = (type: BookingType) => {
    switch (type) {
      case BookingType.CALENDAR: return <Calendar className="h-6 w-6 text-purple-500" />;
      case BookingType.THEATER: return <Film className="h-6 w-6 text-red-500" />;
      case BookingType.BUS: return <Bus className="h-6 w-6 text-orange-500" />;
      case BookingType.FLIGHT: return <Plane className="h-6 w-6 text-indigo-500" />;
      case BookingType.TRAIN: return <Train className="h-6 w-6 text-blue-500" />;
      default: return <Receipt className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Confirmed</span>;
      case BookingStatus.PENDING:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Pending</span>;
      case BookingStatus.CANCELLED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Cancelled</span>;
      case BookingStatus.EXPIRED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><AlertCircle className="h-3 w-3 mr-1" /> Expired</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Bookings</h1>
        <p className="text-gray-500 mt-2">View and manage all your reservations in one place.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="h-8 w-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
           <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {!isLoading && bookings.length === 0 && (
        <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-100">
           <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
           <h3 className="text-xl font-bold text-gray-900">No bookings found</h3>
           <p className="text-gray-500 mt-2">You haven't made any reservations yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
             <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                   <div className="p-3 bg-gray-50 rounded-xl">
                      {getIcon(booking.type)}
                   </div>
                   <div>
                      <div className="flex items-center space-x-3">
                         <h3 className="text-lg font-bold text-gray-900 capitalize">{booking.type.toLowerCase()} Booking</h3>
                         {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                         Booked on {format(new Date(booking.createdAt), 'PPpp')}
                      </p>
                      
                      {/* Detailed Items View (Simplified) */}
                      <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg font-mono">
                         <p>Ref ID: {booking.id.slice(-6).toUpperCase()}</p>
                         {/* We can expand items based on structure, for now just showing raw count/amount */}
                         <p>Items: {booking.items?.seatIds?.length || booking.items?.seats?.length || '1'} reserved</p>
                      </div>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Paid</p>
                   <p className="text-2xl font-black text-gray-900">${booking.totalAmount}</p>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingsPage;
