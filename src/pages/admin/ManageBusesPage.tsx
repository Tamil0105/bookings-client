import React, { useEffect, useState } from 'react';
import { Bus, Plus, Trash, MapPin, Clock, Calendar } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';

const ManageBusesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trips' | 'buses' | 'routes'>('trips');
  const [trips, setTrips] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'trips') {
         const [tRes, bRes, rRes] = await Promise.all([
           api.get('/bus/trips'),
           api.get('/bus'),
           api.get('/bus/routes')
         ]);
         setTrips(tRes.data);
         setBuses(bRes.data);
         setRoutes(rRes.data);
      } else if (activeTab === 'buses') {
        const res = await api.get('/bus');
        setBuses(res.data);
      } else if (activeTab === 'routes') {
        const res = await api.get('/bus/routes');
        setRoutes(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string, type: 'bus' | 'route' | 'trip') => {
    if(!window.confirm('Are you sure?')) return;
    try {
      if(type === 'bus') await api.delete(`/bus/${id}`);
      // Note: Delete route/trip endpoints might differ or need query params. 
      // Assuming generic /bus/:id for bus. 
      // Trip delete? BusController didn't show deleteTrip explicitly? 
      // Just bus. DELETE /bus/:id deletes a bus.
      // I need to check controller for deleteTrip and deleteRoute. 
      // Steps 275 showed: deleteBus only.
      // I won't implement delete for routes/trips if backend doesn't support it yet, to avoid errors.
      if (type === 'bus') fetchData();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const handleSubmit = async () => {
    try {
      if (activeTab === 'buses') {
        await api.post('/bus', formData);
      } else if (activeTab === 'routes') {
        await api.post('/bus/routes', formData);
      } else if (activeTab === 'trips') {
        await api.post('/bus/trips', {
            ...formData,
             departureTime: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
             arrivalTime: new Date(`${formData.date}T${formData.endTime}`).toISOString(),
        });
      }
      setIsModalOpen(false);
      setFormData({});
      fetchData();
      alert('Created successfully');
    } catch (error) {
      alert('Failed to create');
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Manage Buses</h1>
          <p className="text-slate-500">Manage fleet, routes, and schedules.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center shadow-lg shadow-black/20"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add {activeTab === 'trips' ? 'Trip' : activeTab === 'buses' ? 'Bus' : 'Route'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 bg-slate-100 p-1 rounded-2xl w-fit">
        {['trips', 'buses', 'routes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
              activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeTab === 'trips' && trips.map((trip) => (
          <div key={trip.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><Bus className="h-6 w-6"/></div>
                <div>
                   <h3 className="font-bold text-slate-900 text-lg">${trip.price}</h3>
                   <div className="text-sm text-slate-500 flex items-center gap-2">
                      <Clock className="h-4 w-4"/> {format(new Date(trip.departureTime), 'MMM dd HH:mm')} - {format(new Date(trip.arrivalTime), 'HH:mm')}
                   </div>
                </div>
             </div>
             {/* Delete button omitted if backend missing */}
          </div>
        ))}
        {activeTab === 'buses' && buses.map((bus) => (
           <div key={bus.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
             <div>
               <h3 className="font-bold text-slate-900">{bus.busNumber}</h3>
               <p className="text-sm text-slate-500">{bus.name} - {bus.type} ({bus.capacity} seats)</p>
             </div>
             <button onClick={() => handleDelete(bus.id, 'bus')} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash className="h-5 w-5"/></button>
           </div>
        ))}
         {activeTab === 'routes' && routes.map((route) => (
           <div key={route.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-900 flex items-center gap-2">
               {route.source} <span className="text-slate-400">→</span> {route.destination}
             </h3>
             <p className="text-sm text-slate-500">{route.distance}km • {route.duration}</p>
           </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 capitalize">Add New {activeTab.slice(0, -1)}</h2>
            <div className="space-y-4">
               {activeTab === 'buses' && (
                 <>
                   <input placeholder="Bus Number" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, busNumber: e.target.value})} />
                   <input placeholder="Name (Operator)" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, name: e.target.value})} />
                   <input placeholder="Type (AC/Sleeper)" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, type: e.target.value})} />
                   <input type="number" placeholder="Capacity" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} />
                 </>
               )}
               {activeTab === 'routes' && (
                 <>
                   <input placeholder="Source" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, source: e.target.value})} />
                   <input placeholder="Destination" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, destination: e.target.value})} />
                   <input type="number" placeholder="Distance (km)" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, distance: Number(e.target.value)})} />
                   <input placeholder="Duration (e.g. 4h 30m)" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, duration: e.target.value})} />
                 </>
               )}
               {activeTab === 'trips' && (
                 <>
                   <select className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, busId: e.target.value})}>
                      <option value="">Select Bus</option>
                      {buses.map(b => <option key={b.id} value={b.id}>{b.busNumber} - {b.name}</option>)}
                   </select>
                   <select className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, routeId: e.target.value})}>
                      <option value="">Select Route</option>
                      {routes.map(r => <option key={r.id} value={r.id}>{r.source} - {r.destination}</option>)}
                   </select>
                   <input type="date" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, date: e.target.value})} />
                   <div className="grid grid-cols-2 gap-4">
                     <input type="time" placeholder="Departure" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, startTime: e.target.value})} />
                     <input type="time" placeholder="Arrival" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, endTime: e.target.value})} />
                   </div>
                   <input type="number" placeholder="Price" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                 </>
               )}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
              <button onClick={handleSubmit} className="py-3 font-bold text-white bg-black hover:bg-slate-800 rounded-xl shadow-lg">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBusesPage;
