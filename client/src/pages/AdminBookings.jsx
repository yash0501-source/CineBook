import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/bookings");

      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error(
        "ADMIN BOOKINGS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (
    bookingId,
    status
  ) => {
    try {
      setUpdatingId(bookingId);
      setError("");

      await api.put(
        `/admin/bookings/${bookingId}/status`,
        {
          status,
        }
      );

      await fetchBookings();
    } catch (error) {
      console.error(
        "UPDATE BOOKING STATUS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update booking status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const deleteBooking = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(bookingId);
      setError("");

      await api.delete(
        `/admin/bookings/${bookingId}`
      );

      await fetchBookings();
    } catch (error) {
      console.error(
        "DELETE BOOKING ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete booking."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusClass = (status) => {
    if (status === "confirmed") {
      return "booking-status confirmed";
    }

    if (status === "cancelled") {
      return "booking-status cancelled";
    }

    return "booking-status";
  };

  const getBookingAmount = (booking) => {
    return (
      booking.totalAmount ??
      booking.amount ??
      booking.totalPrice ??
      0
    );
  };

  return (
    <div className="admin-bookings-page">
      <div className="admin-bookings-container">

        {/* HEADER */}
        <div className="admin-bookings-header">
          <div>
            <Link
              to="/admin"
              className="admin-back-link"
            >
              ← Back to Dashboard
            </Link>

            <h1>Booking Management</h1>

            <p>
              View and manage customer movie
              ticket bookings.
            </p>
          </div>

          <div className="admin-bookings-count">
            <span>
              {bookings.length}
            </span>
            <small>
              Total Bookings
            </small>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {/* CONTENT */}
        <section className="admin-bookings-list-section">

          <div className="admin-section-heading">
            <div>
              <h2>All Bookings</h2>
              <p>
                Manage bookings from CineBook
                customers.
              </p>
            </div>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={fetchBookings}
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="admin-loading">
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="admin-empty-state">
              <h3>No bookings found</h3>
              <p>
                Customer bookings will appear
                here once tickets are booked.
              </p>
            </div>
          ) : (
            <div className="admin-bookings-table-wrapper">

              <table className="admin-bookings-table">

                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Movie</th>
                    <th>Show</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Booked On</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => {

                    const movie =
                      booking.movie?.title ||
                      booking.show?.movie?.title ||
                      booking.movieTitle ||
                      "—";

                    const showDate =
                      booking.show?.date ||
                      booking.date ||
                      null;

                    const showTime =
                      booking.show?.time ||
                      booking.time ||
                      "—";

                    const seats =
                      booking.seats ||
                      booking.selectedSeats ||
                      [];

                    const amount =
                      getBookingAmount(
                        booking
                      );

                    return (
                      <tr
                        key={booking._id}
                      >

                        {/* BOOKING */}
                        <td>
                          <div className="admin-booking-id">
                            #{booking._id?.slice(-8)}
                          </div>

                          {booking.bookingId && (
                            <div className="admin-booking-reference">
                              {booking.bookingId}
                            </div>
                          )}
                        </td>

                        {/* CUSTOMER */}
                        <td>
                          <div className="admin-customer-name">
                            {booking.user?.name ||
                              booking.customerName ||
                              "—"}
                          </div>

                          <div className="admin-customer-email">
                            {booking.user?.email ||
                              booking.customerEmail ||
                              "—"}
                          </div>
                        </td>

                        {/* MOVIE */}
                        <td>
                          <div className="admin-booking-movie">
                            {movie}
                          </div>
                        </td>

                        {/* SHOW */}
                        <td>
                          <div className="admin-booking-show-date">
                            {formatDate(
                              showDate
                            )}
                          </div>

                          <div className="admin-booking-show-time">
                            {showTime}
                          </div>
                        </td>

                        {/* SEATS */}
                        <td>
                          <div className="admin-booking-seats">
                            {Array.isArray(seats)
                              ? seats.length > 0
                                ? seats.join(", ")
                                : "—"
                              : seats || "—"}
                          </div>
                        </td>

                        {/* AMOUNT */}
                        <td>
                          <div className="admin-booking-amount">
                            ₹
                            {Number(
                              amount
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </div>
                        </td>

                        {/* STATUS */}
                        <td>
                          <span
                            className={getStatusClass(
                              booking.status
                            )}
                          >
                            {booking.status ||
                              "unknown"}
                          </span>
                        </td>

                        {/* BOOKED ON */}
                        <td>
                          <div className="admin-booked-date">
                            {formatDateTime(
                              booking.createdAt
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td>
                          <div className="admin-booking-actions">

                            {booking.status !==
                              "confirmed" && (
                              <button
                                type="button"
                                className="admin-booking-confirm-button"
                                disabled={
                                  updatingId ===
                                  booking._id
                                }
                                onClick={() =>
                                  updateStatus(
                                    booking._id,
                                    "confirmed"
                                  )
                                }
                              >
                                Confirm
                              </button>
                            )}

                            {booking.status !==
                              "cancelled" && (
                              <button
                                type="button"
                                className="admin-booking-cancel-button"
                                disabled={
                                  updatingId ===
                                  booking._id
                                }
                                onClick={() =>
                                  updateStatus(
                                    booking._id,
                                    "cancelled"
                                  )
                                }
                              >
                                Cancel
                              </button>
                            )}

                            <button
                              type="button"
                              className="admin-booking-delete-button"
                              disabled={
                                updatingId ===
                                booking._id
                              }
                              onClick={() =>
                                deleteBooking(
                                  booking._id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>

            </div>
          )}

        </section>
      </div>
    </div>
  );
}

export default AdminBookings;