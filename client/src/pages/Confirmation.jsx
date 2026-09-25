import { useEffect } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

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
    booking?.amount ??
    0;

  /* =====================================================
     GET THE REAL BOOKING ID
     ===================================================== */

  const bookingId =
    booking?.bookingId ||
    booking?._id ||
    "";

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

    // This is the ID the Digital Ticket page will use.
    localStorage.setItem(
      "cinebookLastBookingId",
      String(bookingId)
    );

    // Save complete booking.
    if (booking) {
      localStorage.setItem(
        "cinebookLastBooking",
        JSON.stringify(booking)
      );
    }

    // Save payment if available.
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
        },
      }
    );
  };

  /* =====================================================
     HELPERS
     ===================================================== */

  const movieTitle =
    booking?.movieTitle ||
    show?.movie?.title ||
    "Movie";

  const theatreName =
    booking?.theatre ||
    show?.theatre?.name ||
    "Theatre";

  const date =
    booking?.date ||
    show?.date ||
    "";

  const time =
    booking?.time ||
    show?.time ||
    show?.startTime ||
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

        {/* SUCCESS */}

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

        {/* DETAILS */}

        <div className="confirmation-details">

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

          <div>
            <span>
              Showtime
            </span>

            <strong>
              {time || "N/A"}
            </strong>
          </div>

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

          <div>
            <span>
              Payment
            </span>

            <strong>
              {paymentMethod}
            </strong>
          </div>

          <div>
            <span>
              Booking ID
            </span>

            <strong>
              {bookingId || "N/A"}
            </strong>
          </div>

          <div className="confirmation-total">
            <span>
              Total
            </span>

            <strong>
              ₹{formattedAmount}
            </strong>
          </div>

        </div>

        {/* ACTIONS */}

        <div className="confirmation-actions">

          <button
            type="button"
            className="ticket-button"
            onClick={
              handleTicket
            }
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