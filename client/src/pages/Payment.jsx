import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const [show, setShow] = useState(null);
  const [movieId, setMovieId] = useState("");
  const [showId, setShowId] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const [movieDetails, setMovieDetails] = useState(null);
  const [theatreDetails, setTheatreDetails] = useState(null);

  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [bankName, setBankName] = useState("");
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    const loadPaymentData = async () => {
      try {
        setLoading(true);
        setError("");

        const state = location.state || {};

        const finalShowId =
          state.showId ||
          state.show?.id ||
          state.show?._id ||
          localStorage.getItem("cinebookShowId");

        const finalMovieId =
          state.movieId ||
          state.show?.movie?.id ||
          state.show?.movie?._id ||
          state.show?.movieId ||
          localStorage.getItem("cinebookMovieId");

        let seats = state.selectedSeats || state.seats;

        if (!Array.isArray(seats) || seats.length === 0) {
          try {
            seats = JSON.parse(
              localStorage.getItem("cinebookSelectedSeats") || "[]"
            );
          } catch {
            seats = [];
          }
        }

        let savedTotal = 0;

        if (
          state.totalAmount !== undefined &&
          state.totalAmount !== null
        ) {
          savedTotal = Number(state.totalAmount);
        }

        if (!savedTotal || savedTotal <= 0) {
          savedTotal = Number(
            localStorage.getItem("cinebookSeatTotal") || 0
          );
        }

        if (!finalShowId) {
          setError("Show information is missing.");
          return;
        }

        if (!Array.isArray(seats) || seats.length === 0) {
          setError("No seats selected.");
          return;
        }

        setShowId(String(finalShowId));

        localStorage.setItem(
          "cinebookShowId",
          String(finalShowId)
        );

        if (finalMovieId) {
          setMovieId(String(finalMovieId));

          localStorage.setItem(
            "cinebookMovieId",
            String(finalMovieId)
          );
        }

        setSelectedSeats(seats);
        setTotalAmount(savedTotal);

        const response = await api.get(
          `/shows/${finalShowId}`
        );

        const showData =
          response.data?.show ||
          response.data?.data ||
          response.data;

        if (!showData) {
          setError("Unable to load show information.");
          return;
        }

        setShow(showData);

        const backendMovieId =
          showData.movie?.id ||
          showData.movie?._id ||
          showData.movieId ||
          showData.movie;

        if (!finalMovieId && backendMovieId) {
          setMovieId(String(backendMovieId));

          localStorage.setItem(
            "cinebookMovieId",
            String(backendMovieId)
          );
        }

        const movieIdToLoad =
          finalMovieId || backendMovieId;

        if (movieIdToLoad) {
          try {
            const movieResponse = await api.get(
              `/movies/${movieIdToLoad}`
            );

            const movieData =
              movieResponse.data?.movie ||
              movieResponse.data?.data ||
              movieResponse.data;

            if (movieData) {
              setMovieDetails(movieData);
            }
          } catch (movieError) {
            console.warn(
              "MOVIE DETAILS ERROR:",
              movieError
            );
          }
        }

        const theatreId =
          showData.theatre?.id ||
          showData.theatre?._id ||
          showData.theatreId ||
          showData.theatre;

        if (theatreId) {
          try {
            const theatreResponse = await api.get(
              `/theatres/${theatreId}`
            );

            const theatreData =
              theatreResponse.data?.theatre ||
              theatreResponse.data?.data ||
              theatreResponse.data;

            if (theatreData) {
              setTheatreDetails(theatreData);
            }
          } catch (theatreError) {
            console.warn(
              "THEATRE DETAILS ERROR:",
              theatreError
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

  const handleCardNumberChange = (event) => {
    let value = event.target.value;

    value = value
      .replace(/\D/g, "")
      .slice(0, 16);

    value = value
      .replace(/(.{4})/g, "$1 ")
      .trim();

    setCardNumber(value);
  };

  const handleCardExpiryChange = (event) => {
    let value = event.target.value;

    value = value
      .replace(/\D/g, "")
      .slice(0, 4);

    if (value.length > 2) {
      value =
        value.slice(0, 2) +
        "/" +
        value.slice(2);
    }

    setCardExpiry(value);
  };

  const validatePaymentDetails = () => {
    setError("");

    if (paymentMethod === "UPI") {
      const cleanUpi = upiId.trim();

      if (!cleanUpi) {
        setError("Please enter a demo UPI ID.");
        return false;
      }

      if (!cleanUpi.includes("@")) {
        setError("Please enter a valid demo UPI ID.");
        return false;
      }

      return true;
    }

    if (paymentMethod === "Card") {
      const cleanCardNumber =
        cardNumber.replace(/\s/g, "");

      if (cleanCardNumber.length !== 16) {
        setError(
          "Please enter a 16-digit demo card number."
        );
        return false;
      }

      if (!cardHolderName.trim()) {
        setError(
          "Please enter the card holder name."
        );
        return false;
      }

      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setError(
          "Please enter expiry in MM/YY format."
        );
        return false;
      }

      if (!/^\d{3}$/.test(cardCvv)) {
        setError(
          "Please enter a 3-digit demo CVV."
        );
        return false;
      }

      return true;
    }

    if (paymentMethod === "Net Banking") {
      if (!bankName) {
        setError("Please select a bank.");
        return false;
      }

      if (!customerId.trim()) {
        setError(
          "Please enter a demo customer ID."
        );
        return false;
      }

      return true;
    }

    return true;
  };

  const handlePayment = async () => {
    try {
      setError("");

      const finalMovieId =
        movieId ||
        show?.movie?.id ||
        show?.movie?._id ||
        show?.movieId ||
        show?.movie ||
        localStorage.getItem("cinebookMovieId");

      const finalShowId =
        showId ||
        show?.id ||
        show?._id ||
        localStorage.getItem("cinebookShowId");

      const finalTheatreId =
        show?.theatre?.id ||
        show?.theatre?._id ||
        show?.theatreId ||
        show?.theatre ||
        "";

      if (!finalMovieId) {
        setError("Movie information is missing.");
        return;
      }

      if (!finalShowId) {
        setError("Show information is missing.");
        return;
      }

      if (!finalTheatreId) {
        setError("Theatre information is missing.");
        return;
      }

      if (
        !Array.isArray(selectedSeats) ||
        selectedSeats.length === 0
      ) {
        setError(
          "Please select at least one seat."
        );
        return;
      }

      if (
        !totalAmount ||
        Number(totalAmount) <= 0
      ) {
        setError(
          "Unable to calculate booking amount."
        );
        return;
      }

      if (!validatePaymentDetails()) {
        return;
      }

      const seatNumbers = selectedSeats
        .map(getSeatNumber)
        .filter(Boolean)
        .map((seat) =>
          String(seat).toUpperCase()
        );

      if (seatNumbers.length === 0) {
        setError("No valid seats selected.");
        return;
      }

      setPaying(true);
      const savedUser = JSON.parse(
    localStorage.getItem("cinebookUser") || "null"
);

const loggedInUserId = savedUser?.id || savedUser?._id;

if (!loggedInUserId) {
    setError("Please log in again before booking.");
    return;
}

      const bookingResponse = await api.post(
        "/bookings",
        {
          showId: String(finalShowId),
          movieId: String(finalMovieId),
          theatreId: String(finalTheatreId),
         userId: String(loggedInUserId),
          seats: seatNumbers,
          totalAmount: Number(totalAmount)
        }
      );

      const booking =
        bookingResponse.data?.booking;

      if (!booking) {
        throw new Error(
          "Booking was not created."
        );
      }

      const bookingId =
        booking.bookingId ||
        booking.id ||
        booking._id;

      if (!bookingId) {
        throw new Error(
          "Booking ID was not returned."
        );
      }

      localStorage.setItem(
        "cinebookLastBookingId",
        String(bookingId)
      );

      localStorage.setItem(
        "cinebookLastBooking",
        JSON.stringify(booking)
      );

      localStorage.setItem(
        "cinebookSelectedSeats",
        JSON.stringify(seatNumbers)
      );

      localStorage.setItem(
        "cinebookSeatTotal",
        String(totalAmount)
      );

      const payment = {
        paymentMethod: paymentMethod,
        status: "simulated",
        amount: Number(totalAmount)
      };

      localStorage.setItem(
        "cinebookLastPayment",
        JSON.stringify(payment)
      );

      navigate("/confirmation", {
        state: {
          booking: booking,
          bookingId: String(bookingId),
          payment: payment,
          show: show,
          seats: seatNumbers,
          selectedSeats: seatNumbers,
          paymentMethod: paymentMethod,
          totalAmount: Number(totalAmount),
          movieId: String(finalMovieId),
          showId: String(finalShowId)
        }
      });
    } catch (err) {
      console.error(
        "BOOKING ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
        err.message ||
        "Booking failed. Please try again."
      );
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <h1>Complete Payment</h1>
          <p>Loading your booking...</p>
        </div>
      </div>
    );
  }

  const movieTitle =
    movieDetails?.title ||
    show?.movie?.title ||
    show?.movieTitle ||
    "Movie";

  const theatreName =
    theatreDetails?.name ||
    show?.theatre?.name ||
    show?.theatreName ||
    "Theatre";

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
                  {movieTitle}
                </strong>
              </div>

            </div>

            <div className="payment-details">

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
                  {show.date
                    ? new Date(
                        show.date
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
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
                    show.showTime ||
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
                    .map(getSeatNumber)
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
                  paymentMethod === "UPI"
                    ? "payment-method active"
                    : "payment-method"
                }
                onClick={() =>
                  setPaymentMethod("UPI")
                }
              >

                <strong>
                  UPI
                </strong>

                <span>
                  Google Pay / PhonePe / Paytm
                </span>

              </button>

              <button
                type="button"
                className={
                  paymentMethod === "Card"
                    ? "payment-method active"
                    : "payment-method"
                }
                onClick={() =>
                  setPaymentMethod("Card")
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
                  paymentMethod === "Net Banking"
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

            {paymentMethod === "UPI" && (

              <div className="payment-form">

                <div className="payment-form-header">

                  <h3>
                    UPI Payment
                  </h3>

                  <p>
                    Enter your UPI ID
                    for this demo payment.
                  </p>

                </div>

                <div className="payment-field">

                  <label>
                    UPI ID
                  </label>

                  <input
                    type="text"
                    value={upiId}
                    onChange={(event) =>
                      setUpiId(
                        event.target.value
                      )
                    }
                    placeholder="demo@upi"
                    autoComplete="off"
                  />

                  <small>
                    Example: demo@upi
                  </small>

                </div>

                <div className="demo-payment-note">
                  Demo payment only.
                  Do not enter a real
                  UPI credential.
                </div>

              </div>

            )}

            {paymentMethod === "Card" && (

              <div className="payment-form">

                <div className="payment-form-header">

                  <h3>
                    Credit / Debit Card
                  </h3>

                  <p>
                    Enter demo card details
                    to simulate payment.
                  </p>

                </div>

                <div className="payment-field">

                  <label>
                    Card Number
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={
                      handleCardNumberChange
                    }
                    placeholder="4111 1111 1111 1111"
                    autoComplete="off"
                  />

                </div>

                <div className="payment-field">

                  <label>
                    Card Holder Name
                  </label>

                  <input
                    type="text"
                    value={cardHolderName}
                    onChange={(event) =>
                      setCardHolderName(
                        event.target.value
                      )
                    }
                    placeholder="DEMO USER"
                    autoComplete="off"
                  />

                </div>

                <div className="payment-form-row">

                  <div className="payment-field">

                    <label>
                      Expiry Date
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardExpiry}
                      onChange={
                        handleCardExpiryChange
                      }
                      placeholder="MM/YY"
                      autoComplete="off"
                    />

                  </div>

                  <div className="payment-field">

                    <label>
                      CVV
                    </label>

                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength="3"
                      value={cardCvv}
                      onChange={(event) =>
                        setCardCvv(
                          event.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      placeholder="123"
                      autoComplete="off"
                    />

                  </div>

                </div>

                <div className="demo-payment-note">
                  Demo card only.
                  Never enter real card
                  details.
                </div>

              </div>

            )}

            {paymentMethod === "Net Banking" && (

              <div className="payment-form">

                <div className="payment-form-header">

                  <h3>
                    Net Banking
                  </h3>

                  <p>
                    Select a bank and enter
                    demo customer details.
                  </p>

                </div>

                <div className="payment-field">

                  <label>
                    Select Bank
                  </label>

                  <select
                    value={bankName}
                    onChange={(event) =>
                      setBankName(
                        event.target.value
                      )
                    }
                  >

                    <option value="">
                      Select your bank
                    </option>

                    <option value="State Bank of India">
                      State Bank of India
                    </option>

                    <option value="HDFC Bank">
                      HDFC Bank
                    </option>

                    <option value="ICICI Bank">
                      ICICI Bank
                    </option>

                    <option value="Axis Bank">
                      Axis Bank
                    </option>

                    <option value="Kotak Mahindra Bank">
                      Kotak Mahindra Bank
                    </option>

                    <option value="Punjab National Bank">
                      Punjab National Bank
                    </option>

                    <option value="Bank of Baroda">
                      Bank of Baroda
                    </option>

                  </select>

                </div>

                <div className="payment-field">

                  <label>
                    Customer ID
                  </label>

                  <input
                    type="text"
                    value={customerId}
                    onChange={(event) =>
                      setCustomerId(
                        event.target.value
                      )
                    }
                    placeholder="DEMO12345"
                    autoComplete="off"
                  />

                </div>

                <div className="demo-payment-note">
                  Demo banking only.
                  No real banking password
                  is requested.
                </div>

              </div>

            )}

            <button
              type="button"
              className="pay-button"
              onClick={handlePayment}
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