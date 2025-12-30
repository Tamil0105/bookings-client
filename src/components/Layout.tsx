import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, User, Calendar, Film, Bus, Plane, Train, Home } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/calendar', icon: Calendar, label: 'Appointments' },
    { to: '/theater', icon: Film, label: 'Movies' },
    { to: '/bus', icon: Bus, label: 'Bus' },
    { to: '/flight', icon: Plane, label: 'Flights' },
    { to: '/train', icon: Train, label: 'Trains' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <NavLink to="/" className="flex-shrink-0 flex items-center">
                <div className="bg-indigo-600 p-1.5 rounded-lg mr-2">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">MultiBook</span>
              </NavLink>
              <div className="hidden md:ml-8 md:flex md:space-x-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                    <User className="h-4 w-4 mr-2" />
                    <span>{user.name}</span>
                    <span className="ml-2 text-xs text-indigo-600 font-semibold px-2 py-0.5 bg-indigo-50 rounded-full border border-indigo-100">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <NavLink
                    to="/login"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Sign Up
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} MultiBook Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
