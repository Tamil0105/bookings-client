import React, { useState } from 'react';
import { useTrainStore } from '../store/trainStore';
import { useNavigate } from 'react-router-dom';
import { Search, Train, Calendar, MapPin, ChevronRight, AlertCircle, ArrowRightLeft, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';

const TrainSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { trips, searchTrips, isLoading, error } = useTrainStore();
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchTrips(searchParams.origin, searchParams.destination, searchParams.date);
  };

  const swapStations = () => {
    setSearchParams(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 p-20 opacity-10 -rotate-12 translate-x-20 translate-y-[-20px]">
           <Train className="w-96 h-96" />
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-500/20">
            Real-time Railway Network
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-tight">Explore the beauty of the rails.</h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">Book tickets for Express, Superfast, and Premium trains across the national network with ease.</p>
        </div>
      </div>

      {/* Modern Search Card */}
      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 -mt-24 relative z-10 mx-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="relative group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Departure Station</label>
            <div className="relative">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                required
                value={searchParams.origin}
                onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value.toUpperCase() })}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-xl text-slate-900 uppercase placeholder:text-slate-300"
                placeholder="Station Code (e.g., NDLS)"
              />
            </div>
            <button 
              type="button"
              onClick={swapStations}
              className="absolute -right-4 top-[65%] -translate-y-1/2 z-20 p-2 bg-white border border-slate-100 rounded-full shadow-lg text-slate-400 hover:text-blue-600 hover:rotate-180 transition-all duration-500 hidden xl:block"
            >
              <ArrowRightLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Arrival Station</label>
            <div className="relative">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                required
                value={searchParams.destination}
                onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value.toUpperCase() })}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 outline-none transition-all font-black text-xl text-slate-900 uppercase placeholder:text-slate-300"
                placeholder="Station Code (e.g., CSTM)"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-2">Date of Journey</label>
            <div className="relative group">
              <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="date"
                required
                value={searchParams.date}
                onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-lg text-slate-900"
              />
            </div>
          </div>

          <div className="pt-7">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[68px] bg-slate-900 text-white rounded-3xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center group disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  Find Trains
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="mx-6 bg-red-50 border-l-4 border-red-500 p-6 rounded-3xl flex items-center shadow-sm">
          <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
          <p className="text-red-700 font-bold">{error}</p>
        </div>
      )}

      {/* Trip Cards */}
      <div className="px-6 space-y-8">
        {trips.length > 0 ? (
          trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white p-10 rounded-[4rem] border border-slate-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-50/50 transition-all group"
            >
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                <div className="flex items-center space-x-10">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center group-hover:bg-slate-900 transition-all duration-500 shadow-inner">
                    <Train className="h-10 w-10 text-slate-300 group-hover:text-white transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-[0.2em] border border-blue-100">Daily Express</span>
                      <span className="text-xs font-bold text-slate-400 capitalize">Rajdhani Special</span>
                    </div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">#{trip.id.slice(-5).toUpperCase()}</h3>
                  </div>
                </div>

                <div className="flex-1 max-w-2xl flex items-center justify-between bg-slate-50/50 p-10 rounded-[3.5rem] border border-slate-100/50">
                  <div className="text-center space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{searchParams.origin}</p>
                    <p className="text-3xl font-black text-slate-900">{format(new Date(trip.departureTime), 'p')}</p>
                    <p className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100">Platform 4</p>
                  </div>

                  <div className="flex-1 flex flex-col items-center px-12 relative">
                    <div className="w-full h-px border-t-[3px] border-dotted border-slate-200 relative mb-4">
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-400 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                       </div>
                    </div>
                    <div className="flex items-center text-xs font-black text-slate-950 px-4 py-1.5 bg-white rounded-full border border-slate-100 shadow-sm">
                       <Clock className="h-3 w-3 mr-2 text-blue-500" />
                       12h 30m
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{searchParams.destination}</p>
                    <p className="text-3xl font-black text-slate-900">{format(new Date(trip.arrivalTime), 'p')}</p>
                    <p className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100">Platform 1</p>
                  </div>
                </div>

                <div className="flex items-center justify-between xl:justify-end xl:space-x-16 border-t xl:border-0 pt-10 xl:pt-0">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Starting from</p>
                    <p className="text-4xl font-black text-blue-600">${trip.basePrice}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/train/trips/${trip.id}/seats`)}
                    className="bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black text-xl hover:bg-black transition-all hover:-translate-y-1 shadow-2xl shadow-slate-200 flex items-center group/btn"
                  >
                    Select Coach
                    <ChevronRight className="h-6 w-6 ml-3 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
              
              <div className="mt-10 pt-8 border-t border-slate-50 flex items-center space-x-8 text-[10px] font-black text-slate-400 uppercase tracking-widest overflow-x-auto whitespace-nowrap scrollbar-hide">
                <div className="flex items-center"><Info className="h-3 w-3 mr-2 text-blue-500" /> Free WiFi on board</div>
                <div className="flex items-center"><Info className="h-3 w-3 mr-2 text-blue-500" /> Meals Included</div>
                <div className="flex items-center"><Info className="h-3 w-3 mr-2 text-blue-500" /> Bio-Toilet Equipped</div>
                <div className="flex items-center flex-1 justify-end text-blue-600">PNR generated instantly on booking</div>
              </div>
            </div>
          ))
        ) : (
          !isLoading && (
            <div className="py-24 text-center bg-slate-50/30 rounded-[5rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-xl mb-8">
                <Search className="h-10 w-10 text-slate-100" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Search for your journey</h3>
              <p className="text-slate-400 mt-3 text-lg font-medium max-w-sm">Enter station codes like NDLS to CSTM to explore train availability.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TrainSearchPage;
