import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { BookingStatus } from '../store/bookingStore';
import api from '../services/api';
import { Users, CreditCard, Calendar, Activity, Search, Film, Bus, Plane, Train } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/bookings');
        setAllBookings(response.data);
      } catch (error) {
        console.error('Failed to fetch admin data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = allBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const activeBookings = allBookings.filter(b => b.status === BookingStatus.CONFIRMED).length;

  const filteredBookings = allBookings.filter(b => 
    b.id.includes(searchTerm) || 
    b.userId.includes(searchTerm) ||
    b.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-slate-500">Welcome back, {user?.name}. Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-black rounded-2xl text-white">
              <CreditCard className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-black bg-gray-100 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-black text-slate-900 mt-1">${totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-black rounded-2xl text-white">
              <Calendar className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-black bg-gray-100 px-2 py-1 rounded-full">Active</span>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Bookings</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{activeBookings}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-black rounded-2xl text-white">
              <Users className="h-6 w-6" />
            </div>
             <span className="text-xs font-bold text-black bg-gray-100 px-2 py-1 rounded-full">New</span>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Users</p>
          <p className="text-3xl font-black text-slate-900 mt-1">1,234</p> {/* Mock data */}
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-black rounded-2xl text-white">
              <Activity className="h-6 w-6" />
            </div>
             <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">Avg</span>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Avg. Order</p>
          <p className="text-3xl font-black text-slate-900 mt-1">${(totalRevenue / (allBookings.length || 1)).toFixed(0)}</p>
        </div>
      </div>

      {/* Management Sections */}
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Manage Resources</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
         {[
           { title: 'Movies', icon: Film, to: '/admin/movies', color: 'bg-indigo-500' },
           { title: 'Buses', icon: Bus, to: '/admin/buses', color: 'bg-emerald-500' },
           { title: 'Flights', icon: Plane, to: '/admin/flights', color: 'bg-sky-500' },
           { title: 'Trains', icon: Train, to: '/admin/trains', color: 'bg-rose-500' },
           { title: 'Slots', icon: Calendar, to: '/admin/calendar', color: 'bg-orange-500' },
         ].map((item) => (
           <div 
             key={item.title}
             onClick={() => window.location.href = item.to}
             className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all hover:-translate-y-1 group"
           >
             <div className={`p-4 rounded-2xl text-white ${item.color} mb-4 w-fit shadow-lg opacity-90 group-hover:opacity-100`}>
               <item.icon className="h-6 w-6" />
             </div>
             <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
             <p className="text-sm text-slate-400 font-medium">Manage {item.title}</p>
           </div>
         ))}
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900">Recent Bookings</h2>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search bookings..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-black w-full md:w-80"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-8 py-6">Booking ID</th>
                <th className="px-8 py-6">User</th>
                <th className="px-8 py-6">Type</th>
                <th className="px-8 py-6">Date</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10">Loading...</td></tr>
              ) : filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6 font-mono text-sm text-slate-600">#{booking.id.slice(-6)}</td>
                  <td className="px-8 py-6 font-bold text-slate-900">{booking.userId.slice(-6)}...</td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                      {booking.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-500">{format(new Date(booking.createdAt), 'MMM dd, HH:mm')}</td>
                  <td className="px-8 py-6">
                     <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                       booking.status === 'CONFIRMED' ? 'bg-black text-white' : 
                       booking.status === 'PENDING' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-400'
                     }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-slate-900">${booking.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
