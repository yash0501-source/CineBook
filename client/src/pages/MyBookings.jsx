
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function MyBookings() {
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

            const savedUser = JSON.parse(
                localStorage.getItem("cinebookUser") || "null"
            );

            const userId = savedUser?.id || savedUser?._id;

            if (!userId) {
                setError("Please log in again to view your bookings.");
                return;
            }

            const response = await api.get("/bookings/my", {
                params: {
                    userId: String(userId).trim()
                }
            });

            console.log("MY BOOKINGS RESPONSE:", response.data);

            const result = response.data?.bookings;

            setBookings(Array.isArray(result) ? result : []);

        } catch (err) {
            console.error("MY BOOKINGS ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load your bookings. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="my-bookings-page">
                <h1>My Bookings</h1>
                <p>Loading your bookings...</p>
            </div>
        );
    }

    return (
        <div className="my-bookings-page">
            <h1>My Bookings</h1>

            <p>
                View your confirmed movie bookings and digital tickets.
            </p>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={loadBookings}>
                        Try Again
                    </button>
                </div>
            )}

            {!error && bookings.length === 0 && (
                <div className="empty-bookings">
                    <h2>No bookings yet</h2>
                    <p>
                        Your confirmed movie bookings will appear here.
                    </p>

                    <Link to="/movies">
                        Browse Movies
                    </Link>
                </div>
            )}

            {!error && bookings.length > 0 && (
                <div className="bookings-list">
                    {bookings.map((booking) => {
                        const bookingId =
                            booking.bookingId || booking.id || booking._id;

                        return (
                            <div
                                className="booking-card"
                                key={bookingId}
                            >
                                <h2>
                                    {booking.movieTitle || "Movie Booking"}
                                </h2>

                                <p>
                                    <strong>Booking ID:</strong>{" "}
                                    {bookingId || "Not available"}
                                </p>

                                <p>
                                    <strong>Theatre:</strong>{" "}
                                    {booking.theatre || "Not available"}
                                </p>

                                <p>
                                    <strong>Date:</strong>{" "}
                                    {booking.date || "Not available"}
                                </p>

                                <p>
                                    <strong>Time:</strong>{" "}
                                    {booking.time || "Not available"}
                                </p>

                                <p>
                                    <strong>Seats:</strong>{" "}
                                    {Array.isArray(booking.seats)
                                        ? booking.seats.join(", ")
                                        : "Not available"}
                                </p>

                                <p>
                                    <strong>Amount:</strong>{" "}
                                    ₹{booking.totalAmount ?? booking.amount ?? 0}
                                </p>

                                <p>
                                    <strong>Status:</strong>{" "}
                                    {booking.status || "Unknown"}
                                </p>

                                {bookingId && (
                                    <Link
                                        to={`/ticket?bookingId=${encodeURIComponent(
                                            bookingId
                                        )}`}
                                    >
                                        View Digital Ticket
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default MyBookings;