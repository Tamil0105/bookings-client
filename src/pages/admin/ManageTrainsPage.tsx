import React, { useEffect, useState } from 'react';
import { Train as TrainIcon, Plus, Trash, Clock } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';

const ManageTrainsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trips' | 'trains' | 'stations'>('trips');
  const [trips, setTrips] = useState<any[]>([]);
  const [trains, setTrains] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'trips') {
         const [tRes, trRes, sRes] = await Promise.all([
           api.get('/train/trips'),
           api.get('/train'),
           api.get('/train/stations')
         ]);
         setTrips(tRes.data);
         setTrains(trRes.data);
         setStations(sRes.data);
      } else if (activeTab === 'trains') {
        const res = await api.get('/train');
        setTrains(res.data);
      } else if (activeTab === 'stations') {
        const res = await api.get('/train/stations');
        setStations(res.data);
      }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: string, type: 'train') => {
    if(!window.confirm('Are you sure?')) return;
    try {
       await api.delete(`/train/${id}`);
       fetchData();
    } catch { alert('Failed to delete'); }
  };

  const handleSubmit = async () => {
    try {
      if (activeTab === 'trains') {
        await api.post('/train', formData);
      } else if (activeTab === 'stations') {
        await api.post('/train/stations', formData);
      } else if (activeTab === 'trips') {
        await api.post('/train/trips', {
            ...formData,
             departureTime: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
             arrivalTime: new Date(`${formData.date}T${formData.endTime}`).toISOString(),
        });
      }
      setIsModalOpen(false);
      setFormData({});
      fetchData();
    } catch { alert('Failed to create'); }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Manage Trains</h1>
          <p className="text-slate-500">Manage trains, stations, and trips.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-rose-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-600 transition-colors flex items-center shadow-lg shadow-rose-200">
          <Plus className="h-5 w-5 mr-2" /> Add Item
        </button>
      </div>

       {/* Tabs */}
       <div className="flex space-x-2 mb-8 bg-slate-100 p-1 rounded-2xl w-fit">
        {['trips', 'trains', 'stations'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>{tab}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeTab === 'trips' && trips.map((trip) => (
           <div key={trip.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-100 text-rose-600 rounded-xl"><TrainIcon className="h-6 w-6"/></div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">${trip.basePrice}</h3>
                   <div className="text-sm text-slate-500 flex items-center gap-2">
                      <Clock className="h-4 w-4"/> {format(new Date(trip.departureTime), 'MMM dd HH:mm')} - {format(new Date(trip.arrivalTime), 'HH:mm')}
                   </div>
                </div>
             </div>
           </div>
        ))}
        {activeTab === 'trains' && trains.map((t) => (
           <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
             <div><h3 className="font-bold text-slate-900">{t.trainNumber} - {t.name}</h3><p className="text-sm text-slate-500">{t.type}</p></div>
             <button onClick={() => handleDelete(t.id, 'train')} className="text-red-500 bg-red-50 p-2 rounded-lg"><Trash className="h-5 w-5"/></button>
           </div>
        ))}
        {activeTab === 'stations' && stations.map((s) => (
           <div key={s.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-900">{s.code} - {s.name}</h3>
             <p className="text-sm text-slate-500">{s.city}, {s.state}</p>
           </div>
        ))}
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 capitalize">Add New {activeTab.slice(0, -1)}</h2>
            <div className="space-y-4">
               {activeTab === 'trains' && (
                 <>
                   <input placeholder="Train Number" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, trainNumber: e.target.value})} />
                   <input placeholder="Name" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, name: e.target.value})} />
                   <input placeholder="Type (e.g. High Speed)" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, type: e.target.value})} />
                 </>
               )}
               {activeTab === 'stations' && (
                 <>
                   <input placeholder="Code" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, code: e.target.value})} />
                   <input placeholder="Name" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, name: e.target.value})} />
                   <input placeholder="City" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, city: e.target.value})} />
                   <input placeholder="State" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, state: e.target.value})} />
                 </>
               )}
               {activeTab === 'trips' && (
                 <>
                   <select className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, trainId: e.target.value})}>
                      <option value="">Select Train</option>
                      {trains.map(t => <option key={t.id} value={t.id}>{t.trainNumber} - {t.name}</option>)}
                   </select>
                   <div className="grid grid-cols-2 gap-4">
                     <select className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, originStationId: e.target.value})}>
                        <option value="">Origin</option>
                        {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                     </select>
                     <select className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, destinationStationId: e.target.value})}>
                        <option value="">Dest</option>
                        {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                     </select>
                   </div>
                   <input type="date" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, date: e.target.value})} />
                   <div className="grid grid-cols-2 gap-4">
                     <input type="time" placeholder="Departure" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, startTime: e.target.value})} />
                     <input type="time" placeholder="Arrival" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, endTime: e.target.value})} />
                   </div>
                   <input type="number" placeholder="Base Price" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})} />
                 </>
               )}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
              <button onClick={handleSubmit} className="py-3 font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTrainsPage;
