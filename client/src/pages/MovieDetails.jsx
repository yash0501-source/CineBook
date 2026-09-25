import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function MovieDetails() {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // BACKEND URL
  // =====================================================

  const API_BASE =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

  const SERVER_URL =
    API_BASE.replace(/\/api\/?$/, "");

  // =====================================================
  // CONVERT POSTER PATH INTO WORKING URL
  // =====================================================

  const getPosterUrl = (poster) => {
    if (!poster) {
      return "";
    }

    const posterString =
      String(poster).trim();

    // Already a complete URL
    if (
      posterString.startsWith("http://") ||
      posterString.startsWith("https://")
    ) {
      return posterString;
    }

    // Backend-relative path
    if (
      posterString.startsWith("/")
    ) {
      return `${SERVER_URL}${posterString}`;
    }

    // Relative path without /
    return `${SERVER_URL}/${posterString}`;
  };

  // =====================================================
  // LOAD MOVIE
  // =====================================================

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/movies/${id}`
          );

        const movieData =
          response.data?.movie ||
          response.data?.data ||
          response.data;

        if (!movieData) {
          setError(
            "Movie not found."
          );
          return;
        }

        setMovie(movieData);

      } catch (err) {
        console.error(
          "Failed to fetch movie:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Unable to load movie details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="page">

        <h1>
          Loading Movie...
        </h1>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !movie) {
    return (
      <div className="page">

        <h1>
          Movie Not Found
        </h1>

        <p>
          {error ||
            "The requested movie could not be found."}
        </p>

        <Link
          to="/movies"
          className="book-button"
        >
          Back to Movies
        </Link>

      </div>
    );
  }

  // =====================================================
  // POSTER
  // =====================================================

  const posterUrl =
    getPosterUrl(movie.poster);

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="movie-details-page">

      <section className="movie-details">

        {/* =================================================
            POSTER
        ================================================= */}

        <div className="details-poster">

          {posterUrl ? (
            <img
              src={posterUrl}
              alt={`${movie.title} poster`}
              onError={(event) => {
                console.error(
                  "MOVIE POSTER FAILED:",
                  posterUrl
                );

                event.currentTarget.style.display =
                  "none";

                const fallback =
                  event.currentTarget
                    .parentElement
                    ?.querySelector(
                      ".poster-fallback"
                    );

                if (fallback) {
                  fallback.style.display =
                    "flex";
                }
              }}
            />
          ) : null}

          {/* Fallback if poster doesn't exist */}
          <div
            className="poster-fallback"
            style={{
              display: posterUrl
                ? "none"
                : "flex",
            }}
          >
            <span>
              CINEBOOK
            </span>

            <strong>
              {movie.title}
            </strong>
          </div>

        </div>

        {/* =================================================
            MOVIE INFORMATION
        ================================================= */}

        <div className="details-content">

          <p className="section-label">
            CINEBOOK MOVIE
          </p>

          <h1>
            {movie.title}
          </h1>

          {/* =================================================
              MOVIE META
          ================================================= */}

          <div className="details-meta">

            {movie.certificate && (
              <span>
                {movie.certificate}
              </span>
            )}

            {movie.genre && (
              <span>
                {Array.isArray(
                  movie.genre
                )
                  ? movie.genre.join(
                      " • "
                    )
                  : movie.genre}
              </span>
            )}

            {movie.language && (
              <span>
                {movie.language}
              </span>
            )}

            {movie.duration && (
              <span>
                {movie.duration} min
              </span>
            )}

          </div>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <p className="details-description">
            {movie.description}
          </p>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="details-actions">

            <Link
              to={`/movies/${movie._id}/theatres`}
              className="primary-button"
            >
              Book Tickets
            </Link>

            <Link
              to="/movies"
              className="secondary-button"
            >
              Back to Movies
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}

export default MovieDetails;