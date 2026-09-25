import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    title: "",
    description: "",
    genre: "",
    language: "",
    duration: "",
    certificate: "U/A",
    releaseDate: "",
    poster: "",
    backdrop: "",
    status: "now_showing",
  };

  const [form, setForm] = useState(emptyForm);

  const getToken = () => {
    return localStorage.getItem("cinebookToken");
  };

  const authConfig = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  // ========================================
  // LOAD MOVIES
  // ========================================

  const loadMovies = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/movies",
        authConfig()
      );

      setMovies(response.data.movies || []);
    } catch (err) {
      console.error("LOAD ADMIN MOVIES ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load movies."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  // ========================================
  // FORM CHANGE
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ========================================
  // SUBMIT MOVIE
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.title ||
      !form.description ||
      !form.language ||
      !form.duration ||
      !form.releaseDate
    ) {
      setError(
        "Please fill all required movie fields."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        duration: Number(form.duration),
        genre: form.genre
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (editingId) {
        await api.put(
          `/admin/movies/${editingId}`,
          payload,
          authConfig()
        );

        setSuccess("Movie updated successfully.");
      } else {
        await api.post(
          "/admin/movies",
          payload,
          authConfig()
        );

        setSuccess("Movie added successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadMovies();
    } catch (err) {
      console.error("SAVE MOVIE ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save movie."
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // EDIT MOVIE
  // ========================================

  const handleEdit = (movie) => {
    setError("");
    setSuccess("");

    setEditingId(movie._id);

    setForm({
      title: movie.title || "",
      description: movie.description || "",
      genre: Array.isArray(movie.genre)
        ? movie.genre.join(", ")
        : "",
      language: movie.language || "",
      duration: movie.duration || "",
      certificate: movie.certificate || "U/A",
      releaseDate: movie.releaseDate
        ? movie.releaseDate.substring(0, 10)
        : "",
      poster: movie.poster || "",
      backdrop: movie.backdrop || "",
      status: movie.status || "now_showing",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ========================================
  // CANCEL EDIT
  // ========================================

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };

  // ========================================
  // DELETE MOVIE
  // ========================================

  const handleDelete = async (movie) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${movie.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/admin/movies/${movie._id}`,
        authConfig()
      );

      setSuccess("Movie deleted successfully.");

      await loadMovies();
    } catch (err) {
      console.error("DELETE MOVIE ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete movie."
      );
    }
  };

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="admin-movies-page">
      <div className="admin-movies-container">

        {/* HEADER */}

        <div className="admin-movies-header">
          <div>
            <p className="admin-eyebrow">
              CINEBOOK ADMIN
            </p>

            <h1>Movie Management</h1>

            <p>
              Add, edit and manage movies available
              on CineBook.
            </p>
          </div>

          <Link
            to="/admin"
            className="admin-back-button"
          >
            ← Dashboard
          </Link>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="admin-alert admin-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-alert admin-alert-success">
            {success}
          </div>
        )}

        {/* MOVIE FORM */}

        <section className="admin-movie-form-card">

          <div className="admin-section-title">
            <div>
              <h2>
                {editingId
                  ? "Edit Movie"
                  : "Add New Movie"}
              </h2>

              <p>
                Enter the movie information below.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                className="admin-cancel-button"
                onClick={cancelEdit}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            className="admin-movie-form"
            onSubmit={handleSubmit}
          >

            <div className="admin-form-grid">

              {/* TITLE */}

              <div className="admin-form-field full">
                <label>
                  Movie Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Midnight Horizon"
                />
              </div>

              {/* DESCRIPTION */}

              <div className="admin-form-field full">
                <label>
                  Description *
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter movie description"
                  rows="5"
                />
              </div>

              {/* GENRE */}

              <div className="admin-form-field">
                <label>
                  Genre
                </label>

                <input
                  type="text"
                  name="genre"
                  value={form.genre}
                  onChange={handleChange}
                  placeholder="Action, Thriller, Drama"
                />

                <small>
                  Separate multiple genres with commas.
                </small>
              </div>

              {/* LANGUAGE */}

              <div className="admin-form-field">
                <label>
                  Language *
                </label>

                <input
                  type="text"
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  placeholder="English"
                />
              </div>

              {/* DURATION */}

              <div className="admin-form-field">
                <label>
                  Duration *
                </label>

                <input
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="145"
                  min="1"
                />

                <small>
                  Duration in minutes.
                </small>
              </div>

              {/* CERTIFICATE */}

              <div className="admin-form-field">
                <label>
                  Certificate
                </label>

                <select
                  name="certificate"
                  value={form.certificate}
                  onChange={handleChange}
                >
                  <option value="U">
                    U
                  </option>

                  <option value="U/A">
                    U/A
                  </option>

                  <option value="A">
                    A
                  </option>

                  <option value="UA">
                    UA
                  </option>
                </select>
              </div>

              {/* RELEASE DATE */}

              <div className="admin-form-field">
                <label>
                  Release Date *
                </label>

                <input
                  type="date"
                  name="releaseDate"
                  value={form.releaseDate}
                  onChange={handleChange}
                />
              </div>

              {/* STATUS */}

              <div className="admin-form-field">
                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="now_showing">
                    Now Showing
                  </option>

                  <option value="upcoming">
                    Upcoming
                  </option>
                </select>
              </div>

              {/* POSTER */}

              <div className="admin-form-field full">
                <label>
                  Poster URL
                </label>

                <input
                  type="text"
                  name="poster"
                  value={form.poster}
                  onChange={handleChange}
                  placeholder="https://example.com/poster.jpg"
                />
              </div>

              {/* BACKDROP */}

              <div className="admin-form-field full">
                <label>
                  Backdrop URL
                </label>

                <input
                  type="text"
                  name="backdrop"
                  value={form.backdrop}
                  onChange={handleChange}
                  placeholder="https://example.com/backdrop.jpg"
                />
              </div>

            </div>

            <div className="admin-form-actions">

              <button
                type="submit"
                className="admin-primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Movie"
                  : "Add Movie"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}

            </div>

          </form>
        </section>

        {/* MOVIE LIST */}

        <section className="admin-movie-list-section">

          <div className="admin-section-title">
            <div>
              <h2>
                All Movies
              </h2>

              <p>
                {movies.length} movie
                {movies.length !== 1
                  ? "s"
                  : ""}{" "}
                in CineBook.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="admin-loading">
              Loading movies...
            </div>
          ) : movies.length === 0 ? (
            <div className="admin-empty">
              No movies found.
            </div>
          ) : (
            <div className="admin-movie-table-wrapper">

              <table className="admin-movie-table">

                <thead>
                  <tr>
                    <th>Movie</th>
                    <th>Language</th>
                    <th>Genre</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {movies.map((movie) => (
                    <tr key={movie._id}>

                      <td>
                        <div className="admin-movie-name">

                          {movie.poster ? (
                            <img
                              src={movie.poster}
                              alt={movie.title}
                            />
                          ) : (
                            <div className="admin-movie-placeholder">
                              🎬
                            </div>
                          )}

                          <div>
                            <strong>
                              {movie.title}
                            </strong>

                            <span>
                              {movie.certificate ||
                                "U/A"}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        {movie.language}
                      </td>

                      <td>
                        {Array.isArray(movie.genre)
                          ? movie.genre.join(", ")
                          : "-"}
                      </td>

                      <td>
                        {movie.duration} min
                      </td>

                      <td>
                        <span
                          className={`admin-status-badge ${
                            movie.status ===
                            "upcoming"
                              ? "upcoming"
                              : "showing"
                          }`}
                        >
                          {movie.status ===
                          "upcoming"
                            ? "Upcoming"
                            : "Now Showing"}
                        </span>
                      </td>

                      <td>
                        <div className="admin-action-buttons">

                          <button
                            type="button"
                            className="admin-edit-button"
                            onClick={() =>
                              handleEdit(movie)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="admin-delete-button"
                            onClick={() =>
                              handleDelete(movie)
                            }
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

        </section>

      </div>
    </div>
  );
}

export default AdminMovies;