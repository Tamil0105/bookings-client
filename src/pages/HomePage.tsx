import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Film, Bus, Plane, Train, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const HomePage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const services = [
    {
      title: 'Appointments',
      desc: 'Book time slots for doctors, salons, and more.',
      icon: Calendar,
      to: '/calendar',
    },
    {
      title: 'Movies',
      desc: 'Reserve the best seats for latest releases.',
      icon: Film,
      to: '/theater',
    },
    {
      title: 'Bus Travel',
      desc: 'Seamless intercity bus seat reservations.',
      icon: Bus,
      to: '/bus',
    },
    {
      title: 'Flight Booking',
      desc: 'Domestic and international flight schedules.',
      icon: Plane,
      to: '/flight',
    },
    {
      title: 'Train Tickets',
      desc: 'Fast and reliable train seat booking.',
      icon: Train,
      to: '/train',
    },
  ];

  return (
    <div className="space-y-12 pb-20">
      <section className="text-center space-y-4 pt-10">
        <h1 className="text-4xl font-black text-slate-900 sm:text-6xl tracking-tight">
          Welcome back, <span className="text-black underline decoration-4 decoration-black/20">{user?.name}</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Manage all your bookings in one place. Choose a service below to get started.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.title}
            className="group relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 overflow-hidden cursor-pointer hover:-translate-y-1"
            onClick={() => navigate(service.to)}
          >
            <div className="h-1 w-full bg-black" />
            <div className="p-8">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl text-white bg-black mb-6 shadow-lg shadow-black/20">
                <service.icon className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">{service.title}</h3>
              <p className="text-slate-500 mb-8 font-medium">{service.desc}</p>
              <div className="flex items-center text-black font-bold group-hover:translate-x-2 transition-transform">
                Explore <ArrowRight className="h-5 w-5 ml-2" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-black rounded-[2.5rem] p-8 sm:p-16 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-black mb-6">Grow your business with us</h2>
          <p className="text-slate-400 mb-10 text-lg font-medium">
            Are you a service provider? Register your services and start accepting bookings today.
          </p>
          <button className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-slate-200 transition-colors">
            Get Started as Provider
          </button>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 opacity-10">
          <Calendar className="w-96 h-96 text-white" />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
