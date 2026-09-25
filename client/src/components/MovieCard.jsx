import { Link } from "react-router-dom";

function MovieCard({ movie }) {
  return (
    <div className="movie-card">

      {/* Movie Poster */}
      <div className="movie-poster">
        <img
          src={movie.poster}
          alt={movie.title}
        />
      </div>

      {/* Movie Information */}
      <div className="movie-info">
        <h3>{movie.title}</h3>

        <p>
          {movie.genre} • {movie.language}
        </p>

        <div className="movie-bottom">
          <span>⭐ {movie.rating}</span>

          <Link
            to={`/movies/${movie.id}`}
            className="book-button"
          >
            Book
          </Link>
        </div>
      </div>

    </div>
  );
}

export default MovieCard;