import React, { useEffect, useState } from 'react';
import { Plane, Plus, Trash, MapPin, Clock } from 'lucide-react';
import api from '../../services/api';
import { format } from 'date-fns';

const ManageFlightsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedules' | 'flights' | 'airports'>('schedules');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [airports, setAirports] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'schedules') {
        const [sRes, fRes, aRes] = await Promise.all([
           api.get('/flight/schedules'),
           api.get('/flight'),
           api.get('/flight/airports')
        ]);
        setSchedules(sRes.data);
        setFlights(fRes.data);
        setAirports(aRes.data);
      } else if (activeTab === 'flights') {
        const res = await api.get('/flight');
        setFlights(res.data);
      } else if (activeTab === 'airports') {
        const res = await api.get('/flight/airports');
        setAirports(res.data);
      }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: string, type: 'flight') => {
    if(!window.confirm('Are you sure?')) return;
    try {
       await api.delete(`/flight/${id}`);
       fetchData();
    } catch { alert('Failed to delete'); }
  };

  const handleSubmit = async () => {
    try {
      if (activeTab === 'flights') {
        await api.post('/flight', formData);
      } else if (activeTab === 'airports') {
        await api.post('/flight/airports', formData);
      } else if (activeTab === 'schedules') {
        await api.post('/flight/schedules', {
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
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Manage Flights</h1>
          <p className="text-slate-500">Manage airlines, airports, and flight schedules.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-sky-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-600 transition-colors flex items-center shadow-lg shadow-sky-200">
          <Plus className="h-5 w-5 mr-2" /> Add Item
        </button>
      </div>

       {/* Tabs */}
       <div className="flex space-x-2 mb-8 bg-slate-100 p-1 rounded-2xl w-fit">
        {['schedules', 'flights', 'airports'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>{tab}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeTab === 'schedules' && schedules.map((sc) => (
           <div key={sc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-100 text-sky-600 rounded-xl"><Plane className="h-6 w-6"/></div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">${sc.basePrice}</h3>
                   <div className="text-sm text-slate-500 flex items-center gap-2">
                      <Clock className="h-4 w-4"/> {format(new Date(sc.departureTime), 'MMM dd HH:mm')} - {format(new Date(sc.arrivalTime), 'HH:mm')}
                   </div>
                </div>
             </div>
           </div>
        ))}
        {activeTab === 'flights' && flights.map((f) => (
           <div key={f.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
             <div><h3 className="font-bold text-slate-900">{f.flightNumber}</h3><p className="text-sm text-slate-500">{f.airline}</p></div>
             <button onClick={() => handleDelete(f.id, 'flight')} className="text-red-500 bg-red-50 p-2 rounded-lg"><Trash className="h-5 w-5"/></button>
           </div>
        ))}
        {activeTab === 'airports' && airports.map((a) => (
           <div key={a.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-900">{a.code} - {a.name}</h3>
             <p className="text-sm text-slate-500">{a.city}, {a.country}</p>
           </div>
        ))}
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 capitalize">Add New {activeTab.slice(0, -1)}</h2>
            <div className="space-y-4">
               {activeTab === 'flights' && (
                 <>
                   <input placeholder="Flight Number" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, flightNumber: e.target.value})} />
                   <input placeholder="Airline" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, airline: e.target.value})} />
                   <input placeholder="Aircraft Type" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, aircraftType: e.target.value})} />
                   <input type="number" placeholder="Total Seats" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, totalSeats: Number(e.target.value)})} />
                 </>
               )}
               {activeTab === 'airports' && (
                 <>
                   <input placeholder="Code (e.g. JFK)" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, code: e.target.value})} />
                   <input placeholder="Name" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, name: e.target.value})} />
                   <input placeholder="City" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, city: e.target.value})} />
                   <input placeholder="Country" className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, country: e.target.value})} />
                 </>
               )}
               {activeTab === 'schedules' && (
                 <>
                   <select className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, flightId: e.target.value})}>
                      <option value="">Select Flight</option>
                      {flights.map(f => <option key={f.id} value={f.id}>{f.flightNumber}</option>)}
                   </select>
                   <div className="grid grid-cols-2 gap-4">
                     <select className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, originAirportId: e.target.value})}>
                        <option value="">Origin</option>
                        {airports.map(a => <option key={a.id} value={a.id}>{a.code}</option>)}
                     </select>
                     <select className="w-full bg-slate-50 p-3 rounded-xl font-medium" onChange={e => setFormData({...formData, destinationAirportId: e.target.value})}>
                        <option value="">Dest</option>
                        {airports.map(a => <option key={a.id} value={a.id}>{a.code}</option>)}
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
              <button onClick={handleSubmit} className="py-3 font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-lg">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFlightsPage;
