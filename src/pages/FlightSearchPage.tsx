import React, { useState } from 'react';
import { useFlightStore } from '../store/flightStore';
import { useNavigate } from 'react-router-dom';
import { Search, Plane, Calendar, MapPin, ChevronRight, AlertCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { format } from 'date-fns';

const FlightSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { schedules, searchFlights, isLoading, error } = useFlightStore();
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchFlights(searchParams.origin, searchParams.destination, searchParams.date);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="relative h-[300px] rounded-[40px] overflow-hidden bg-black flex items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>
        
        <div className="relative text-center space-y-6 max-w-2xl">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-black uppercase tracking-[0.3em] border border-white/20">
            <Zap className="h-3 w-3 mr-2" />
            Global Flight Network
          </div>
          <h1 className="text-5xl font-black text-white leading-tight">Where would you like to fly?</h1>
          <p className="text-slate-400 text-lg font-medium opacity-80">Book domestic and international flights with premium services.</p>
        </div>
      </div>

      {/* Search Interface */}
      <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 -mt-24 relative z-10 mx-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
              <MapPin className="h-3 w-3 mr-2 text-black" /> Origin Airport
            </label>
            <input
              type="text"
              required
              maxLength={3}
              value={searchParams.origin}
              onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value.toUpperCase() })}
              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all font-black text-2xl tracking-widest text-slate-900 placeholder:text-slate-300"
              placeholder="JFK"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
              <MapPin className="h-3 w-3 mr-2 text-black" /> Destination
            </label>
            <input
              type="text"
              required
              maxLength={3}
              value={searchParams.destination}
              onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value.toUpperCase() })}
              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all font-black text-2xl tracking-widest text-slate-900 placeholder:text-slate-300"
              placeholder="DEL"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
              <Calendar className="h-3 w-3 mr-2 text-black" /> Departure Date
            </label>
            <input
              type="date"
              required
              value={searchParams.date}
              onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all font-bold text-lg text-slate-900"
            />
          </div>

          <div className="pt-7">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[68px] bg-black text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center group disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  Search Flights
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="mx-6 bg-slate-50 border-l-4 border-black p-6 rounded-2xl flex items-center">
          <AlertCircle className="h-6 w-6 text-black mr-3" />
          <p className="text-black font-medium">{error}</p>
        </div>
      )}

      {/* Results Section */}
      <div className="px-6 space-y-6">
        {schedules.length > 0 ? (
          schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white p-8 rounded-[40px] border border-slate-100 hover:border-black hover:shadow-2xl transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity">
                <Plane className="h-24 w-24 text-black -rotate-12" />
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
                <div className="flex items-center space-x-8">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center group-hover:bg-black transition-colors">
                    <Plane className="h-10 w-10 text-black group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded-md uppercase tracking-widest border border-slate-200">Direct Flight</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Skyline Airways</span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">FL-{schedule.id.slice(-4).toUpperCase()}</h3>
                  </div>
                </div>

                <div className="flex-1 max-w-xl flex items-center justify-between bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
                  <div className="text-center">
                    <p className="text-3xl font-black text-slate-900">{format(new Date(schedule.departureTime), 'p')}</p>
                    <p className="text-sm font-black text-slate-500 uppercase mt-1 tracking-widest">{searchParams.origin}</p>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center px-12 relative">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Non-Stop</div>
                    <div className="w-full h-px border-t-2 border-dashed border-slate-200 relative">
                       <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-black bg-white p-0.5" />
                    </div>
                    <div className="text-xs font-bold text-slate-500 mt-4">2h 45m</div>
                  </div>

                  <div className="text-center">
                    <p className="text-3xl font-black text-slate-900">{format(new Date(schedule.arrivalTime), 'p')}</p>
                    <p className="text-sm font-black text-slate-500 uppercase mt-1 tracking-widest">{searchParams.destination}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end lg:space-x-12 border-t lg:border-0 pt-8 lg:pt-0">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Starting Price</p>
                    <p className="text-4xl font-black text-black">${schedule.basePrice}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/flight/schedules/${schedule.id}/seats`)}
                    className="bg-black text-white px-10 py-5 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center group/btn"
                  >
                    Select Seats
                    <ChevronRight className="h-5 w-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <div className="flex items-center space-x-6">
                  <span className="flex items-center"><ShieldCheck className="h-3 w-3 mr-1 text-black" /> Free Cancellation</span>
                  <span className="flex items-center"><Zap className="h-3 w-3 mr-1 text-black" /> Fast Booking</span>
                </div>
                <div className="flex items-center">
                  Baggage: <span className="text-black ml-1">20KG + 7KG</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          !isLoading && (
            <div className="py-24 text-center bg-slate-50/50 rounded-[50px] border-4 border-dashed border-slate-100 flex flex-col items-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-8">
                <Plane className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">No flights found</h3>
              <p className="text-slate-500 mt-2 max-w-sm font-medium">Try searching for different routes (e.g., JFK to DEL) or dates.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default FlightSearchPage;
