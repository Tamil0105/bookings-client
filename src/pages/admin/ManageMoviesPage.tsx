import React, { useEffect, useState } from 'react';
import { Film, Plus, Trash, Calendar, Clock } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';

const ManageMoviesPage: React.FC = () => {
  const [theaters, setTheaters] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    theaterId: '',
    screenId: '', // To be fetched based on theater
    movieName: '',
    price: 100,
    date: '',
    startTime: '',
    endTime: ''
  });
  const [screens, setScreens] = useState<any[]>([]);

  useEffect(() => {
    fetchTheaters();
  }, []);

  useEffect(() => {
    if (formData.theaterId) {
      // Fetch screens for theater ? Current API might not support directly querying screens publically or we iterate
      // For simplicity, we might just need to fetch shows. 
      // Actually TheaterController has findShowsByTheater. 
      fetchShows(formData.theaterId);
    }
  }, [formData.theaterId]);

  const fetchTheaters = async () => {
    try {
      const res = await api.get('/theater');
      setTheaters(res.data);
      if(res.data.length > 0) setFormData(prev => ({ ...prev, theaterId: res.data[0].id }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShows = async (theaterId: string) => {
    try {
      const res = await api.get(`/theater/${theaterId}/shows`);
      setShows(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchScreens = async (theaterId: string) => {
    try {
      const res = await api.get(`/theater/${theaterId}/screens`);
      setScreens(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenModal = () => {
    if (formData.theaterId) fetchScreens(formData.theaterId);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.screenId || !formData.date || !formData.startTime || !formData.endTime || !formData.movieName) {
      alert('Please fill all fields');
      return;
    }

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    try {
      await api.post('/theater/shows', {
        screenId: formData.screenId,
        movieName: formData.movieName,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        price: formData.price
      });
      setIsModalOpen(false);
      fetchShows(formData.theaterId);
      alert('Show created successfully!');
    } catch (error) {
      alert('Failed to create show');
    }
  };

  const handleDelete = async (showId: string) => {
    if(!window.confirm('Delete this show?')) return;
    try {
      await api.delete(`/theater/shows/${showId}`);
      // Refresh
      if (formData.theaterId) fetchShows(formData.theaterId);
    } catch (error) {
      alert('Failed to delete show');
    }
  };

  // Note: To create a show, we need a screenId. 
  // The current API might make it hard to get screens if we don't have an endpoint. 
  // Let's assume for this MVP we might need to hardcode or just picking the first screen if available?
  // Checking TheaterController... "createScreen" exists but "getScreens"?
  // findShowsByTheater gets screens internally. 
  // We might need to add an endpoint to get screens or just blindly create one?
  // Let's checking backend controller again. 
  
  return (
    <div className="max-w-7xl mx-auto pb-20">
       <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Manage Movies</h1>
          <p className="text-slate-500">Schedule shows and manage listings.</p>
        </div>
        
        {/* Theater Selector */}
        <select 
          className="bg-white border-none rounded-xl px-4 py-2 font-bold focus:ring-2 focus:ring-black"
          value={formData.theaterId}
          onChange={(e) => setFormData({...formData, theaterId: e.target.value})}
        >
          {theaters.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Add New Card */}
        <button 
           onClick={handleOpenModal}
           className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-10 hover:border-black hover:bg-slate-50 transition-all group"
        >
          <div className="bg-black text-white p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <Plus className="h-6 w-6" />
          </div>
          <p className="font-bold text-slate-900">Add New Show</p>
        </button>

        {shows.map((show) => (
          <div key={show.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                <Film className="h-6 w-6" />
              </div>
              <button 
                onClick={() => handleDelete(show.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash className="h-5 w-5" />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-1">{show.movieName}</h3>
            <div className="flex items-center text-slate-500 text-sm font-medium mb-4">
               <Calendar className="h-4 w-4 mr-2" />
               {format(new Date(show.startTime), 'MMM dd')}
               <Clock className="h-4 w-4 ml-3 mr-2" />
               {format(new Date(show.startTime), 'HH:mm')}
            </div>

            <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="font-black text-slate-900 text-lg">${show.price}</span>
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-full text-slate-600">Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Show Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold mb-6">Schedule New Show</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Movie Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Inception"
                  value={formData.movieName}
                  onChange={(e) => setFormData({...formData, movieName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select Screen</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500"
                  value={formData.screenId}
                  onChange={(e) => setFormData({...formData, screenId: e.target.value})}
                >
                  <option value="">Select a screen</option>
                  {screens.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rows}x{s.cols})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Price</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Start Time</label>
                  <input 
                    type="time" 
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">End Time</label>
                  <input 
                    type="time" 
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-500"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-lg shadow-indigo-200"
              >
                Create Show
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMoviesPage;
