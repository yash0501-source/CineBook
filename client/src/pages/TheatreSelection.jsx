import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../services/api";
import "./TheatreSelection.css";

function TheatreSelection() {
  // =====================================================
  // MOVIE ID
  // =====================================================

  const { movieId } = useParams();

  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =====================================================
  // DATE HELPER
  // Creates YYYY-MM-DD using LOCAL time
  // =====================================================

  const formatDate = (date) => {
    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // GENERATE TODAY + NEXT 5 DAYS
  // Automatically changes every day
  // =====================================================

  const generateDates = () => {
    const dates = [];

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    for (let i = 0; i < 6; i++) {
      const date = new Date(today);

      date.setDate(
        today.getDate() + i
      );

      dates.push(
        formatDate(date)
      );
    }

    return dates;
  };

  // =====================================================
  // AVAILABLE DATES
  // TODAY + NEXT 5 DAYS
  // =====================================================

  const dates = generateDates();

  // =====================================================
  // LOAD MOVIE + SHOWS
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!movieId) {
          setError(
            "Movie ID is missing."
          );
          return;
        }

        // Save movie ID for booking flow
        localStorage.setItem(
          "cinebookMovieId",
          String(movieId)
        );

        // =================================================
        // LOAD MOVIE
        // =================================================

        const movieResponse =
          await api.get(
            `/movies/${movieId}`
          );

        const movieData =
          movieResponse.data?.movie ||
          movieResponse.data?.data ||
          movieResponse.data;

        if (!movieData) {
          setError(
            "Movie not found."
          );
          return;
        }

        setMovie(movieData);

        // =================================================
        // LOAD SHOWS
        // =================================================

        const showsResponse =
          await api.get("/shows");

        const allShows =
          showsResponse.data?.shows ||
          showsResponse.data?.data ||
          showsResponse.data ||
          [];

        // =================================================
        // ONLY SHOWS FOR THIS MOVIE
        // =================================================

        const movieShows =
          Array.isArray(allShows)
            ? allShows.filter(
                (show) => {
                  const showMovieId =
                    typeof show.movie ===
                    "object"
                      ? show.movie?._id ||
                        show.movie?.id
                      : show.movie ||
                        show.movieId;

                  return (
                    String(
                      showMovieId
                    ) ===
                    String(movieId)
                  );
                }
              )
            : [];

        setShows(movieShows);

        // =================================================
        // DEFAULT DATE = TODAY
        // =================================================

        const today =
          new Date();

        today.setHours(
          0,
          0,
          0,
          0
        );

        setSelectedDate(
          formatDate(today)
        );

      } catch (err) {
        console.error(
          "THEATRE SELECTION ERROR:",
          err.response?.data ||
            err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to load theatres and shows."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [movieId]);

  // =====================================================
  // FILTER SHOWS BY SELECTED DATE
  // =====================================================

  const filteredShows =
    shows.filter(
      (show) => {
        if (!selectedDate) {
          return true;
        }

        return (
          String(
            show.date
          ).substring(0, 10) ===
          selectedDate
        );
      }
    );

  // =====================================================
  // GROUP SHOWS BY THEATRE
  // =====================================================

  const theatres = [];

  filteredShows.forEach(
    (show) => {
      const theatre =
        typeof show.theatre ===
        "object"
          ? show.theatre
          : {};

      const theatreId =
        theatre?._id ||
        theatre?.id ||
        theatre?.name ||
        "theatre";

      let existing =
        theatres.find(
          (item) =>
            String(
              item.id
            ) ===
            String(
              theatreId
            )
        );

      if (!existing) {
        existing = {
          id: theatreId,

          name:
            theatre?.name ||
            "CineBook Theatre",

          location:
            theatre?.location ||
            theatre?.address ||
            "Mumbai",

          shows: [],
        };

        theatres.push(
          existing
        );
      }

      existing.shows.push(
        show
      );
    }
  );

  // =====================================================
  // SELECT SHOW
  // =====================================================

  const selectShow = (
    show
  ) => {
    if (!show?._id) {
      setError(
        "Show information is missing."
      );
      return;
    }

    // Save selected show
    localStorage.setItem(
      "cinebookShowId",
      String(show._id)
    );

    localStorage.setItem(
      "cinebookMovieId",
      String(movieId)
    );

    navigate(
      `/movies/${movieId}/seats`,
      {
        state: {
          showId: show._id,
          movieId: movieId,
          show: show,
        },
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="theatre-selection-page">

        <div className="theatre-selection-container">

          <div className="theatre-loading">

            <div>

              <div className="loading-spinner"></div>

              <p>
                Loading theatres
                and showtimes...
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="theatre-selection-page">

      <div className="theatre-selection-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="theatre-page-header">

          <div className="header-badge">
            CINEBOOK
          </div>

          <h1>
            Select Theatre
            & Showtime
          </h1>

          {movie && (
            <h2 className="movie-title">
              {movie.title}
            </h2>
          )}

          <p>
            Choose your preferred
            theatre, date and
            showtime.
          </p>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="theatre-error">

            <span>!</span>

            {error}

          </div>
        )}

        {/* =================================================
            DATES
            TODAY + NEXT 5 DAYS
        ================================================= */}

        <section className="date-section">

          <div className="date-section-title">
            Select Date
          </div>

          <div className="date-selector">

            {dates.map(
              (date, index) => {

                const parsedDate =
                  new Date(
                    `${date}T00:00:00`
                  );

                const day =
                  parsedDate.toLocaleDateString(
                    "en-IN",
                    {
                      weekday:
                        "short",
                    }
                  );

                const number =
                  parsedDate.toLocaleDateString(
                    "en-IN",
                    {
                      day:
                        "2-digit",
                    }
                  );

                const month =
                  parsedDate.toLocaleDateString(
                    "en-IN",
                    {
                      month:
                        "short",
                    }
                  );

                return (
                  <button
                    key={date}
                    type="button"
                    className={
                      selectedDate ===
                      date
                        ? "date-button active"
                        : "date-button"
                    }
                    onClick={() =>
                      setSelectedDate(
                        date
                      )
                    }
                  >

                    {/* TODAY label */}
                    {index === 0 && (
                      <span className="date-today">
                        TODAY
                      </span>
                    )}

                    <span className="date-day">
                      {day}
                    </span>

                    <span className="date-number">
                      {number}
                    </span>

                    <span className="date-month">
                      {month}
                    </span>

                  </button>
                );
              }
            )}

          </div>

        </section>

        {/* =================================================
            SHOWTIME HEADER
        ================================================= */}

        <section className="shows-section">

          <div className="section-heading">

            <div>

              <p className="section-label">
                SHOWTIMES
              </p>

              <h2>
                Available Theatres
              </h2>

            </div>

            <span className="show-count">
              {filteredShows.length}{" "}
              {filteredShows.length ===
              1
                ? "show"
                : "shows"}
            </span>

          </div>

          {/* =================================================
              NO SHOWS
          ================================================= */}

          {filteredShows.length ===
          0 ? (
            <div className="no-shows">

              <div className="empty-icon">
                🎬
              </div>

              <h3>
                No shows available
              </h3>

              <p>
                There are no shows
                available for this
                movie and date.
              </p>

            </div>
          ) : (

            <div className="theatre-list">

              {/* =================================================
                  THEATRE CARDS
              ================================================= */}

              {theatres.map(
                (theatre) => (

                  <article
                    className="theatre-card"
                    key={theatre.id}
                  >

                    {/* =================================================
                        THEATRE HEADER
                    ================================================= */}

                    <div className="theatre-header">

                      <div className="theatre-heading-content">

                        <div className="theatre-icon">
                          🎬
                        </div>

                        <div>

                          <h3 className="theatre-name">
                            {theatre.name}
                          </h3>

                          <p className="theatre-location">
                            📍{" "}
                            {theatre.location}
                          </p>

                        </div>

                      </div>

                      <div className="theatre-show-count">
                        {theatre.shows.length}{" "}
                        {theatre.shows.length ===
                        1
                          ? "show"
                          : "shows"}
                      </div>

                    </div>

                    {/* =================================================
                        SHOWTIMES
                    ================================================= */}

                    <div className="showtime-section">

                      <div className="showtime-title">
                        Select Showtime
                      </div>

                      <div className="showtime-grid">

                        {[...theatre.shows]
                          .sort(
                            (a, b) =>
                              String(
                                a.time ||
                                  a.startTime ||
                                  ""
                              ).localeCompare(
                                String(
                                  b.time ||
                                    b.startTime ||
                                    ""
                                )
                              )
                          )
                          .map(
                            (show) => {

                              const screen =
                                typeof show.screen ===
                                "object"
                                  ? show.screen
                                  : {};

                              const standardPrice =
                                show.seatPrices
                                  ?.standard ??
                                show.standardPrice ??
                                230;

                              const premiumPrice =
                                show.seatPrices
                                  ?.premium ??
                                show.premiumPrice ??
                                300;

                              const reclinerPrice =
                                show.seatPrices
                                  ?.recliner ??
                                show.reclinerPrice ??
                                380;

                              return (
                                <button
                                  key={
                                    show._id
                                  }
                                  type="button"
                                  className="showtime-button"
                                  onClick={() =>
                                    selectShow(
                                      show
                                    )
                                  }
                                >

                                  <span className="showtime-time">
                                    {show.time ||
                                      show.startTime ||
                                      "Time"}
                                  </span>

                                  <span className="showtime-screen">
                                    {screen.name ||
                                      "Screen"}
                                  </span>

                                  <span className="showtime-price">
                                    From ₹
                                    {Math.min(
                                      Number(
                                        standardPrice
                                      ),
                                      Number(
                                        premiumPrice
                                      ),
                                      Number(
                                        reclinerPrice
                                      )
                                    )}
                                  </span>

                                  <span className="show-availability available">
                                    AVAILABLE
                                  </span>

                                </button>
                              );
                            }
                          )}

                      </div>

                    </div>

                  </article>
                )
              )}

            </div>
          )}

        </section>

      </div>

    </div>
  );
}

export default TheatreSelection;