
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Home() {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // ========================================
  // FETCH MOVIES FROM BACKEND
  // ========================================

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await api.get("/movies");

        // Support different API response formats
        const movieData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.movies)
          ? response.data.movies
          : Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        setMovies(movieData);

        console.log("CINEBOOK MOVIES LOADED:", movieData);
      } catch (error) {
        console.error("FAILED TO LOAD MOVIES:", error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // ========================================
  // FILTER MOVIES
  // ========================================

  const getMovieStatus = (movie) =>
    String(movie.status || "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");

  // Show maximum 4 currently showing movies
  const nowShowingMovies = movies
    .filter((movie) =>
      ["now_showing", "currently_showing", "in_cinemas"].includes(
        getMovieStatus(movie)
      )
    )
    .slice(0, 4);

  // Show maximum 2 upcoming movies
  const upcomingMovies = movies
    .filter((movie) =>
      ["upcoming", "coming_soon"].includes(getMovieStatus(movie))
    )
    .slice(0, 2);

  // ========================================
  // POSTER URL
  // ========================================

  const getPosterUrl = (poster) => {
    if (!poster) return "";

    // Already a complete image URL
    if (/^https?:\/\//i.test(poster)) {
      return poster;
    }

    // Get backend URL from api.js
    const apiBaseUrl =
      api.defaults.baseURL || "http://localhost:8080/api";

    // Remove /api to get backend root
    const backendUrl = apiBaseUrl.replace(/\/api\/?$/, "");

    return `${backendUrl}${poster.startsWith("/") ? poster : `/${poster}`}`;
  };

  // ========================================
  // MOVIE CARD
  // ========================================

  const MovieCard = ({ movie }) => {
    const movieId = movie.id || movie._id;

    return (
      <div
        className="movie-card"
        onClick={() => {
          if (movieId) {
            navigate(`/movies/${movieId}`);
          }
        }}
        style={{ cursor: "pointer" }}
      >
        <div className="movie-poster">
          {movie.poster ? (
            <img
              src={getPosterUrl(movie.poster)}
              alt={movie.title || "Movie poster"}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";

                console.error(
                  "POSTER FAILED TO LOAD:",
                  getPosterUrl(movie.poster)
                );
              }}
            />
          ) : (
            <div className="movie-poster-fallback">
              {movie.title || "Movie"}
            </div>
          )}
        </div>

        <div className="movie-card-info">
          <h3>{movie.title}</h3>

          <p>
            {Array.isArray(movie.genre)
              ? movie.genre.join(" • ")
              : movie.genre || ""}
          </p>

          <span>{movie.language}</span>
        </div>
      </div>
    );
  };

  // ========================================
  // LOADING PLACEHOLDERS
  // ========================================

  const LoadingGrid = ({ count }) => (
    <div className="movie-placeholder-grid">
      {Array.from({ length: count }, (_, index) => (
        <div className="movie-placeholder" key={index}>
          Loading...
        </div>
      ))}
    </div>
  );

  // ========================================
  // HOME PAGE
  // ========================================

  return (
    <div className="home-page">

      {/* HERO SECTION */}

      <section className="hero">
        <div className="hero-content">
          <p className="hero-label">
            WELCOME TO CINEBOOK
          </p>

          <h1>
            Your Movie.
            <br />
            Your Moment.
          </h1>

          <p className="hero-description">
            Discover movies, choose your seats,
            and book your next unforgettable
            cinema experience.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-button"
              onClick={() => navigate("/movies")}
            >
              Explore Movies
            </button>

            <button
              className="secondary-button"
              onClick={() => navigate("/bookings")}
            >
              View Bookings
            </button>
          </div>
        </div>
      </section>

      {/* CURRENTLY SHOWING */}

      <section className="movie-section">
        <div className="section-heading">
          <div>
            <p className="section-label">
              NOW SHOWING
            </p>

            <h2>Currently in Cinemas</h2>
          </div>

          <button
            className="view-all-button"
            onClick={() => navigate("/movies")}
          >
            View All →
          </button>
        </div>

        {loading ? (
          <LoadingGrid count={4} />
        ) : nowShowingMovies.length > 0 ? (
          <div className="movie-placeholder-grid">
            {nowShowingMovies.map((movie, index) => (
              <MovieCard
                key={movie.id || movie._id || index}
                movie={movie}
              />
            ))}
          </div>
        ) : (
          <div className="movie-placeholder-grid">
            <div className="movie-placeholder">
              No movies available
            </div>
          </div>
        )}
      </section>

      {/* UPCOMING MOVIES */}

      <section className="movie-section">
        <div className="section-heading">
          <div>
            <p className="section-label">
              COMING SOON
            </p>

            <h2>Upcoming Movies</h2>
          </div>
        </div>

        {loading ? (
          <LoadingGrid count={2} />
        ) : upcomingMovies.length > 0 ? (
          <div className="movie-placeholder-grid">
            {upcomingMovies.map((movie, index) => (
              <MovieCard
                key={movie.id || movie._id || index}
                movie={movie}
              />
            ))}
          </div>
        ) : (
          <div className="movie-placeholder-grid">
            <div className="movie-placeholder">
              No upcoming movies
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
export default Home;