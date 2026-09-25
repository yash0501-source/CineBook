import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/bookings/my"
      );

      console.log(
        "MY BOOKINGS RESPONSE:",
        response.data
      );

      const data =
        response.data?.bookings ||
        response.data?.data ||
        response.data;

      const bookingList =
        Array.isArray(data)
          ? data
          : [];

      setBookings(bookingList);
    } catch (err) {
      console.error(
        "MY BOOKINGS ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
    IMPORTANT:
    Always prefer the custom CineBook bookingId.
    Only use MongoDB _id as a fallback.
  */
  const getBookingId = (booking) => {
    const id =
      booking?.bookingId ||
      booking?._id ||
      "";

    if (!id) {
      return "";
    }

    return String(id);
  };

  const handleViewTicket = (booking) => {
    const bookingId =
      getBookingId(booking);

    console.log(
      "VIEW TICKET BOOKING:",
      booking
    );

    console.log(
      "VIEW TICKET BOOKING ID:",
      bookingId
    );

    if (!bookingId) {
      alert(
        "This booking does not contain a booking ID."
      );

      return;
    }

    /*
      Save the ID BEFORE navigating.
      DigitalTicket can use this as a fallback.
    */
    localStorage.setItem(
      "cinebookLastBookingId",
      bookingId
    );

    localStorage.setItem(
      "cinebookLastBooking",
      JSON.stringify(booking)
    );

    /*
      Navigate using the actual booking ID.
    */
    navigate(
      `/ticket/${encodeURIComponent(
        bookingId
      )}`,
      {
        state: {
          booking: booking,
          bookingId: bookingId,
        },
      }
    );
  };

  if (loading) {
    return (
      <div className="bookings-page">
        <div className="bookings-container">
          <h1>My Bookings</h1>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings-page">
        <div className="bookings-container">
          <h1>My Bookings</h1>

          <div className="booking-error">
            {error}
          </div>

          <button
            type="button"
            onClick={loadBookings}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="bookings-container">

        <div className="bookings-header">
          <p className="section-label">
            CINEBOOK
          </p>

          <h1>My Bookings</h1>

          <p>
            View your confirmed movie
            bookings and digital tickets.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-bookings">
            <h2>
              No bookings yet
            </h2>

            <p>
              Your confirmed bookings
              will appear here.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/movies")
              }
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="booking-list">

            {bookings.map(
              (booking, index) => {
                const bookingId =
                  getBookingId(
                    booking
                  );

                const seats =
                  Array.isArray(
                    booking.seats
                  )
                    ? booking.seats
                    : [];

                const amount =
                  Number(
                    booking.amount ||
                      booking.totalAmount ||
                      0
                  );

                return (
                  <div
                    className="booking-card"
                    key={
                      bookingId ||
                      index
                    }
                  >
                    <div className="booking-main">

                      <div>
                        <p className="section-label">
                          BOOKING CONFIRMED
                        </p>

                        <h2>
                          {booking.movieTitle ||
                            booking.movie?.title ||
                            "Movie"}
                        </h2>

                        <div className="booking-details">

                          <div>
                            <span>
                              Booking ID
                            </span>

                            <strong>
                              {bookingId ||
                                "Unavailable"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Theatre
                            </span>

                            <strong>
                              {booking.theatre ||
                                booking.theatreName ||
                                booking.theatre?.name ||
                                "Theatre"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Date
                            </span>

                            <strong>
                              {booking.date
                                ? new Date(
                                    booking.date
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month:
                                        "short",
                                      year:
                                        "numeric",
                                    }
                                  )
                                : "N/A"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Time
                            </span>

                            <strong>
                              {booking.time ||
                                "N/A"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Seats
                            </span>

                            <strong>
                              {seats.length
                                ? seats.join(
                                    ", "
                                  )
                                : "N/A"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Amount
                            </span>

                            <strong>
                              ₹
                              {amount.toLocaleString(
                                "en-IN"
                              )}
                            </strong>
                          </div>

                        </div>
                      </div>
                    </div>

                    <div className="booking-footer">

                      <span>
                        Status:{" "}
                        {booking.status ||
                          "confirmed"}
                      </span>

                      <button
                        type="button"
                        className="view-ticket-button"
                        disabled={
                          !bookingId
                        }
                        onClick={() =>
                          handleViewTicket(
                            booking
                          )
                        }
                      >
                        🎟 View Digital Ticket
                      </button>

                    </div>
                  </div>
                );
              }
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default MyBookings;