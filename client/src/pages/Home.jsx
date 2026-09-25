import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Home() {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await api.get("/movies");

        const movieData =
          response.data?.movies ||
          response.data?.data ||
          [];

        setMovies(movieData);
      } catch (error) {
        console.error(
          "Failed to load movies:",
          error
        );

        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const nowShowingMovies = movies
    .filter(
      (movie) =>
        movie.status === "now_showing"
    )
    .slice(0, 4);

  const upcomingMovies = movies
    .filter(
      (movie) =>
        movie.status === "upcoming"
    )
    .slice(0, 4);

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

    return `http://localhost:5000${poster}`;
  };

  const MovieCard = ({ movie }) => {
    return (
      <div
        className="movie-card"
        onClick={() =>
          navigate(`/movies/${movie._id}`)
        }
      >
        <div className="movie-poster">
          {movie.poster ? (
            <img
              src={getPosterUrl(movie.poster)}
              alt={movie.title}
            />
          ) : (
            <div className="movie-poster-fallback">
              {movie.title}
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

          <span>
            {movie.language}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="home-page">

      {/* Hero Section */}

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
              onClick={() =>
                navigate("/movies")
              }
            >
              Explore Movies
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                navigate("/bookings")
              }
            >
              View Bookings
            </button>

          </div>

        </div>
      </section>

      {/* Currently Showing */}

      <section className="movie-section">

        <div className="section-heading">

          <div>
            <p className="section-label">
              NOW SHOWING
            </p>

            <h2>
              Currently in Cinemas
            </h2>
          </div>

          <button
            className="view-all-button"
            onClick={() =>
              navigate("/movies")
            }
          >
            View All →
          </button>

        </div>

        {loading ? (
          <div className="movie-placeholder-grid">
            <div className="movie-placeholder">
              Loading...
            </div>

            <div className="movie-placeholder">
              Loading...
            </div>

            <div className="movie-placeholder">
              Loading...
            </div>

            <div className="movie-placeholder">
              Loading...
            </div>
          </div>
        ) : nowShowingMovies.length > 0 ? (
          <div className="movie-placeholder-grid">

            {nowShowingMovies.map(
              (movie) => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                />
              )
            )}

          </div>
        ) : (
          <div className="movie-placeholder-grid">

            <div className="movie-placeholder">
              No movies available
            </div>

          </div>
        )}

      </section>

      {/* Upcoming */}

      <section className="movie-section">

        <div className="section-heading">

          <div>
            <p className="section-label">
              COMING SOON
            </p>

            <h2>
              Upcoming Movies
            </h2>
          </div>

        </div>

        {loading ? (
          <div className="movie-placeholder-grid">

            <div className="movie-placeholder">
              Loading...
            </div>

            <div className="movie-placeholder">
              Loading...
            </div>

            <div className="movie-placeholder">
              Loading...
            </div>

            <div className="movie-placeholder">
              Loading...
            </div>

          </div>
        ) : upcomingMovies.length > 0 ? (
          <div className="movie-placeholder-grid">

            {upcomingMovies.map(
              (movie) => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                />
              )
            )}

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