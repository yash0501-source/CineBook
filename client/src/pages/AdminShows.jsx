
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./AdminShows.css";

const initialForm = {
  movie: "",
  screen: "",
  date: "",
  time: "",
  standardPrice: 180,
  premiumPrice: 250,
  reclinerPrice: 350,
  status: "active",
};

function getArray(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  return [];
}

function getId(value) {
  if (value && typeof value === "object") {
    return String(value.id || value._id || "");
  }
  return String(value || "");
}

function AdminShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [screens, setScreens] = useState([]);
  const [theatres, setTheatres] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(initialForm);

  // LOAD ALL DATA
  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        api.get("/shows"),
        api.get("/movies"),
        api.get("/screens"),
        api.get("/theatres"),
      ]);

      const [showResult, movieResult, screenResult, theatreResult] =
        results;

      if (showResult.status === "fulfilled") {
        setShows(getArray(showResult.value.data, "shows"));
      } else {
        console.error("SHOWS API ERROR:", showResult.reason);
        setShows([]);
        setError("Could not load shows. Please check the Shows API.");
      }

      if (movieResult.status === "fulfilled") {
        setMovies(getArray(movieResult.value.data, "movies"));
      } else {
        console.error("MOVIES API ERROR:", movieResult.reason);
        setMovies([]);
      }

      if (screenResult.status === "fulfilled") {
        setScreens(getArray(screenResult.value.data, "screens"));
      } else {
        console.error("SCREENS API ERROR:", screenResult.reason);
        setScreens([]);
      }

      if (theatreResult.status === "fulfilled") {
        setTheatres(getArray(theatreResult.value.data, "theatres"));
      } else {
        console.error("THEATRES API ERROR:", theatreResult.reason);
        setTheatres([]);
      }

      if (
        movieResult.status === "rejected" ||
        screenResult.status === "rejected" ||
        theatreResult.status === "rejected"
      ) {
        setError(
          "Some supporting data could not be loaded. Check the browser console."
        );
      }
    } catch (err) {
      console.error("ADMIN SHOW LOAD ERROR:", err);
      setError("Failed to load show management data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // LOOKUP MAPS
  const movieMap = useMemo(
    () => new Map(movies.map((movie) => [getId(movie), movie])),
    [movies]
  );

  const theatreMap = useMemo(
    () => new Map(theatres.map((theatre) => [getId(theatre), theatre])),
    [theatres]
  );

  const screenMap = useMemo(
    () => new Map(screens.map((screen) => [getId(screen), screen])),
    [screens]
  );

  // ENRICH SHOWS WITH MOVIE, SCREEN AND THEATRE DETAILS
  const displayShows = useMemo(() => {
    return shows.map((show) => {
      const movieId = getId(show.movie);
      const screenId = getId(show.screen);
      const screen = screenMap.get(screenId);

      const theatreId =
        getId(show.theatre) || getId(screen?.theatre);

      return {
        ...show,
        id: getId(show),
        movieDetails: movieMap.get(movieId),
        screenDetails: screen,
        theatreDetails: theatreMap.get(theatreId),
      };
    });
  }, [shows, movieMap, screenMap, theatreMap]);

  const selectedScreen = screens.find(
    (screen) => getId(screen) === form.screen
  );

  // FORM CHANGE
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // RESET FORM
  const resetForm = () => {
    setForm({ ...initialForm });
    setEditingId(null);
    setError("");
  };

  // CREATE / UPDATE SHOW
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.movie || !form.screen || !form.date || !form.time) {
      setError("Please complete all show details.");
      return;
    }

    const standard = Number(form.standardPrice);
    const premium = Number(form.premiumPrice);
    const recliner = Number(form.reclinerPrice);

    if (
      !Number.isFinite(standard) ||
      !Number.isFinite(premium) ||
      !Number.isFinite(recliner) ||
      standard < 0 ||
      premium < 0 ||
      recliner < 0
    ) {
      setError("Please enter valid ticket prices.");
      return;
    }

    const payload = {
      movie: form.movie,
      screen: form.screen,
      date: form.date,
      time: form.time.trim(),
      seatPrices: {
        standard,
        premium,
        recliner,
      },
      status: form.status,
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/shows/${editingId}`, payload);
        setSuccess("Show updated successfully.");
      } else {
        await api.post("/shows", payload);
        setSuccess("Show created successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error(
        "SAVE SHOW ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to save show. Check the backend terminal."
      );
    } finally {
      setSaving(false);
    }
  };

  // EDIT SHOW
  const handleEdit = (show) => {
    setError("");
    setSuccess("");

    setEditingId(getId(show));

    setForm({
      movie: getId(show.movie),
      screen: getId(show.screen),
      date: show.date ? String(show.date).substring(0, 10) : "",
      time: show.time || "",
      standardPrice: show.seatPrices?.standard ?? 180,
      premiumPrice: show.seatPrices?.premium ?? 250,
      reclinerPrice: show.seatPrices?.recliner ?? 350,
      status: show.status || "active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // DELETE SHOW
  const handleDelete = async (showId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this show?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/shows/${showId}`);

      setSuccess("Show deleted successfully.");

      if (editingId === showId) {
        resetForm();
      }

      await loadData();
    } catch (err) {
      console.error(
        "DELETE SHOW ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Failed to delete show."
      );
    }
  };

  // SEARCH
  const filteredShows = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return displayShows;

    return displayShows.filter((show) => {
      const searchable = [
        show.movieDetails?.title,
        show.theatreDetails?.name,
        show.screenDetails?.name,
        show.date,
        show.time,
        show.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(search);
    });
  }, [displayShows, searchTerm]);

  // DATE FORMAT
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(`${String(date).substring(0, 10)}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date).substring(0, 10);
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="admin-shows-page">
      <div className="admin-shows-container">

        {/* HEADER */}
        <div className="admin-shows-header">
          <div>
            <Link to="/admin" className="admin-back-link">
              ← Back to Dashboard
            </Link>

            <h1>Show Management</h1>

            <p>
              Create, update and manage movie showtimes.
            </p>
          </div>

          <div className="admin-shows-count">
            <strong>{shows.length}</strong>
            <span>Total Shows</span>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="admin-success">
            {success}
          </div>
        )}

        {/* FORM */}
        <div className="admin-show-form-card">
          <div className="admin-section-heading">
            <h2>
              {editingId ? "Edit Show" : "Create New Show"}
            </h2>

            <p>
              Select a movie, screen, date, time and ticket prices.
            </p>
          </div>

          <form
            className="admin-show-form"
            onSubmit={handleSubmit}
          >
            {/* MOVIE */}
            <div className="admin-form-group">
              <label>Movie</label>

              <select
                name="movie"
                value={form.movie}
                onChange={handleChange}
                required
              >
                <option value="">Select Movie</option>

                {movies.map((movie) => (
                  <option key={getId(movie)} value={getId(movie)}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </div>

            {/* SCREEN */}
            <div className="admin-form-group">
              <label>Screen</label>

              <select
                name="screen"
                value={form.screen}
                onChange={handleChange}
                required
              >
                <option value="">Select Screen</option>

                {screens.map((screen) => {
                  const theatre = theatreMap.get(
                    getId(screen.theatre)
                  );

                  return (
                    <option
                      key={getId(screen)}
                      value={getId(screen)}
                    >
                      {screen.name} — {theatre?.name || "Unknown Theatre"}
                    </option>
                  );
                })}
              </select>

              {selectedScreen && (
                <small>
                  {selectedScreen.screenType || "Standard"} •{" "}
                  {selectedScreen.totalSeats || 0} seats
                </small>
              )}
            </div>

            {/* DATE */}
            <div className="admin-form-group">
              <label>Show Date</label>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            {/* TIME */}
            <div className="admin-form-group">
              <label>Show Time</label>

              <input
                type="text"
                name="time"
                value={form.time}
                onChange={handleChange}
                placeholder="Example: 10:30 AM"
                required
              />
            </div>

            {/* STANDARD */}
            <div className="admin-form-group">
              <label>Standard Price (₹)</label>

              <input
                type="number"
                min="0"
                name="standardPrice"
                value={form.standardPrice}
                onChange={handleChange}
                required
              />
            </div>

            {/* PREMIUM */}
            <div className="admin-form-group">
              <label>Premium Price (₹)</label>

              <input
                type="number"
                min="0"
                name="premiumPrice"
                value={form.premiumPrice}
                onChange={handleChange}
                required
              />
            </div>

            {/* RECLINER */}
            <div className="admin-form-group">
              <label>Recliner Price (₹)</label>

              <input
                type="number"
                min="0"
                name="reclinerPrice"
                value={form.reclinerPrice}
                onChange={handleChange}
                required
              />
            </div>

            {/* STATUS */}
            <div className="admin-form-group">
              <label>Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* BUTTONS */}
            <div className="admin-show-form-footer">
              <button
                type="submit"
                className="admin-primary-button"
                disabled={
                  saving ||
                  movies.length === 0 ||
                  screens.length === 0
                }
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Show"
                  : "Create Show"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={resetForm}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* SHOW LIST */}
        <div className="admin-show-list-card">
          <div className="admin-show-list-header">
            <div>
              <h2>All Shows</h2>

              <p>
                {searchTerm
                  ? `${filteredShows.length} results found`
                  : `${shows.length} shows`}
              </p>
            </div>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>

          {/* SEARCH */}
          <div className="admin-show-search">
            <span className="admin-show-search-icon">
              🔍
            </span>

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search movie, theatre, screen, date, time or status..."
            />

            {searchTerm && (
              <button
                type="button"
                className="admin-show-search-clear"
                onClick={() => setSearchTerm("")}
              >
                ×
              </button>
            )}
          </div>

          {/* LOADING */}
          {loading && (
            <div className="admin-loading">
              Loading shows...
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && filteredShows.length === 0 && (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">🔍</div>

              <h3>
                {searchTerm
                  ? "No shows found"
                  : "No shows available"}
              </h3>

              <p>
                {searchTerm
                  ? "Try another search term."
                  : "No shows were returned by the server."}
              </p>

              {searchTerm && (
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* SHOW TABLE */}
          {!loading && filteredShows.length > 0 && (
            <div className="admin-show-table-wrapper">
              <table className="admin-show-table">
                <thead>
                  <tr>
                    <th>Movie</th>
                    <th>Theatre</th>
                    <th>Screen</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Prices</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredShows.map((show) => (
                    <tr key={show.id}>
                      <td>
                        <strong>
                          {show.movieDetails?.title || "Unknown Movie"}
                        </strong>
                      </td>

                      <td>
                        {show.theatreDetails?.name || "Unknown Theatre"}
                      </td>

                      <td>
                        {show.screenDetails?.name || "Unknown Screen"}
                      </td>

                      <td>{formatDate(show.date)}</td>

                      <td>
                        <span className="admin-show-time">
                          {show.time || "—"}
                        </span>
                      </td>

                      <td>
                        <div className="admin-show-prices">
                          <span>
                            Standard ₹{show.seatPrices?.standard ?? "—"}
                          </span>
                          <span>
                            Premium ₹{show.seatPrices?.premium ?? "—"}
                          </span>
                          <span>
                            Recliner ₹{show.seatPrices?.recliner ?? "—"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`show-status ${
                            (show.status || "active") === "active"
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          <span className="show-status-dot" />
                          {show.status || "active"}
                        </span>
                      </td>

                      <td>
                        <div className="admin-show-actions">
                          <button
                            type="button"
                            className="admin-edit-button"
                            onClick={() => handleEdit(show)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="admin-delete-button"
                            onClick={() => handleDelete(show.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminShows;