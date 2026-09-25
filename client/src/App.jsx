import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

/* Public Pages */
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";

import TheatreSelection from "./pages/TheatreSelection";
import SeatSelection from "./pages/SeatSelection";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

/* Customer Pages */
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import MyBookings from "./pages/MyBookings";
import DigitalTicket from "./pages/DigitalTicket";
import Profile from "./pages/Profile";

/* Components */
import Navbar from "./components/Navbar";
import ProtectedRoute from "./ProtectedRoute";

/* Admin Pages */
import AdminDashboard from "./pages/AdminDashboard";
import AdminMovies from "./pages/AdminMovies";
import AdminTheatres from "./pages/AdminTheatres";
import AdminScreens from "./pages/AdminScreens";
import AdminShows from "./pages/AdminShows";
import AdminBookings from "./pages/AdminBookings";

function App() {
  return (
    <BrowserRouter>
      {/* Main Navigation */}
      <Navbar />

      <Routes>

        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/movies"
          element={<Movies />}
        />

        <Route
          path="/movies/:id"
          element={<MovieDetails />}
        />

        <Route
          path="/movies/:movieId/theatres"
          element={<TheatreSelection />}
        />

        <Route
          path="/movies/:movieId/seats"
          element={<SeatSelection />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* =====================================================
            CUSTOMER PROTECTED ROUTES
        ===================================================== */}

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/confirmation"
          element={
            <ProtectedRoute>
              <Confirmation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/my"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ticket/:bookingId"
          element={
            <ProtectedRoute>
              <DigitalTicket />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ticket"
          element={
            <ProtectedRoute>
              <DigitalTicket />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            ADMIN PROTECTED ROUTES
        ===================================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/movies"
          element={
            <ProtectedRoute adminOnly>
              <AdminMovies />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/theatres"
          element={
            <ProtectedRoute adminOnly>
              <AdminTheatres />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/screens"
          element={
            <ProtectedRoute adminOnly>
              <AdminScreens />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/shows"
          element={
            <ProtectedRoute adminOnly>
              <AdminShows />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute adminOnly>
              <AdminBookings />
            </ProtectedRoute>
          }
        />


        {/* =====================================================
            FALLBACK ROUTE
        ===================================================== */}

        <Route
          path="*"
          element={<Home />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;