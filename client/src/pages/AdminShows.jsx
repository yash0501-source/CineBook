import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./AdminShows.css";

function AdminShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [screens, setScreens] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    movie: "",
    screen: "",
    date: "",
    time: "",
    standardPrice: 150,
    premiumPrice: 200,
    reclinerPrice: 280,
    status: "active",
  });

  // ==========================================
  // LOAD DATA
  // ==========================================

  const loadData = async () => {
    setLoading(true);
    setError("");

    // Load each API independently.
    // This prevents a screen API error from hiding
    // all of your existing shows.
    const results = await Promise.allSettled([
      api.get("/admin/shows"),
      api.get("/admin/movies"),
      api.get("/admin/screens"),
    ]);

    const showsResult = results[0];
    const moviesResult = results[1];
    const screensResult = results[2];

    // ==========================================
    // SHOWS
    // ==========================================

    if (showsResult.status === "fulfilled") {
      const data = showsResult.value.data;

      setShows(
        Array.isArray(data?.shows)
          ? data.shows
          : []
      );
    } else {
      console.error(
        "SHOWS API ERROR:",
        showsResult.reason?.response?.data ||
          showsResult.reason
      );

      setError(
        showsResult.reason?.response?.data?.message ||
          "Failed to load shows."
      );
    }

    // ==========================================
    // MOVIES
    // ==========================================

    if (moviesResult.status === "fulfilled") {
      const data = moviesResult.value.data;

      setMovies(
        Array.isArray(data?.movies)
          ? data.movies
          : []
      );
    } else {
      console.error(
        "MOVIES API ERROR:",
        moviesResult.reason?.response?.data ||
          moviesResult.reason
      );
    }

    // ==========================================
    // SCREENS
    // ==========================================

    if (screensResult.status === "fulfilled") {
      const data = screensResult.value.data;

      setScreens(
        Array.isArray(data?.screens)
          ? data.screens
          : []
      );
    } else {
      console.error(
        "SCREENS API ERROR:",
        screensResult.reason?.response?.data ||
          screensResult.reason
      );

      // Do NOT erase the existing shows.
      // Show a specific message only.
      if (
        showsResult.status === "fulfilled"
      ) {
        setError(
          "Shows loaded successfully, but screens could not be loaded."
        );
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setForm({
      movie: "",
      screen: "",
      date: "",
      time: "",
      standardPrice: 150,
      premiumPrice: 200,
      reclinerPrice: 280,
      status: "active",
    });

    setEditingId(null);
  };

  // ==========================================
  // CREATE / UPDATE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.movie) {
      setError("Please select a movie.");
      return;
    }

    if (!form.screen) {
      setError("Please select a screen.");
      return;
    }

    if (!form.date) {
      setError("Please select a show date.");
      return;
    }

    if (!form.time) {
      setError("Please select a show time.");
      return;
    }

    try {
      setSaving(true);

      const data = {
        movie: form.movie,
        screen: form.screen,
        date: form.date,
        time: form.time,
        standardPrice:
          Number(form.standardPrice) || 150,
        premiumPrice:
          Number(form.premiumPrice) || 200,
        reclinerPrice:
          Number(form.reclinerPrice) || 280,
        status: form.status,
      };

      if (editingId) {
        await api.put(
          `/admin/shows/${editingId}`,
          data
        );

        setSuccess(
          "Show updated successfully."
        );
      } else {
        await api.post(
          "/admin/shows",
          data
        );

        setSuccess(
          "Show created successfully."
        );
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
          "Failed to save show."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (show) => {
    setError("");
    setSuccess("");

    setEditingId(show._id);

    setForm({
      movie:
        typeof show.movie === "object"
          ? show.movie?._id || ""
          : show.movie || "",

      screen:
        typeof show.screen === "object"
          ? show.screen?._id || ""
          : show.screen || "",

      date: show.date
        ? String(show.date).substring(0, 10)
        : "",

      time: show.time || "",

      standardPrice:
        show.seatPrices?.standard ??
        show.standardPrice ??
        150,

      premiumPrice:
        show.seatPrices?.premium ??
        show.premiumPrice ??
        200,

      reclinerPrice:
        show.seatPrices?.recliner ??
        show.reclinerPrice ??
        280,

      status:
        show.status || "active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (showId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this show?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/admin/shows/${showId}`
      );

      setSuccess(
        "Show deleted successfully."
      );

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

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredShows = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return shows;
    }

    return shows.filter((show) => {
      const movieName =
        show.movie?.title || "";

      const theatreName =
        show.theatre?.name || "";

      const screenName =
        show.screen?.name || "";

      const date = show.date
        ? String(show.date).substring(0, 10)
        : "";

      const time = show.time || "";

      const status = show.status || "";

      return (
        movieName
          .toLowerCase()
          .includes(search) ||
        theatreName
          .toLowerCase()
          .includes(search) ||
        screenName
          .toLowerCase()
          .includes(search) ||
        date
          .toLowerCase()
          .includes(search) ||
        time
          .toLowerCase()
          .includes(search) ||
        status
          .toLowerCase()
          .includes(search)
      );
    });
  }, [shows, searchTerm]);

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return String(date).substring(0, 10);
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // SELECTED SCREEN
  // ==========================================

  const selectedScreen = screens.find(
    (screen) =>
      screen._id === form.screen
  );

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="admin-shows-page">

      <div className="admin-shows-container">

        {/* HEADER */}

        <div className="admin-shows-header">

          <div>

            <Link
              to="/admin"
              className="admin-back-link"
            >
              ← Back to Dashboard
            </Link>

            <h1>
              Show Management
            </h1>

            <p>
              Create, update and manage movie
              showtimes.
            </p>

          </div>

          <div className="admin-shows-count">

            <strong>
              {shows.length}
            </strong>

            <span>
              Total Shows
            </span>

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
              {editingId
                ? "Edit Show"
                : "Create New Show"}
            </h2>

            <p>
              Select a movie, screen, date,
              time and ticket prices.
            </p>

          </div>

          <form
            className="admin-show-form"
            onSubmit={handleSubmit}
          >

            {/* MOVIE */}

            <div className="admin-form-group">

              <label>
                Movie
              </label>

              <select
                name="movie"
                value={form.movie}
                onChange={handleChange}
              >

                <option value="">
                  Select Movie
                </option>

                {movies.map((movie) => (
                  <option
                    key={movie._id}
                    value={movie._id}
                  >
                    {movie.title}
                  </option>
                ))}

              </select>

            </div>

            {/* SCREEN */}

            <div className="admin-form-group">

              <label>
                Screen
              </label>

              <select
                name="screen"
                value={form.screen}
                onChange={handleChange}
              >

                <option value="">
                  Select Screen
                </option>

                {screens.map((screen) => (
                  <option
                    key={screen._id}
                    value={screen._id}
                  >
                    {screen.name}
                    {screen.theatre?.name
                      ? ` — ${screen.theatre.name}`
                      : ""}
                  </option>
                ))}

              </select>

              {screens.length === 0 && (
                <small>
                  Screens could not be loaded.
                  Existing shows are still
                  available below.
                </small>
              )}

              {selectedScreen && (
                <small>
                  {selectedScreen.screenType ||
                    "Standard"}{" "}
                  •{" "}
                  {selectedScreen.totalSeats ||
                    0} seats
                </small>
              )}

            </div>

            {/* DATE */}

            <div className="admin-form-group">

              <label>
                Show Date
              </label>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />

            </div>

            {/* TIME */}

            <div className="admin-form-group">

              <label>
                Show Time
              </label>

              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
              />

            </div>

            {/* STANDARD */}

            <div className="admin-form-group">

              <label>
                Standard Price
              </label>

              <input
                type="number"
                min="0"
                name="standardPrice"
                value={form.standardPrice}
                onChange={handleChange}
              />

            </div>

            {/* PREMIUM */}

            <div className="admin-form-group">

              <label>
                Premium Price
              </label>

              <input
                type="number"
                min="0"
                name="premiumPrice"
                value={form.premiumPrice}
                onChange={handleChange}
              />

            </div>

            {/* RECLINER */}

            <div className="admin-form-group">

              <label>
                Recliner Price
              </label>

              <input
                type="number"
                min="0"
                name="reclinerPrice"
                value={form.reclinerPrice}
                onChange={handleChange}
              />

            </div>

            {/* STATUS */}

            <div className="admin-form-group">

              <label>
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

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

              <h2>
                All Shows
              </h2>

              <p>
                {searchTerm
                  ? `${filteredShows.length} result${
                      filteredShows.length !== 1
                        ? "s"
                        : ""
                    } found`
                  : `${shows.length} shows`}
              </p>

            </div>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={loadData}
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : "↻ Refresh"}
            </button>

          </div>

          {/* SEARCH BAR */}

          <div className="admin-show-search">

            <span className="admin-show-search-icon">
              🔍
            </span>

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search movie, theatre, screen, date, time or status..."
            />

            {searchTerm && (
              <button
                type="button"
                className="admin-show-search-clear"
                onClick={() =>
                  setSearchTerm("")
                }
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

          {/* NO RESULTS */}

          {!loading &&
            filteredShows.length === 0 && (
              <div className="admin-empty-state">

                <div className="admin-empty-icon">
                  🔍
                </div>

                {searchTerm ? (
                  <>
                    <h3>
                      No shows found
                    </h3>

                    <p>
                      No shows match "
                      {searchTerm}"
                    </p>

                    <button
                      type="button"
                      className="admin-secondary-button"
                      onClick={() =>
                        setSearchTerm("")
                      }
                    >
                      Clear Search
                    </button>
                  </>
                ) : (
                  <>
                    <h3>
                      No shows available
                    </h3>

                    <p>
                      No shows were returned
                      by the server.
                    </p>
                  </>
                )}

              </div>
            )}

          {/* SHOW TABLE */}

          {!loading &&
            filteredShows.length > 0 && (
              <div className="admin-show-table-wrapper">

                <table className="admin-show-table">

                  <thead>

                    <tr>

                      <th>
                        Movie
                      </th>

                      <th>
                        Theatre
                      </th>

                      <th>
                        Screen
                      </th>

                      <th>
                        Date
                      </th>

                      <th>
                        Time
                      </th>

                      <th>
                        Prices
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredShows.map(
                      (show) => (
                        <tr
                          key={show._id}
                        >

                          <td>
                            <strong>
                              {show.movie?.title ||
                                "Unknown Movie"}
                            </strong>
                          </td>

                          <td>
                            {show.theatre?.name ||
                              "Unknown Theatre"}
                          </td>

                          <td>
                            {show.screen?.name ||
                              "Unknown Screen"}
                          </td>

                          <td>
                            {formatDate(
                              show.date
                            )}
                          </td>

                          <td>

                            <span className="admin-show-time">
                              {show.time ||
                                "—"}
                            </span>

                          </td>

                          <td>

                            <div className="admin-show-prices">

                              <span>
                                Standard ₹
                                {show.seatPrices
                                  ?.standard ??
                                  0}
                              </span>

                              <span>
                                Premium ₹
                                {show.seatPrices
                                  ?.premium ??
                                  0}
                              </span>

                              <span>
                                Recliner ₹
                                {show.seatPrices
                                  ?.recliner ??
                                  0}
                              </span>

                            </div>

                          </td>

                          <td>

                            <span
                              className={`show-status ${
                                show.status ===
                                "active"
                                  ? "active"
                                  : "inactive"
                              }`}
                            >

                              <span className="show-status-dot" />

                              {show.status ||
                                "active"}

                            </span>

                          </td>

                          <td>

                            <div className="admin-show-actions">

                              <button
                                type="button"
                                className="admin-edit-button"
                                onClick={() =>
                                  handleEdit(
                                    show
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="admin-delete-button"
                                onClick={() =>
                                  handleDelete(
                                    show._id
                                  )
                                }
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )}

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