
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
    trailerUrl: "",
    status: "now_showing",
  };

  const [form, setForm] = useState(emptyForm);

  // ========================================
  // GET MOVIE ID
  // ========================================

  const getMovieId = (movie) => {
    return movie?.id || movie?._id || null;
  };

  // ========================================
  // POSTER URL HELPER
  // ========================================

  const getPosterUrl = (poster) => {
    if (!poster) {
      return "";
    }

    if (
      poster.startsWith("http://") ||
      poster.startsWith("https://")
    ) {
      return poster;
    }

    const backendUrl = (
      api.defaults.baseURL || "http://localhost:8080/api"
    ).replace(/\/api\/?$/, "");

    return `${backendUrl}${poster.startsWith("/") ? poster : `/${poster}`}`;
  };

  // ========================================
  // LOAD MOVIES
  // ========================================

  const loadMovies = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/movies");

      const movieList = Array.isArray(response.data)
        ? response.data
        : response.data?.movies ||
          response.data?.data ||
          [];

      setMovies(movieList);
    } catch (err) {
      console.error("LOAD MOVIES ERROR:", err);

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
  // VALIDATE FORM
  // ========================================

  const validateForm = () => {
    if (!form.title.trim()) {
      return "Movie title is required.";
    }

    if (!form.description.trim()) {
      return "Movie description is required.";
    }

    if (!form.language.trim()) {
      return "Movie language is required.";
    }

    if (
      !form.duration ||
      Number(form.duration) <= 0 ||
      !Number.isFinite(Number(form.duration))
    ) {
      return "Please enter a valid movie duration.";
    }

    if (!form.releaseDate.trim()) {
      return "Release date is required.";
    }

    if (!["now_showing", "upcoming"].includes(form.status)) {
      return "Please select a valid movie status.";
    }

    return "";
  };

  // ========================================
  // SUBMIT MOVIE
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      // IMPORTANT:
      // Java Movie.java defines genre as String.
      // Therefore, send genre as a String, not an Array.

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        genre: form.genre.trim(),
        language: form.language.trim(),
        duration: Number(form.duration),
        certificate: form.certificate,
        releaseDate: form.releaseDate.trim(),
        poster: form.poster.trim(),
        trailerUrl: form.trailerUrl.trim(),
        status: form.status,
      };

      if (editingId) {
        await api.put(
          `/movies/${encodeURIComponent(editingId)}`,
          payload
        );

        setSuccess("Movie updated successfully.");
      } else {
        await api.post("/movies", payload);

        setSuccess("Movie added successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadMovies();

    } catch (err) {
      console.error("SAVE MOVIE ERROR:", err);

      const statusCode = err.response?.status;
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error;

      if (statusCode === 400) {
        setError(
          serverMessage ||
            "Invalid movie information. Please check the fields."
        );
      } else if (statusCode === 401) {
        setError(
          "Your session is not authorized. Please check your login."
        );
      } else if (statusCode === 403) {
        setError(
          "Access forbidden. Admin authorization needs to be checked."
        );
      } else if (statusCode === 404) {
        setError(
          "Movie not found. Refresh the movie list and try again."
        );
      } else {
        setError(
          serverMessage ||
            "Failed to save movie. Please check the backend terminal."
        );
      }

    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // EDIT MOVIE
  // ========================================

  const handleEdit = (movie) => {
    const movieId = getMovieId(movie);

    if (!movieId) {
      setError("Movie ID is missing. Cannot edit this movie.");
      return;
    }

    setError("");
    setSuccess("");

    setEditingId(movieId);

    setForm({
      title: movie.title || "",
      description: movie.description || "",

      // Supports both old arrays and new strings.
      genre: Array.isArray(movie.genre)
        ? movie.genre.join(", ")
        : movie.genre || "",

      language: movie.language || "",
      duration: movie.duration ?? "",
      certificate: movie.certificate || "U/A",
      releaseDate: movie.releaseDate || "",
      poster: movie.poster || "",
      trailerUrl: movie.trailerUrl || "",
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
    const movieId = getMovieId(movie);

    if (!movieId) {
      setError("Movie ID is missing. Cannot delete this movie.");
      return;
    }

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
        `/movies/${encodeURIComponent(movieId)}`
      );

      if (editingId === movieId) {
        setEditingId(null);
        setForm(emptyForm);
      }

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
              Add, edit and manage movies available on CineBook.
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
          <div
            className="admin-alert admin-alert-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="admin-alert admin-alert-success"
            role="status"
          >
            {success}
          </div>
        )}

        {/* MOVIE FORM */}

        <section className="admin-movie-form-card">

          <div className="admin-section-title">
            <div>
              <h2>
                {editingId ? "Edit Movie" : "Add New Movie"}
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
                <label htmlFor="movie-title">
                  Movie Title *
                </label>

                <input
                  id="movie-title"
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Midnight Horizon"
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div className="admin-form-field full">
                <label htmlFor="movie-description">
                  Description *
                </label>

                <textarea
                  id="movie-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter movie description"
                  rows="5"
                  required
                />
              </div>

              {/* GENRE */}

              <div className="admin-form-field">
                <label htmlFor="movie-genre">
                  Genre
                </label>

                <input
                  id="movie-genre"
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
                <label htmlFor="movie-language">
                  Language *
                </label>

                <input
                  id="movie-language"
                  type="text"
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  placeholder="English"
                  required
                />
              </div>

              {/* DURATION */}

              <div className="admin-form-field">
                <label htmlFor="movie-duration">
                  Duration *
                </label>

                <input
                  id="movie-duration"
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="145"
                  min="1"
                  required
                />

                <small>
                  Duration in minutes.
                </small>
              </div>

              {/* CERTIFICATE */}

              <div className="admin-form-field">
                <label htmlFor="movie-certificate">
                  Certificate
                </label>

                <select
                  id="movie-certificate"
                  name="certificate"
                  value={form.certificate}
                  onChange={handleChange}
                >
                  <option value="U">U</option>
                  <option value="U/A">U/A</option>
                  <option value="A">A</option>
                  <option value="UA">UA</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                </select>
              </div>

              {/* RELEASE DATE */}

              <div className="admin-form-field">
                <label htmlFor="movie-release-date">
                  Release Date *
                </label>

                <input
                  id="movie-release-date"
                  type="text"
                  name="releaseDate"
                  value={form.releaseDate}
                  onChange={handleChange}
                  placeholder="e.g. Apr 26, 2019"
                  required
                />
              </div>

              {/* STATUS */}

              <div className="admin-form-field">
                <label htmlFor="movie-status">
                  Status
                </label>

                <select
                  id="movie-status"
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
                <label htmlFor="movie-poster">
                  Poster URL
                </label>

                <input
                  id="movie-poster"
                  type="text"
                  name="poster"
                  value={form.poster}
                  onChange={handleChange}
                  placeholder="/posters/movie-name.png"
                />
              </div>

              {/* TRAILER */}

              <div className="admin-form-field full">
                <label htmlFor="movie-trailer">
                  Trailer URL
                </label>

                <input
                  id="movie-trailer"
                  type="text"
                  name="trailerUrl"
                  value={form.trailerUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

            </div>

            {/* FORM BUTTONS */}

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
                  disabled={saving}
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
              <h2>All Movies</h2>

              <p>
                {movies.length} movie
                {movies.length !== 1 ? "s" : ""} in CineBook.
              </p>
            </div>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={loadMovies}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {/* LOADING */}

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
                  {movies.map((movie) => {
                    const movieId = getMovieId(movie);

                    return (
                      <tr key={movieId || movie.title}>

                        {/* MOVIE + POSTER */}

                        <td>
                          <div className="admin-movie-name">

                            {movie.poster ? (
                              <img
                                src={getPosterUrl(movie.poster)}
                                alt={movie.title}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="admin-movie-placeholder">
                                🎬
                              </div>
                            )}

                            <div>
                              <strong>{movie.title}</strong>

                              <span>
                                {movie.certificate || "U/A"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* LANGUAGE */}

                        <td>
                          {movie.language || "-"}
                        </td>

                        {/* GENRE */}

                        <td>
                          {Array.isArray(movie.genre)
                            ? movie.genre.join(", ")
                            : movie.genre || "-"}
                        </td>

                        {/* DURATION */}

                        <td>
                          {movie.duration
                            ? `${movie.duration} min`
                            : "-"}
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`admin-status-badge ${
                              movie.status === "upcoming"
                                ? "upcoming"
                                : "showing"
                            }`}
                          >
                            {movie.status === "upcoming"
                              ? "Upcoming"
                              : "Now Showing"}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td>
                          <div className="admin-action-buttons">

                            <button
                              type="button"
                              className="admin-edit-button"
                              onClick={() => handleEdit(movie)}
                              disabled={!movieId}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="admin-delete-button"
                              onClick={() => handleDelete(movie)}
                              disabled={!movieId}
                            >
                              Delete
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
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