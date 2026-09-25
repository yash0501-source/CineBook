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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     GET BOOKING ID
     ===================================================== */

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

  /* =====================================================
     LOAD BOOKING
     ===================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const bookingId = getBookingId();

        if (!bookingId) {
          if (!cancelled) {
            setError("Booking ID is required.");
            setLoading(false);
          }

          return;
        }

        /* Save booking ID */
        localStorage.setItem(
          "cinebookLastBookingId",
          String(bookingId)
        );

        /* Use booking from navigation immediately */
        if (
          location.state?.booking &&
          (
            location.state.booking.bookingId ||
            location.state.booking._id
          )
        ) {
          if (!cancelled) {
            setBooking(location.state.booking);
          }

          localStorage.setItem(
            "cinebookLastBooking",
            JSON.stringify(location.state.booking)
          );
        }

        /* Fetch latest booking from backend */
        const response = await api.get(
          `/bookings/${encodeURIComponent(
            String(bookingId)
          )}`
        );

        const bookingData =
          response.data?.booking ||
          response.data?.data ||
          response.data;

        if (!bookingData) {
          throw new Error(
            "Booking could not be found."
          );
        }

        if (!cancelled) {
          setBooking(bookingData);
        }

        /* Save latest booking */
        localStorage.setItem(
          "cinebookLastBooking",
          JSON.stringify(bookingData)
        );

        if (bookingData.bookingId) {
          localStorage.setItem(
            "cinebookLastBookingId",
            String(bookingData.bookingId)
          );
        }
      } catch (err) {
        console.error(
          "DIGITAL TICKET ERROR:",
          err.response?.data || err
        );

        /*
          If we already have booking information
          from navigation/localStorage, keep displaying it.
        */
        if (!location.state?.booking && !cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Unable to load your ticket."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBooking();

    return () => {
      cancelled = true;
    };

    /*
      Only reload when the actual URL booking ID changes.
    */
  }, [urlBookingId]);

  /* =====================================================
     PRINT TICKET
     ===================================================== */

  const handlePrint = () => {
    window.print();
  };

  /* =====================================================
     LOADING
     ===================================================== */

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
              Please wait while we load your booking.
            </p>
          </div>

        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
     ===================================================== */

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

  /* =====================================================
     NO BOOKING
     ===================================================== */

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

  /* =====================================================
     NORMALIZE BOOKING DATA
     ===================================================== */

  const finalBookingId =
    booking.bookingId ||
    booking._id ||
    getBookingId();

  const movieTitle =
    booking.movieTitle ||
    booking.movie?.title ||
    "Movie";

  const theatreName =
    booking.theatre ||
    booking.theatreName ||
    booking.theatre?.name ||
    "Theatre";

  const bookingDate =
    booking.date ||
    booking.show?.date ||
    "Date";

  const bookingTime =
    booking.time ||
    booking.show?.time ||
    booking.startTime ||
    "Time";

  const seats = Array.isArray(booking.seats)
    ? booking.seats
    : [];

  const seatText =
    seats.length > 0
      ? seats.join(", ")
      : "Not available";

  const amount = Number(
    booking.amount ??
    booking.totalAmount ??
    0
  );

  const status =
    booking.status ||
    "confirmed";

  /* =====================================================
     QR DATA
     ===================================================== */

  const qrValue =
    `CINEBOOK|${String(finalBookingId)}`;

  /* =====================================================
     DIGITAL TICKET
     ===================================================== */

  return (
    <div className="ticket-page">

      <div className="ticket-card">

        {/* ================================================
            HEADER
            ================================================ */}

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


        {/* ================================================
            DIVIDER
            ================================================ */}

        <div className="ticket-divider" />


        {/* ================================================
            TICKET INFORMATION
            ================================================ */}

        <div className="ticket-info">

          <div>
            <span>
              Movie
            </span>

            <strong>
              {movieTitle}
            </strong>
          </div>


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


        {/* ================================================
            QR CODE
            ================================================ */}

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


        {/* ================================================
            ACTIONS
            ================================================ */}

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
            onClick={() => navigate("/bookings")}
          >
            My Bookings
          </button>

        </div>

      </div>

    </div>
  );
}

export default DigitalTicket;