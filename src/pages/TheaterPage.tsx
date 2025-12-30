import React, { useEffect, useState } from 'react';
import { useTheaterStore } from '../store/theaterStore';
import { useNavigate } from 'react-router-dom';
import { Film, MapPin, Calendar, Clock, ChevronRight, AlertCircle, Search } from 'lucide-react';
import { format } from 'date-fns';

const TheaterPage: React.FC = () => {
  const navigate = useNavigate();
  const { theaters, shows, fetchTheaters, fetchShows, isLoading, error } = useTheaterStore();
  const [selectedTheaterId, setSelectedTheaterId] = useState<string | null>(null);

  useEffect(() => {
    fetchTheaters();
  }, [fetchTheaters]);

  const handleTheaterSelect = (theaterId: string) => {
    setSelectedTheaterId(theaterId);
    fetchShows(theaterId);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-emerald-950 tracking-tight">Movie Theaters</h1>
        <p className="text-emerald-900/60 border-b border-emerald-100 pb-4 font-medium">Select a theater near you to view current shows.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-700 mr-2" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Theater List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold flex items-center text-emerald-800">
            <Search className="h-4 w-4 mr-2" /> Nearby Theaters
          </h2>
          <div className="space-y-3">
            {theaters.map((theater) => (
              <button
                key={theater.id}
                onClick={() => handleTheaterSelect(theater.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedTheaterId === theater.id
                    ? 'bg-emerald-950 border-emerald-950 text-white shadow-lg'
                    : 'bg-white border-emerald-100 text-emerald-900/70 hover:border-emerald-500 hover:bg-emerald-50'
                }`}
              >
                <p className="font-bold">{theater.name}</p>
                <div className="flex items-center text-xs mt-1 opacity-80">
                  <MapPin className="h-3 w-3 mr-1" /> {theater.location}
                </div>
              </button>
            ))}
            {theaters.length === 0 && !isLoading && (
              <p className="text-sm text-emerald-500 italic">No theaters found.</p>
            )}
          </div>
        </div>

        {/* Show List */}
        <div className="lg:col-span-3">
          {!selectedTheaterId ? (
            <div className="h-full flex flex-col items-center justify-center bg-white/50 rounded-2xl border-2 border-dashed border-emerald-100 p-12 text-center">
              <Film className="h-16 w-16 text-emerald-200 mb-4" />
              <p className="text-emerald-600 font-medium">Please select a theater to view available movie shows.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-black flex items-center text-emerald-950">
                Current Shows
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shows.length > 0 ? (
                  shows.map((show) => (
                    <div
                      key={show.id}
                      className="glass-panel p-6 rounded-2xl border border-white/60 hover:border-emerald-500 hover:shadow-xl transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-black text-emerald-950 line-clamp-1">{show.movieName}</h3>
                          <div className="flex items-center text-sm text-emerald-700 mt-1 font-medium">
                            <Clock className="h-4 w-4 mr-1" /> {format(new Date(show.startTime), 'p')}
                          </div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-sm font-black">
                          ${show.price}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => navigate(`/theater/shows/${show.id}/seats`)}
                        className="w-full mt-4 flex items-center justify-center py-3 bg-emerald-950 text-white rounded-xl font-bold hover:bg-emerald-900 transition-colors"
                      >
                        Book Seats
                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center bg-emerald-50/50 rounded-3xl border-2 border-dashed border-emerald-100">
                    <Calendar className="h-16 w-16 text-emerald-200 mx-auto mb-4" />
                    <p className="text-emerald-600 font-medium">No shows available for this theater today.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheaterPage;
