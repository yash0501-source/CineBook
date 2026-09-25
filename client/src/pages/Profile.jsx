import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadProfile =
      async () => {
        try {
          const token =
            localStorage.getItem(
              "cinebookToken"
            );

          if (!token) {
            setError(
              "Please login to view your profile."
            );
            setLoading(false);
            return;
          }

          const response =
            await api.get(
              "/auth/profile"
            );

          if (
            response.data?.user
          ) {
            setUser(
              response.data.user
            );
          } else {
            setError(
              "Unable to load your profile."
            );
          }
        } catch (err) {
          console.error(
            "PROFILE ERROR:",
            err
          );

          if (
            err.response?.status ===
            401
          ) {
            setError(
              "Please login to view your profile."
            );
          } else {
            setError(
              err.response?.data
                ?.message ||
                "Unable to load your profile."
            );
          }
        } finally {
          setLoading(false);
        }
      };

    loadProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem(
      "cinebookToken"
    );

    localStorage.removeItem(
      "cinebookUser"
    );

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <div className="profile-icon">
            👤
          </div>

          <h1>
            Profile Unavailable
          </h1>

          <p>{error}</p>

          <button
            onClick={() =>
              navigate("/login")
            }
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">

      <section className="profile-header">

        <p className="section-label">
          CINEBOOK
        </p>

        <h1>
          My Profile
        </h1>

        <p>
          Manage your CineBook account.
        </p>

      </section>

      <section className="profile-card">

        <div className="profile-avatar">
          {(
            user?.name ||
            "U"
          )
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="profile-info">

          <div className="profile-field">
            <span>
              Name
            </span>

            <strong>
              {user?.name ||
                "Not available"}
            </strong>
          </div>

          <div className="profile-field">
            <span>
              Email
            </span>

            <strong>
              {user?.email ||
                "Not available"}
            </strong>
          </div>

          <div className="profile-field">
            <span>
              Phone
            </span>

            <strong>
              {user?.phone ||
                "Not available"}
            </strong>
          </div>

          <div className="profile-field">
            <span>
              Account Type
            </span>

            <strong>
              {user?.role === "admin"
                ? "Administrator"
                : "Customer"}
            </strong>
          </div>

        </div>

        <div className="profile-actions">

          <button
            onClick={() =>
              navigate("/bookings")
            }
          >
            My Bookings
          </button>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </section>

    </div>
  );
}

export default Profile;