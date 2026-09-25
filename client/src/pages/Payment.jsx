import { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const [show, setShow] = useState(null);
  const [movieId, setMovieId] = useState("");
  const [showId, setShowId] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const [paymentMethod, setPaymentMethod] =
    useState("UPI");

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  /*
    LOAD PAYMENT DATA
  */
  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        setLoading(true);
        setError("");

        const state = location.state || {};

        /*
          SHOW ID
        */
        const finalShowId =
          state.showId ||
          state.show?._id ||
          state.show?.id ||
          localStorage.getItem(
            "cinebookShowId"
          );

        /*
          MOVIE ID
        */
        const finalMovieId =
          state.movieId ||
          state.show?.movie?._id ||
          state.show?.movie?.id ||
          state.show?.movieId ||
          localStorage.getItem(
            "cinebookMovieId"
          );

        /*
          SELECTED SEATS

          Priority:
          1. Navigation state
          2. LocalStorage
        */
        let seats =
          state.selectedSeats ||
          state.seats;

        if (
          !Array.isArray(seats) ||
          seats.length === 0
        ) {
          try {
            seats = JSON.parse(
              localStorage.getItem(
                "cinebookSelectedSeats"
              ) || "[]"
            );
          } catch {
            seats = [];
          }
        }

        /*
          TOTAL AMOUNT

          IMPORTANT:
          Use the total calculated by
          SeatSelection instead of
          recalculating it here.
        */
        let savedTotal = 0;

        if (
          state.totalAmount !== undefined &&
          state.totalAmount !== null
        ) {
          savedTotal = Number(
            state.totalAmount
          );
        }

        if (
          !savedTotal ||
          savedTotal <= 0
        ) {
          savedTotal = Number(
            localStorage.getItem(
              "cinebookSeatTotal"
            ) || 0
          );
        }

        /*
          Validate show
        */
        if (!finalShowId) {
          setError(
            "Show information is missing."
          );
          setLoading(false);
          return;
        }

        /*
          Validate seats
        */
        if (
          !Array.isArray(seats) ||
          seats.length === 0
        ) {
          setError(
            "No seats selected."
          );
          setLoading(false);
          return;
        }

        /*
          Save IDs
        */
        setShowId(
          String(finalShowId)
        );

        localStorage.setItem(
          "cinebookShowId",
          String(finalShowId)
        );

        if (finalMovieId) {
          setMovieId(
            String(finalMovieId)
          );

          localStorage.setItem(
            "cinebookMovieId",
            String(finalMovieId)
          );
        }

        /*
          Save seats exactly as selected
        */
        setSelectedSeats(seats);

        /*
          Save exact total
        */
        setTotalAmount(savedTotal);

        /*
          LOAD SHOW

          The show is loaded only for
          displaying movie/theatre/date/time.
        */
        const response = await api.get(
          `/shows/${finalShowId}`
        );

        const showData =
          response.data?.show ||
          response.data?.data;

        if (!showData) {
          setError(
            "Unable to load show information."
          );
          setLoading(false);
          return;
        }

        setShow(showData);

        /*
          If movie ID was missing,
          recover it from backend show.
        */
        if (!finalMovieId) {
          const backendMovieId =
            showData.movie?._id ||
            showData.movie?.id ||
            showData.movieId;

          if (backendMovieId) {
            setMovieId(
              String(backendMovieId)
            );

            localStorage.setItem(
              "cinebookMovieId",
              String(backendMovieId)
            );
          }
        }
      } catch (err) {
        console.error(
          "PAYMENT DATA ERROR:",
          err.response?.data || err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load payment information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPaymentData();
  }, [location.state]);

  /*
    Convert seat to string
  */
  const getSeatNumber = (seat) => {
    if (typeof seat === "string") {
      return seat;
    }

    return (
      seat?.seatNumber ||
      seat?.number ||
      seat?.name ||
      ""
    );
  };

  /*
    CREATE BOOKING + PAYMENT
  */
  const handlePayment = async () => {
    try {
      setError("");

      /*
        CHECK LOGIN
      */
      const token =
        localStorage.getItem(
          "cinebookToken"
        );

      if (!token) {
        setError(
          "Please login before making a payment."
        );

        navigate("/login", {
          state: {
            from: "/payment",
          },
        });

        return;
      }

      /*
        MOVIE ID
      */
      const finalMovieId =
        movieId ||
        show?.movie?._id ||
        show?.movie?.id ||
        show?.movieId ||
        localStorage.getItem(
          "cinebookMovieId"
        );

      if (!finalMovieId) {
        setError(
          "Movie ID required. Please go back and select the movie again."
        );
        return;
      }

      /*
        SHOW ID
      */
      const finalShowId =
        showId ||
        show?._id ||
        localStorage.getItem(
          "cinebookShowId"
        );

      if (!finalShowId) {
        setError(
          "Show information is missing."
        );
        return;
      }

      /*
        SEATS
      */
      if (
        !Array.isArray(selectedSeats) ||
        selectedSeats.length === 0
      ) {
        setError(
          "Please select at least one seat."
        );
        return;
      }

      /*
        TOTAL
      */
      if (
        !totalAmount ||
        Number(totalAmount) <= 0
      ) {
        setError(
          "Unable to calculate the booking amount."
        );
        return;
      }

      /*
        CONVERT SEATS TO STRINGS
      */
      const seatNumbers =
        selectedSeats
          .map(getSeatNumber)
          .filter(Boolean)
          .map((seat) =>
            String(seat).toUpperCase()
          );

      if (
        seatNumbers.length === 0
      ) {
        setError(
          "No valid seats selected."
        );
        return;
      }

      setPaying(true);

      /*
        SAVE EXACT BOOKING DATA
      */
      localStorage.setItem(
        "cinebookMovieId",
        String(finalMovieId)
      );

      localStorage.setItem(
        "cinebookShowId",
        String(finalShowId)
      );

      localStorage.setItem(
        "cinebookSelectedSeats",
        JSON.stringify(
          seatNumbers
        )
      );

      localStorage.setItem(
        "cinebookSeatTotal",
        String(totalAmount)
      );

      /*
        STEP 1
        CREATE BOOKING
      */
      const bookingResponse =
        await api.post(
          "/bookings",
          {
            movieId:
              String(finalMovieId),

            show:
              String(finalShowId),

            showId:
              String(finalShowId),

            seats:
              seatNumbers,

            amount:
              Number(totalAmount),

            totalAmount:
              Number(totalAmount),

            paymentMethod:
              paymentMethod,
          }
        );

      const booking =
        bookingResponse.data
          ?.booking ||
        bookingResponse.data
          ?.data;

      if (!booking) {
        throw new Error(
          "Booking was not created."
        );
      }

      /*
        BOOKING ID
      */
      const bookingId =
        booking.bookingId ||
        booking._id;

      if (!bookingId) {
        throw new Error(
          "Booking ID was not returned."
        );
      }

      /*
        STEP 2
        SIMULATED PAYMENT
      */
      const paymentResponse =
        await api.post(
          "/payments",
          {
            bookingId:
              String(bookingId),

            paymentMethod:
              paymentMethod,
          }
        );

      /*
        STEP 3
        SAVE COMPLETE BOOKING
      */
      localStorage.setItem(
        "cinebookLastBookingId",
        String(bookingId)
      );

      localStorage.setItem(
        "cinebookLastBooking",
        JSON.stringify(booking)
      );

      if (
        paymentResponse.data
          ?.payment
      ) {
        localStorage.setItem(
          "cinebookLastPayment",
          JSON.stringify(
            paymentResponse.data
              .payment
          )
        );
      }

      /*
        STEP 4
        CONFIRMATION
      */
      navigate(
        "/confirmation",
        {
          state: {
            booking:
              booking,

            bookingId:
              String(bookingId),

            payment:
              paymentResponse
                .data
                ?.payment || null,

            show:
              show,

            seats:
              seatNumbers,

            selectedSeats:
              seatNumbers,

            paymentMethod:
              paymentMethod,

            totalAmount:
              Number(totalAmount),

            movieId:
              String(finalMovieId),

            showId:
              String(finalShowId),
          },
        }
      );
    } catch (err) {
      console.error(
        "PAYMENT ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data
          ?.message ||
          err.message ||
          "Payment failed. Please try again."
      );
    } finally {
      setPaying(false);
    }
  };

  /*
    LOADING
  */
  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <h1>
            Complete Payment
          </h1>

          <p>
            Loading your booking...
          </p>
        </div>
      </div>
    );
  }

  /*
    PAYMENT PAGE
  */
  return (
    <div className="payment-page">
      <div className="payment-container">

        <div className="payment-header">
          <p className="section-label">
            CINEBOOK
          </p>

          <h1>
            Complete Payment
          </h1>

          <p>
            Review your booking before
            confirming.
          </p>
        </div>

        {error && (
          <div className="payment-error">
            {error}
          </div>
        )}

        {show && (
          <div className="payment-summary">

            <div className="payment-movie">
              <div>
                <span>
                  Movie
                </span>

                <strong>
                  {show.movie?.title ||
                    show.movieTitle ||
                    "Movie"}
                </strong>
              </div>
            </div>

            <div className="payment-details">

              <div>
                <span>
                  Theatre
                </span>

                <strong>
                  {show.theatre?.name ||
                    show.theatreName ||
                    "Theatre"}
                </strong>
              </div>

              <div>
                <span>
                  Date
                </span>

                <strong>
                  {show.date
                    ? new Date(
                        show.date
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "Date"}
                </strong>
              </div>

              <div>
                <span>
                  Time
                </span>

                <strong>
                  {show.time ||
                    show.startTime ||
                    "Time"}
                </strong>
              </div>

              <div>
                <span>
                  Seats
                </span>

                <strong>
                  {selectedSeats
                    .map(
                      getSeatNumber
                    )
                    .filter(Boolean)
                    .join(", ")}
                </strong>
              </div>

            </div>

            <div className="payment-total">
              <span>
                Total Amount
              </span>

              <strong>
                ₹{Number(totalAmount)}
              </strong>
            </div>

          </div>
        )}

        {show &&
          selectedSeats.length > 0 && (
            <div className="payment-method-section">

              <h2>
                Select Payment Method
              </h2>

              <div className="payment-methods">

                <button
                  type="button"
                  className={
                    paymentMethod ===
                    "UPI"
                      ? "payment-method active"
                      : "payment-method"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "UPI"
                    )
                  }
                >
                  <strong>
                    UPI
                  </strong>

                  <span>
                    Google Pay / PhonePe /
                    Paytm
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    paymentMethod ===
                    "Card"
                      ? "payment-method active"
                      : "payment-method"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "Card"
                    )
                  }
                >
                  <strong>
                    Card
                  </strong>

                  <span>
                    Credit / Debit Card
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    paymentMethod ===
                    "Net Banking"
                      ? "payment-method active"
                      : "payment-method"
                  }
                  onClick={() =>
                    setPaymentMethod(
                      "Net Banking"
                    )
                  }
                >
                  <strong>
                    Net Banking
                  </strong>

                  <span>
                    Internet Banking
                  </span>
                </button>

              </div>

              <button
                type="button"
                className="pay-button"
                onClick={
                  handlePayment
                }
                disabled={paying}
              >
                {paying
                  ? "Processing Payment..."
                  : `Pay ₹${Number(
                      totalAmount
                    )}`}
              </button>

              <p className="payment-note">
                This is a simulated payment
                for the CineBook project.
                No real money will be
                charged.
              </p>

            </div>
          )}

      </div>
    </div>
  );
}

export default Payment;