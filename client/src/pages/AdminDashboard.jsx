import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("cinebookToken");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await api.get("/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(response.data.stats);
      } catch (err) {
        console.error("ADMIN DASHBOARD ERROR:", err);

        if (err.response?.status === 401) {
          setError("Please login to access the admin dashboard.");
        } else if (err.response?.status === 403) {
          setError("You do not have administrator access.");
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load the admin dashboard."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <p className="section-label">CINEBOOK ADMIN</p>
          <h1>Loading Dashboard...</h1>
          <p>Preparing your administration panel.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <p className="section-label">CINEBOOK ADMIN</p>
          <h1>Dashboard Unavailable</h1>
          <p>{error}</p>

          <div className="admin-error-actions">
            <Link to="/login" className="continue-button">
              Login
            </Link>

            <Link to="/" className="secondary-button">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: "Users",
      value: stats?.totalUsers ?? 0,
      icon: "👤",
    },
    {
      title: "Movies",
      value: stats?.totalMovies ?? 0,
      icon: "🎬",
    },
    {
      title: "Theatres",
      value: stats?.totalTheatres ?? 0,
      icon: "🏢",
    },
    {
      title: "Screens",
      value: stats?.totalScreens ?? 0,
      icon: "🖥️",
    },
    {
      title: "Shows",
      value: stats?.totalShows ?? 0,
      icon: "🕐",
    },
    {
      title: "Bookings",
      value: stats?.totalBookings ?? 0,
      icon: "🎟️",
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-container">

        {/* HEADER */}
        <div className="admin-header">
          <div>
            <p className="section-label">CINEBOOK ADMIN</p>
            <h1>Admin Dashboard</h1>
            <p>
              Manage movies, theatres, shows and CineBook bookings.
            </p>
          </div>

          <Link to="/" className="secondary-button">
            View Website
          </Link>
        </div>

        {/* STATISTICS */}
        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <p className="section-label">OVERVIEW</p>
              <h2>Platform Statistics</h2>
            </div>
          </div>

          <div className="admin-stats-grid">
            {dashboardCards.map((card) => (
              <div className="admin-stat-card" key={card.title}>
                <div className="admin-stat-top">
                  <span className="admin-stat-icon">
                    {card.icon}
                  </span>

                  <span className="admin-stat-title">
                    {card.title}
                  </span>
                </div>

                <strong>{card.value}</strong>
              </div>
            ))}
          </div>
        </section>

        {/* REVENUE */}
        <section className="admin-section">
          <div className="admin-revenue-card">
            <div>
              <p className="section-label">REVENUE</p>
              <h2>Total Successful Payments</h2>
              <p>
                Revenue calculated from successful CineBook
                payments.
              </p>
            </div>

            <strong className="admin-revenue">
              ₹{stats?.totalRevenue ?? 0}
            </strong>
          </div>
        </section>

        {/* MANAGEMENT */}
        <section className="admin-section">
          <div className="admin-section-heading">
            <div>
              <p className="section-label">MANAGEMENT</p>
              <h2>Manage CineBook</h2>
            </div>
          </div>

          <div className="admin-management-grid">

            <Link
              to="/admin/movies"
              className="admin-management-card"
            >
              <span>🎬</span>
              <div>
                <h3>Movies</h3>
                <p>
                  Add, edit and remove movies.
                </p>
              </div>
            </Link>

            <Link
              to="/admin/theatres"
              className="admin-management-card"
            >
              <span>🏢</span>
              <div>
                <h3>Theatres</h3>
                <p>
                  Manage theatres and locations.
                </p>
              </div>
            </Link>

            <Link
              to="/admin/screens"
              className="admin-management-card"
            >
              <span>🖥️</span>
              <div>
                <h3>Screens</h3>
                <p>
                  Manage screens and seating.
                </p>
              </div>
            </Link>

            <Link
              to="/admin/shows"
              className="admin-management-card"
            >
              <span>🕐</span>
              <div>
                <h3>Shows</h3>
                <p>
                  Manage dates, times and pricing.
                </p>
              </div>
            </Link>

            <Link
              to="/admin/bookings"
              className="admin-management-card"
            >
              <span>🎟️</span>
              <div>
                <h3>Bookings</h3>
                <p>
                  View customer bookings.
                </p>
              </div>
            </Link>

          </div>
        </section>

      </div>
    </div>
  );
}

export default AdminDashboard;