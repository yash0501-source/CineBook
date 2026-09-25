import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Movies() {
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

  if (loading) {
    return (
      <div className="movies-page">
        <div className="movies-header">
          <p className="section-label">
            CINEBOOK
          </p>

          <h1>Movies</h1>
        </div>

        <div className="movie-placeholder-grid">
          <div className="movie-placeholder">
            Loading movies...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="movies-page">

      {/* PAGE HEADER */}

      <section className="movies-header">
        <p className="section-label">
          CINEBOOK COLLECTION
        </p>

        <h1>
          Discover Your Next Movie
        </h1>

        <p>
          Explore currently showing and
          upcoming movies.
        </p>
      </section>

      {/* MOVIES */}

      <section className="movies-section">

        <div className="section-heading">
          <div>
            <p className="section-label">
              ALL MOVIES
            </p>

            <h2>
              Movies
            </h2>
          </div>

          <span>
            {movies.length} movies
          </span>
        </div>

        {movies.length === 0 ? (
          <div className="movie-placeholder">
            No movies available.
          </div>
        ) : (
          <div className="movie-grid">

            {movies.map((movie) => (

              <div
                className="movie-card"
                key={movie._id}
                onClick={() =>
                  navigate(
                    `/movies/${movie._id}`
                  )
                }
              >

                {/* POSTER */}

                <div className="movie-poster">

                  {movie.poster ? (
                    <img
                      src={getPosterUrl(
                        movie.poster
                      )}
                      alt={movie.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="movie-poster-fallback">
                      <span>
                        {movie.title}
                      </span>
                    </div>
                  )}

                </div>

                {/* MOVIE INFORMATION */}

                <div className="movie-card-info">

                  <h3>
                    {movie.title}
                  </h3>

                  <p>
                    {Array.isArray(
                      movie.genre
                    )
                      ? movie.genre.join(
                          " • "
                        )
                      : movie.genre || ""}
                  </p>

                  <div className="movie-meta">

                    <span>
                      {movie.language}
                    </span>

                    {movie.duration && (
                      <span>
                        {movie.duration} min
                      </span>
                    )}

                  </div>

                  <span
                    className={
                      movie.status ===
                      "now_showing"
                        ? "movie-status now-showing"
                        : "movie-status upcoming"
                    }
                  >
                    {movie.status ===
                    "now_showing"
                      ? "Now Showing"
                      : "Coming Soon"}
                  </span>

                </div>

              </div>

            ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default Movies;