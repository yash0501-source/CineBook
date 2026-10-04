
import { useEffect, useState } from "react";
import api from "../services/api";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/bookings");

      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.bookings)
        ? data.bookings
        : [];

      setBookings(list);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load bookings. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const confirmBooking = async (booking) => {
    const id = booking.id || booking._id;

    if (!id) {
      setError("This booking does not have a valid ID.");
      return;
    }

    try {
      setUpdatingId(id);
      setError("");

      const response = await api.patch(
        `/admin/bookings/${id}/status`,
        { status: "confirmed" }
      );

      const updatedBooking = response.data;

      setBookings((previous) =>
        previous.map((item) =>
          (item.id || item._id) === id
            ? { ...item, ...updatedBooking }
            : item
        )
      );

      if (
        selectedBooking &&
        (selectedBooking.id || selectedBooking._id) === id
      ) {
        setSelectedBooking((previous) => ({
          ...previous,
          ...updatedBooking,
        }));
      }
    } catch (err) {
      console.error("Error updating booking:", err);
      setError(
        err.response?.data?.message ||
          "Unable to update booking status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const formatAmount = (amount) => {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
      return "₹0";
    }

    return `₹${value.toLocaleString("en-IN")}`;
  };

  const filteredBookings = bookings.filter((booking) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return true;

    const values = [
      booking.bookingId,
      booking.id,
      booking.customerName,
      booking.movieTitle,
      booking.theatreName,
      booking.showId,
      booking.date,
      booking.time,
      booking.status,
      ...(Array.isArray(booking.seats) ? booking.seats : []),
    ];

    return values.some((value) =>
      String(value ?? "").toLowerCase().includes(searchText)
    );
  });

  const statusClass = (status) => {
    const normalized = String(status || "pending").toLowerCase();
    return `admin-booking-status ${normalized}`;
  };

  return (
    <div className="admin-bookings-page">
      <style>{`
        .admin-bookings-page {
          min-height: 100vh;
          padding: 32px;
          background: #101116;
          color: #fff;
          font-family: Arial, sans-serif;
        }

        .admin-bookings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 26px;
        }

        .admin-bookings-header h1 {
          margin: 0;
          font-size: 28px;
        }

        .admin-bookings-header p {
          color: #a6a6b0;
          margin-top: 8px;
        }

        .admin-bookings-button,
        .admin-action-button {
          border: none;
          border-radius: 7px;
          padding: 9px 13px;
          color: #fff;
          cursor: pointer;
          font-weight: 600;
        }

        .admin-bookings-button {
          background: #e50914;
          padding: 11px 17px;
        }

        .admin-action-button.view {
          background: #343d57;
        }

        .admin-action-button.confirm {
          background: #176b42;
        }

        .admin-bookings-button:disabled,
        .admin-action-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .admin-bookings-search {
          width: 100%;
          max-width: 440px;
          box-sizing: border-box;
          padding: 13px 15px;
          border: 1px solid #343640;
          border-radius: 8px;
          background: #1b1d25;
          color: #fff;
          outline: none;
          margin-bottom: 20px;
        }

        .admin-bookings-table-wrapper {
          width: 100%;
          overflow-x: auto;
          background: #191b22;
          border: 1px solid #30323c;
          border-radius: 12px;
        }

        .admin-bookings-table {
          width: 100%;
          min-width: 1250px;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-bookings-table th {
          padding: 16px;
          background: #22242d;
          color: #c9c9d2;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .5px;
          white-space: nowrap;
        }

        .admin-bookings-table td {
          padding: 15px 16px;
          border-top: 1px solid #30323c;
          font-size: 13px;
          color: #eeeef2;
          vertical-align: middle;
        }

        .admin-bookings-table tr:hover td {
          background: #20222b;
        }

        .admin-booking-status {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 20px;
          background: #343640;
          color: #eee;
          font-size: 11px;
          text-transform: capitalize;
        }

        .admin-booking-status.confirmed {
          background: #153d2a;
          color: #75e5a5;
        }

        .admin-booking-status.pending {
          background: #493b17;
          color: #ffd66b;
        }

        .admin-booking-status.cancelled {
          background: #401f25;
          color: #ffb7bd;
        }

        .admin-booking-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .admin-bookings-message {
          padding: 20px;
          margin-bottom: 18px;
          border-radius: 8px;
          background: #292b35;
          color: #eee;
        }

        .admin-bookings-error {
          background: #401f25;
          color: #ffb7bd;
        }

        .admin-bookings-empty {
          padding: 40px;
          text-align: center;
          color: #a6a6b0;
        }

        .admin-booking-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(0, 0, 0, .75);
        }

        .admin-booking-modal {
          width: 100%;
          max-width: 520px;
          max-height: 85vh;
          overflow-y: auto;
          padding: 24px;
          border: 1px solid #3a3d49;
          border-radius: 14px;
          background: #191b22;
          color: #fff;
          box-shadow: 0 20px 60px rgba(0, 0, 0, .45);
        }

        .admin-booking-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .admin-booking-modal-header h2 {
          margin: 0;
          font-size: 21px;
        }

        .admin-booking-close {
          border: 0;
          border-radius: 6px;
          padding: 7px 11px;
          background: #343640;
          color: #fff;
          cursor: pointer;
        }

        .admin-booking-detail {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid #30323c;
          font-size: 13px;
        }

        .admin-booking-detail span:first-child {
          color: #a6a6b0;
        }

        .admin-booking-detail span:last-child {
          text-align: right;
          overflow-wrap: anywhere;
        }

        .admin-booking-modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        @media (max-width: 600px) {
          .admin-bookings-page {
            padding: 18px;
          }

          .admin-bookings-header h1 {
            font-size: 23px;
          }
        }
      `}</style>

      <div className="admin-bookings-header">
        <div>
          <h1>Manage Bookings</h1>
          <p>View and manage customer movie bookings.</p>
        </div>

        <button
          className="admin-bookings-button"
          onClick={fetchBookings}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Bookings"}
        </button>
      </div>

      <input
        className="admin-bookings-search"
        type="text"
        placeholder="Search booking, customer, movie, theatre..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error && (
        <div className="admin-bookings-message admin-bookings-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="admin-bookings-message">
          Loading bookings...
        </div>
      ) : (
        <div className="admin-bookings-table-wrapper">
          {filteredBookings.length === 0 ? (
            <div className="admin-bookings-empty">
              {bookings.length === 0
                ? "No bookings found."
                : "No bookings match your search."}
            </div>
          ) : (
            <table className="admin-bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Movie</th>
                  <th>Theatre</th>
                  <th>Show ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((booking, index) => {
                  const id = booking.id || booking._id;
                  const status = String(
                    booking.status || "pending"
                  ).toLowerCase();

                  return (
                    <tr key={id || index}>
                      <td>{booking.bookingId || id || "—"}</td>
                      <td>{booking.customerName || "—"}</td>
                      <td>{booking.movieTitle || "—"}</td>
                      <td>{booking.theatreName || "—"}</td>
                      <td>{booking.showId || "—"}</td>
                      <td>{booking.date || "—"}</td>
                      <td>{booking.time || "—"}</td>
                      <td>
                        {Array.isArray(booking.seats)
                          ? booking.seats.join(", ")
                          : booking.seats || "—"}
                      </td>
                      <td>{formatAmount(booking.totalAmount)}</td>
                      <td>
                        <span className={statusClass(status)}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <div className="admin-booking-actions">
                          <button
                            className="admin-action-button view"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            View
                          </button>

                          {status === "pending" && id && (
                            <button
                              className="admin-action-button confirm"
                              onClick={() => confirmBooking(booking)}
                              disabled={updatingId === id}
                            >
                              {updatingId === id
                                ? "Updating..."
                                : "Confirm"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      <p style={{ color: "#999", marginTop: 18, fontSize: 12 }}>
        Total bookings: {bookings.length} | Showing:{" "}
        {filteredBookings.length}
      </p>

      {selectedBooking && (
        <div
          className="admin-booking-modal-backdrop"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="admin-booking-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-booking-modal-header">
              <h2>Booking Details</h2>
              <button
                className="admin-booking-close"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>

            {[
              ["Booking ID", selectedBooking.bookingId || selectedBooking.id],
              ["Customer", selectedBooking.customerName],
              ["Movie", selectedBooking.movieTitle],
              ["Theatre", selectedBooking.theatreName],
              ["Show ID", selectedBooking.showId],
              ["Date", selectedBooking.date],
              ["Time", selectedBooking.time],
              [
                "Seats",
                Array.isArray(selectedBooking.seats)
                  ? selectedBooking.seats.join(", ")
                  : selectedBooking.seats,
              ],
              ["Amount", formatAmount(selectedBooking.totalAmount)],
              ["Status", selectedBooking.status],
            ].map(([label, value]) => (
              <div className="admin-booking-detail" key={label}>
                <span>{label}</span>
                <span>{value || "—"}</span>
              </div>
            ))}

            {String(selectedBooking.status).toLowerCase() === "pending" && (
              <div className="admin-booking-modal-actions">
                <button
                  className="admin-action-button confirm"
                  onClick={() => confirmBooking(selectedBooking)}
                  disabled={
                    updatingId ===
                    (selectedBooking.id || selectedBooking._id)
                  }
                >
                  {updatingId ? "Updating..." : "Confirm Booking"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookings;