import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import TheaterPage from './pages/TheaterPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import BusSearchPage from './pages/BusSearchPage';
import BusSeatSelectionPage from './pages/BusSeatSelectionPage';
import FlightSearchPage from './pages/FlightSearchPage';
import FlightSeatSelectionPage from './pages/FlightSeatSelectionPage';
import TrainSearchPage from './pages/TrainSearchPage';
import TrainSeatSelectionPage from './pages/TrainSeatSelectionPage';
import BookingsPage from './pages/BookingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ManageMoviesPage from './pages/admin/ManageMoviesPage';
import ManageBusesPage from './pages/admin/ManageBusesPage';
import ManageFlightsPage from './pages/admin/ManageFlightsPage';
import ManageTrainsPage from './pages/admin/ManageTrainsPage';
import ManageCalendarPage from './pages/admin/ManageCalendarPage';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route
            path="/calendar"
            element={
              <Layout>
                <CalendarPage />
              </Layout>
            }
          />
          <Route
            path="/theater"
            element={
              <Layout>
                <TheaterPage />
              </Layout>
            }
          />
          <Route
            path="/theater/shows/:showId/seats"
            element={
              <Layout>
                <SeatSelectionPage />
              </Layout>
            }
          />
          <Route
            path="/bus"
            element={
              <Layout>
                <BusSearchPage />
              </Layout>
            }
          />
          <Route
            path="/bus/trips/:tripId/seats"
            element={
              <Layout>
                <BusSeatSelectionPage />
              </Layout>
            }
          />
          <Route
            path="/flight"
            element={
              <Layout>
                <FlightSearchPage />
              </Layout>
            }
          />
          <Route
            path="/flight/schedules/:scheduleId/seats"
            element={
              <Layout>
                <FlightSeatSelectionPage />
              </Layout>
            }
          />
          <Route
            path="/train"
            element={
              <Layout>
                <TrainSearchPage />
              </Layout>
            }
          />
          <Route
            path="/train/trips/:tripId/seats"
            element={
              <Layout>
                <TrainSeatSelectionPage />
              </Layout>
            }
          />
          <Route
            path="/bookings"
            element={
              <Layout>
                <BookingsPage />
              </Layout>
            }
          />
          <Route
            path="/admin"
            element={
              <Layout>
                <AdminDashboardPage />
              </Layout>
            }
          />
          <Route
            path="/admin/movies"
            element={
              <Layout>
                <ManageMoviesPage />
              </Layout>
            }
          />
          <Route
            path="/admin/buses"
            element={
              <Layout>
                <ManageBusesPage />
              </Layout>
            }
          />
          <Route
            path="/admin/flights"
            element={
              <Layout>
                <ManageFlightsPage />
              </Layout>
            }
          />
          <Route
            path="/admin/trains"
            element={
              <Layout>
                <ManageTrainsPage />
              </Layout>
            }
          />
          <Route
            path="/admin/calendar"
            element={
              <Layout>
                <ManageCalendarPage />
              </Layout>
            }
          />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
