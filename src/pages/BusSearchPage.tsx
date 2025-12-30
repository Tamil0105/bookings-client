import React, { useState } from 'react';
import { useBusStore } from '../store/busStore';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Search, Bus, ChevronRight, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { format } from 'date-fns';

const BusSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { trips, searchTrips, isLoading, error } = useBusStore();
  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchTrips(searchParams.source, searchParams.destination, searchParams.date);
  };

  const swapPlaces = () => {
    setSearchParams(prev => ({
      ...prev,
      source: prev.destination,
      destination: prev.source
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Search Bus Trips</h1>
        <p className="text-gray-500 text-lg">Travel across the country with comfort and ease.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 -mt-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="relative">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">From</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                required
                value={searchParams.source}
                onChange={(e) => setSearchParams({ ...searchParams, source: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-gray-900"
                placeholder="Source City"
              />
            </div>
            <button 
              type="button"
              onClick={swapPlaces}
              className="absolute -right-3 top-[60%] -translate-y-1/2 z-10 p-1.5 bg-white border border-gray-100 rounded-full shadow-md text-gray-400 hover:text-indigo-600 hover:scale-110 transition-all hidden md:block"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">To</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                required
                value={searchParams.destination}
                onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-gray-900"
                placeholder="Destination City"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Date</label>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="date"
                required
                value={searchParams.date}
                onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="h-[60px] bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center group disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Find Buses
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {trips.length > 0 ? (
          trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-gray-200 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center space-x-6">
                  <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Bus className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Luxury Sleeper AC</h3>
                    <p className="text-sm text-gray-500">Trip ID: {trip.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex-1 max-w-sm flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-2xl font-black text-gray-900">{format(new Date(trip.departureTime), 'p')}</p>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">{searchParams.source || 'Source'}</p>
                  </div>
                  <div className="flex-1 px-4 relative">
                    <div className="h-px bg-dashed bg-gray-200 w-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100 rounded-full">
                      ~ {format(new Date(new Date(trip.arrivalTime).getTime() - new Date(trip.departureTime).getTime()), 'H')}h
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-gray-900">{format(new Date(trip.arrivalTime), 'p')}</p>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-tighter">{searchParams.destination || 'Dest'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end md:space-x-12 border-t md:border-0 pt-6 md:pt-0">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Starting from</p>
                    <p className="text-3xl font-black text-indigo-600">${trip.price}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/bus/trips/${trip.id}/seats`)}
                    className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center group/btn shadow-lg"
                  >
                    Select Seats
                    <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          !isLoading && (
            <div className="py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Search className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No journeys found</h3>
              <p className="text-gray-500 mt-2">Try searching with different cities or dates.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default BusSearchPage;
