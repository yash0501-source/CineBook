import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking =
    location.state?.booking || null;

  const payment =
    location.state?.payment || null;

  const show =
    location.state?.show || null;

  const selectedSeats =
    location.state?.seats || [];

  const paymentMethod =
    location.state?.paymentMethod ||
    payment?.paymentMethod ||
    "Online Payment";

  const totalAmount =
    location.state?.totalAmount ??
    booking?.totalAmount ??
    booking?.amount ??
    0;

  const [movieTitle, setMovieTitle] =
    useState("Loading...");

  const [theatreName, setTheatreName] =
    useState("Loading...");

  /* =====================================================
     BOOKING ID
     ===================================================== */

  const bookingId =
    location.state?.bookingId ||
    booking?.id ||
    booking?.bookingId ||
    booking?._id ||
    "";

  /* =====================================================
     GET MOVIE + THEATRE DETAILS
     ===================================================== */

  useEffect(() => {
    const loadDetails = async () => {
      try {
        /* ---------------- MOVIE ---------------- */

        const movieId =
          location.state?.movieId ||
          booking?.movie ||
          show?.movie?.id ||
          show?.movie?._id ||
          show?.movieId ||
          show?.movie;

        if (movieId) {
          try {
            const movieResponse =
              await api.get(
                `/movies/${movieId}`
              );

            const movie =
              movieResponse.data?.movie ||
              movieResponse.data?.data ||
              movieResponse.data;

            if (movie?.title) {
              setMovieTitle(movie.title);
            } else {
              setMovieTitle("Movie");
            }
          } catch (error) {
            console.error(
              "MOVIE LOAD ERROR:",
              error
            );

            setMovieTitle("Movie");
          }
        } else {
          setMovieTitle("Movie");
        }

        /* ---------------- THEATRE ---------------- */

        const theatreId =
          location.state?.theatreId ||
          booking?.theatre ||
          show?.theatre?.id ||
          show?.theatre?._id ||
          show?.theatre;

        if (theatreId) {
          try {
            const theatreResponse =
              await api.get(
                `/theatres/${theatreId}`
              );

            const theatre =
              theatreResponse.data?.theatre ||
              theatreResponse.data?.data ||
              theatreResponse.data;

            if (theatre?.name) {
              setTheatreName(
                theatre.name
              );
            } else {
              setTheatreName(
                String(theatreId)
              );
            }
          } catch (error) {
            console.error(
              "THEATRE LOAD ERROR:",
              error
            );

            setTheatreName(
              String(theatreId)
            );
          }
        } else {
          setTheatreName("Theatre");
        }

      } catch (error) {
        console.error(
          "CONFIRMATION DETAILS ERROR:",
          error
        );

        setMovieTitle("Movie");
        setTheatreName("Theatre");
      }
    };

    loadDetails();
  }, [
    booking,
    show,
    location.state,
  ]);

  /* =====================================================
     SAVE BOOKING INFORMATION
     ===================================================== */

  useEffect(() => {
    if (!bookingId) {
      console.error(
        "CONFIRMATION: Booking ID missing",
        booking
      );

      return;
    }

    localStorage.setItem(
      "cinebookLastBookingId",
      String(bookingId)
    );

    if (booking) {
      localStorage.setItem(
        "cinebookLastBooking",
        JSON.stringify(booking)
      );
    }

    if (payment) {
      localStorage.setItem(
        "cinebookLastPayment",
        JSON.stringify(payment)
      );
    }
  }, [
    bookingId,
    booking,
    payment,
  ]);

  /* =====================================================
     OPEN DIGITAL TICKET
     ===================================================== */

  const handleTicket = () => {
    if (!bookingId) {
      alert(
        "Booking ID is missing. Please open My Bookings."
      );

      navigate("/bookings");

      return;
    }

    navigate(
      `/ticket/${encodeURIComponent(
        String(bookingId)
      )}`,
      {
        state: {
          booking,
          payment,
          show,
          seats: selectedSeats,
          paymentMethod,
          totalAmount,
          bookingId,
          movieTitle,
          theatreName,
        },
      }
    );
  };

  /* =====================================================
     DATE / TIME / SEATS
     ===================================================== */

  const date =
    booking?.date ||
    show?.date ||
    location.state?.date ||
    "";

  const time =
    booking?.time ||
    show?.time ||
    show?.startTime ||
    location.state?.time ||
    "";

  const seats =
    Array.isArray(
      booking?.seats
    )
      ? booking.seats
      : selectedSeats;

  const formattedAmount =
    Number(
      totalAmount || 0
    ).toLocaleString(
      "en-IN"
    );

  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <div className="confirmation-page">

      <div className="confirmation-card">

        <div className="success-icon">
          ✓
        </div>

        <p className="section-label">
          CINEBOOK
        </p>

        <h1>
          Booking Confirmed!
        </h1>

        <p className="confirmation-message">
          Your movie booking has
          been confirmed successfully.
        </p>

        <div className="confirmation-details">

          {/* MOVIE */}

          <div>
            <span>
              Movie
            </span>

            <strong>
              {movieTitle}
            </strong>
          </div>

          {/* THEATRE */}

          <div>
            <span>
              Theatre
            </span>

            <strong>
              {theatreName}
            </strong>
          </div>

          {/* DATE */}

          <div>
            <span>
              Date
            </span>

            <strong>
              {date
                ? new Date(
                    date
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )
                : "N/A"}
            </strong>
          </div>

          {/* TIME */}

          <div>
            <span>
              Showtime
            </span>

            <strong>
              {time || "N/A"}
            </strong>
          </div>

          {/* SEATS */}

          <div>
            <span>
              Seats
            </span>

            <strong>
              {seats.length > 0
                ? seats.join(", ")
                : "N/A"}
            </strong>
          </div>

          {/* PAYMENT */}

          <div>
            <span>
              Payment
            </span>

            <strong>
              {paymentMethod}
            </strong>
          </div>

          {/* BOOKING ID */}

          <div>
            <span>
              Booking ID
            </span>

            <strong>
              {bookingId || "N/A"}
            </strong>
          </div>

          {/* TOTAL */}

          <div className="confirmation-total">

            <span>
              Total
            </span>

            <strong>
              ₹{formattedAmount}
            </strong>

          </div>

        </div>

        <div className="confirmation-actions">

          <button
            type="button"
            className="ticket-button"
            onClick={handleTicket}
          >
            🎟 View Digital Ticket
          </button>

          <button
            type="button"
            className="home-button"
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

export default Confirmation;