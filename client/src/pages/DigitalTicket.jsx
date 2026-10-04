import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../services/api";

function DigitalTicket() {
  const { bookingId: urlBookingId } = useParams();

  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(
    location.state?.booking || null
  );

  const [showDetails, setShowDetails] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  const [theatreDetails, setTheatreDetails] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // GET BOOKING ID
  // ==================================================

  const getBookingId = () => {
    let savedBooking = null;

    try {
      savedBooking = JSON.parse(
        localStorage.getItem("cinebookLastBooking") || "null"
      );
    } catch {
      savedBooking = null;
    }

    return (
      urlBookingId ||
      location.state?.bookingId ||
      location.state?.booking?.bookingId ||
      location.state?.booking?._id ||
      localStorage.getItem("cinebookLastBookingId") ||
      savedBooking?.bookingId ||
      savedBooking?._id ||
      ""
    );
  };

  // ==================================================
  // GET ID FROM STRING / OBJECT
  // ==================================================

  const getId = (value) => {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      return (
        value.id ||
        value._id ||
        value.$oid ||
        ""
      );
    }

    return String(value);
  };

  // ==================================================
  // UNWRAP BOOKING RESPONSE
  // ==================================================

  const unwrapBooking = (response) => {
    return (
      response?.data?.booking ||
      response?.data?.data ||
      response?.data ||
      null
    );
  };

  // ==================================================
  // UNWRAP MOVIE RESPONSE
  // ==================================================

  const unwrapMovie = (response) => {
    return (
      response?.data?.movie ||
      response?.data?.data ||
      response?.data ||
      null
    );
  };

  // ==================================================
  // UNWRAP THEATRE RESPONSE
  // ==================================================

  const unwrapTheatre = (response) => {
    return (
      response?.data?.theatre ||
      response?.data?.data ||
      response?.data ||
      null
    );
  };

  // ==================================================
  // UNWRAP SHOW RESPONSE
  // IMPORTANT:
  // SHOW MUST BE READ AS A SHOW OBJECT.
  // ==================================================

  const unwrapShow = (response) => {
    const data = response?.data;

    if (!data) {
      return null;
    }

    // Direct Show object
    if (
      typeof data === "object" &&
      !Array.isArray(data) &&
      (
        data.date ||
        data.time ||
        data.movie ||
        data.theatre ||
        data.screen ||
        data.seatPrices
      )
    ) {
      return data;
    }

    // { show: {...} }
    if (
      data.show &&
      typeof data.show === "object" &&
      !Array.isArray(data.show)
    ) {
      return data.show;
    }

    // { data: {...} }
    if (
      data.data &&
      typeof data.data === "object" &&
      !Array.isArray(data.data)
    ) {
      return data.data;
    }

    return null;
  };

  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatTicketDate = (value) => {
    if (!value) {
      return "Date";
    }

    const text = String(value).trim();

    // YYYY-MM-DD
    const yyyyMmDd = text.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (yyyyMmDd) {
      const year = yyyyMmDd[1];
      const month = Number(yyyyMmDd[2]);
      const day = Number(yyyyMmDd[3]);

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      if (month >= 1 && month <= 12) {
        return `${day} ${months[month - 1]} ${year}`;
      }
    }

    // YYYY-MM-DDTHH:mm:ss
    const isoDate = text.match(
      /^(\d{4})-(\d{2})-(\d{2})T/
    );

    if (isoDate) {
      const year = isoDate[1];
      const month = Number(isoDate[2]);
      const day = Number(isoDate[3]);

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      if (month >= 1 && month <= 12) {
        return `${day} ${months[month - 1]} ${year}`;
      }
    }

    // DD-MM-YYYY
    const ddMmYyyy = text.match(
      /^(\d{2})-(\d{2})-(\d{4})$/
    );

    if (ddMmYyyy) {
      const day = Number(ddMmYyyy[1]);
      const month = Number(ddMmYyyy[2]);
      const year = ddMmYyyy[3];

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      if (month >= 1 && month <= 12) {
        return `${day} ${months[month - 1]} ${year}`;
      }
    }

    return text;
  };

  // ==================================================
  // FORMAT TIME
  // ==================================================

  const formatTicketTime = (value) => {
    if (!value) {
      return "Time";
    }

    const text = String(value).trim();

    // Already 12-hour format
    const twelveHour = text.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );

    if (twelveHour) {
      const hours = Number(twelveHour[1]);
      const minutes = twelveHour[2];
      const period = twelveHour[3].toUpperCase();

      return `${hours}:${minutes} ${period}`;
    }

    // 24-hour format
    const twentyFourHour = text.match(
      /^(\d{1,2}):(\d{2})$/
    );

    if (twentyFourHour) {
      let hours = Number(twentyFourHour[1]);
      const minutes = twentyFourHour[2];

      if (hours >= 0 && hours <= 23) {
        const period = hours >= 12 ? "PM" : "AM";

        hours = hours % 12;

        if (hours === 0) {
          hours = 12;
        }

        return `${hours}:${minutes} ${period}`;
      }
    }

    // ISO datetime
    const isoTime = text.match(
      /T(\d{2}):(\d{2})/
    );

    if (isoTime) {
      let hours = Number(isoTime[1]);
      const minutes = isoTime[2];

      const period = hours >= 12 ? "PM" : "AM";

      hours = hours % 12;

      if (hours === 0) {
        hours = 12;
      }

      return `${hours}:${minutes} ${period}`;
    }

    return text;
  };

  // ==================================================
  // LOAD COMPLETE TICKET
  // ==================================================

  useEffect(() => {
    let cancelled = false;

    const loadTicket = async () => {
      try {
        setLoading(true);
        setError("");

        const bookingId = getBookingId();

        if (!bookingId) {
          throw new Error("Booking ID is missing.");
        }

        localStorage.setItem(
          "cinebookLastBookingId",
          String(bookingId)
        );

        // ==================================================
        // 1. LOAD BOOKING
        // ==================================================

        let bookingData =
          location.state?.booking || null;

        try {
          const response = await api.get(
            `/bookings/${encodeURIComponent(
              String(bookingId)
            )}`
          );

          const backendBooking =
            unwrapBooking(response);

          if (backendBooking) {
            bookingData = backendBooking;
          }
        } catch (bookingError) {
          console.error(
            "BOOKING LOAD ERROR:",
            bookingError.response?.data ||
              bookingError
          );

          if (!bookingData) {
            throw bookingError;
          }
        }

        if (!bookingData) {
          throw new Error(
            "Booking could not be found."
          );
        }

        console.log(
          "DIGITAL TICKET BOOKING:",
          bookingData
        );

        if (!cancelled) {
          setBooking(bookingData);
        }

        localStorage.setItem(
          "cinebookLastBooking",
          JSON.stringify(bookingData)
        );

        // ==================================================
        // 2. GET SHOW ID
        // ==================================================

        const showId = getId(
          bookingData.show ||
            bookingData.showId
        );

        console.log(
          "DIGITAL TICKET SHOW ID:",
          showId
        );

        let loadedShow = null;
        let loadedMovie = null;
        let loadedTheatre = null;

        // ==================================================
        // 3. LOAD SHOW
        // ==================================================

        if (showId) {
          try {
            const showResponse = await api.get(
              `/shows/${encodeURIComponent(showId)}`
            );

            loadedShow =
              unwrapShow(showResponse);

            console.log(
              "DIGITAL TICKET SHOW:",
              loadedShow
            );

            if (!cancelled) {
              setShowDetails(loadedShow);
            }
          } catch (showError) {
            console.error(
              "SHOW LOAD ERROR:",
              showError.response?.data ||
                showError
            );
          }
        }

        // ==================================================
        // 4. GET MOVIE ID
        // ==================================================

        const movieId = getId(
          bookingData.movie ||
            bookingData.movieId ||
            loadedShow?.movie ||
            loadedShow?.movieId
        );

        console.log(
          "DIGITAL TICKET MOVIE ID:",
          movieId
        );

        // ==================================================
        // 5. LOAD MOVIE
        // ==================================================

        if (movieId) {
          try {
            const movieResponse = await api.get(
              `/movies/${encodeURIComponent(movieId)}`
            );

            loadedMovie =
              unwrapMovie(movieResponse);

            console.log(
              "DIGITAL TICKET MOVIE:",
              loadedMovie
            );

            if (!cancelled) {
              setMovieDetails(loadedMovie);
            }
          } catch (movieError) {
            console.error(
              "MOVIE LOAD ERROR:",
              movieError.response?.data ||
                movieError
            );
          }
        }

        // ==================================================
        // 6. GET THEATRE ID
        // ==================================================

        const theatreId = getId(
          bookingData.theatre ||
            bookingData.theatreId ||
            loadedShow?.theatre ||
            loadedShow?.theatreId
        );

        console.log(
          "DIGITAL TICKET THEATRE ID:",
          theatreId
        );

        // ==================================================
        // 7. LOAD THEATRE
        // ==================================================

        if (theatreId) {
          try {
            const theatreResponse = await api.get(
              `/theatres/${encodeURIComponent(
                theatreId
              )}`
            );

            loadedTheatre =
              unwrapTheatre(theatreResponse);

            console.log(
              "DIGITAL TICKET THEATRE:",
              loadedTheatre
            );

            if (!cancelled) {
              setTheatreDetails(
                loadedTheatre
              );
            }
          } catch (theatreError) {
            console.error(
              "THEATRE LOAD ERROR:",
              theatreError.response?.data ||
                theatreError
            );
          }
        }

        // ==================================================
        // 8. SAVE ENRICHED BOOKING
        // ==================================================

        const enrichedBooking = {
          ...bookingData,

          showDetails:
            loadedShow ||
            bookingData.showDetails ||
            null,

          movieDetails:
            loadedMovie ||
            bookingData.movieDetails ||
            null,

          theatreDetails:
            loadedTheatre ||
            bookingData.theatreDetails ||
            null,
        };

        localStorage.setItem(
          "cinebookLastBooking",
          JSON.stringify(enrichedBooking)
        );
      } catch (err) {
        console.error(
          "DIGITAL TICKET ERROR:",
          err.response?.data || err
        );

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load ticket."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTicket();

    return () => {
      cancelled = true;
    };
  }, [urlBookingId]);

  // ==================================================
  // PRINT
  // ==================================================

  const handlePrint = () => {
    window.print();
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading && !booking) {
    return (
      <div className="ticket-page">
        <div className="ticket-card">
          <div className="ticket-header">
            <p className="section-label">
              CINEBOOK
            </p>

            <h1>
              Loading Ticket
            </h1>

            <p>
              Please wait while we load your ticket.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // ERROR
  // ==================================================

  if (error && !booking) {
    return (
      <div className="ticket-page">
        <div className="ticket-card">
          <div className="ticket-header">
            <p className="section-label">
              CINEBOOK
            </p>

            <h1>
              Ticket Unavailable
            </h1>

            <p>
              {error}
            </p>
          </div>

          <div className="ticket-actions">
            <Link
              to="/bookings"
              className="ticket-home-button"
            >
              My Bookings
            </Link>

            <Link
              to="/"
              className="ticket-home-button"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // NO BOOKING
  // ==================================================

  if (!booking) {
    return (
      <div className="ticket-page">
        <div className="ticket-card">
          <div className="ticket-header">
            <p className="section-label">
              CINEBOOK
            </p>

            <h1>
              Ticket Unavailable
            </h1>

            <p>
              Booking information could not be loaded.
            </p>
          </div>

          <div className="ticket-actions">
            <Link
              to="/bookings"
              className="ticket-home-button"
            >
              My Bookings
            </Link>

            <Link
              to="/"
              className="ticket-home-button"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // BOOKING ID
  // ==================================================

  const finalBookingId =
    booking.bookingId ||
    booking._id ||
    getBookingId();

  // ==================================================
  // MOVIE DETAILS
  // ==================================================

  const finalMovieDetails =
    movieDetails ||
    booking.movieDetails ||
    {};

  const movieTitle =
    finalMovieDetails.title ||
    finalMovieDetails.name ||
    booking.movieTitle ||
    booking.movieName ||
    "Movie";

  // ==================================================
  // THEATRE DETAILS
  // ==================================================

  const finalTheatreDetails =
    theatreDetails ||
    booking.theatreDetails ||
    {};

  const theatreName =
    finalTheatreDetails.name ||
    finalTheatreDetails.theatreName ||
    finalTheatreDetails.title ||
    booking.theatreName ||
    "Theatre";

  // ==================================================
  // SHOW DETAILS
  // ==================================================

  const finalShowDetails =
    showDetails ||
    booking.showDetails ||
    {};

  // ==================================================
  // RAW DATE
  // ==================================================

  const rawBookingDate =
    finalShowDetails.date ||
    finalShowDetails.showDate ||
    finalShowDetails.screeningDate ||
    finalShowDetails.show_date ||
    finalShowDetails.screening_date ||
    finalShowDetails.startDate ||
    finalShowDetails.start_date ||
    finalShowDetails.startDateTime ||
    booking.date ||
    booking.showDate ||
    booking.screeningDate ||
    booking.show_date ||
    booking.screening_date ||
    booking.startDate ||
    booking.start_date ||
    booking.show?.date ||
    booking.show?.showDate ||
    booking.show?.screeningDate ||
    "";

  // ==================================================
  // RAW TIME
  // ==================================================

  const rawBookingTime =
    finalShowDetails.time ||
    finalShowDetails.showTime ||
    finalShowDetails.startTime ||
    finalShowDetails.showtime ||
    finalShowDetails.show_time ||
    finalShowDetails.start_time ||
    finalShowDetails.start ||
    finalShowDetails.startDateTime ||
    booking.time ||
    booking.showTime ||
    booking.startTime ||
    booking.showtime ||
    booking.show_time ||
    booking.start_time ||
    booking.start ||
    booking.show?.time ||
    booking.show?.showTime ||
    booking.show?.startTime ||
    "";

  // ==================================================
  // FINAL FORMATTED DATE/TIME
  // ==================================================

  const bookingDate = rawBookingDate
    ? formatTicketDate(rawBookingDate)
    : "Date";

  const bookingTime = rawBookingTime
    ? formatTicketTime(rawBookingTime)
    : "Time";

  // ==================================================
  // SEATS
  // ==================================================

  const seats = Array.isArray(
    booking.seats
  )
    ? booking.seats
    : [];

  const seatText =
    seats.length > 0
      ? seats.join(", ")
      : "Not available";

  // ==================================================
  // AMOUNT
  // ==================================================

  const amount = Number(
    booking.totalAmount ??
      booking.amount ??
      0
  );

  // ==================================================
  // STATUS
  // ==================================================

  const status =
    booking.status ||
    "CONFIRMED";

  // ==================================================
  // QR CODE
  // ==================================================

  const qrValue =
    `CINEBOOK|${String(finalBookingId)}`;

  // ==================================================
  // DIGITAL TICKET
  // ==================================================

  return (
    <div className="ticket-page">
      <div className="ticket-card">

        {/* HEADER */}

        <div className="ticket-header">
          <p className="section-label">
            CINEBOOK
          </p>

          <h1>
            Digital Movie Ticket
          </h1>

          <p>
            Your booking has been confirmed.
          </p>
        </div>

        <div className="ticket-divider" />

        {/* MOVIE */}

        <div className="ticket-movie-section">
          <p className="section-label">
            MOVIE
          </p>

          <h2>
            {movieTitle}
          </h2>
        </div>

        {/* INFORMATION */}

        <div className="ticket-info">

          <div>
            <span>
              Theatre
            </span>

            <strong>
              {theatreName}
            </strong>
          </div>

          <div>
            <span>
              Date
            </span>

            <strong>
              {bookingDate}
            </strong>
          </div>

          <div>
            <span>
              Showtime
            </span>

            <strong>
              {bookingTime}
            </strong>
          </div>

          <div>
            <span>
              Seats
            </span>

            <strong>
              {seatText}
            </strong>
          </div>

          <div>
            <span>
              Booking ID
            </span>

            <strong>
              {finalBookingId}
            </strong>
          </div>

          <div>
            <span>
              Amount
            </span>

            <strong>
              ₹{amount}
            </strong>
          </div>

          <div>
            <span>
              Status
            </span>

            <strong>
              {String(status).toUpperCase()}
            </strong>
          </div>

        </div>

        <div className="ticket-divider" />

        {/* QR CODE */}

        <div className="ticket-code">

          <div className="qr-code-wrapper">

            <QRCodeCanvas
              value={qrValue}
              size={180}
              bgColor="#ffffff"
              fgColor="#05070b"
              level="H"
              includeMargin={true}
            />

          </div>

          <strong>
            {finalBookingId}
          </strong>

          <p>
            Scan this QR code at the theatre.
          </p>

        </div>

        {/* BUTTONS */}

        <div className="ticket-actions">

          <button
            type="button"
            className="print-ticket-button"
            onClick={handlePrint}
          >
            Print / Save Ticket
          </button>

          <button
            type="button"
            className="ticket-home-button"
            onClick={() =>
              navigate("/bookings")
            }
          >
            My Bookings
          </button>

        </div>

      </div>
    </div>
  );
}

export default DigitalTicket;