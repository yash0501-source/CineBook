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

  // ========================================
  // DEMO PAYMENT DETAILS
  // These are kept only in React state.
  // They are NOT sent to the backend.
  // ========================================

  const [upiId, setUpiId] = useState("");

  const [cardNumber, setCardNumber] =
    useState("");

  const [cardHolderName, setCardHolderName] =
    useState("");

  const [cardExpiry, setCardExpiry] =
    useState("");

  const [cardCvv, setCardCvv] =
    useState("");

  const [bankName, setBankName] =
    useState("");

  const [customerId, setCustomerId] =
    useState("");

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
          VALIDATE SHOW
        */
        if (!finalShowId) {
          setError(
            "Show information is missing."
          );
          setLoading(false);
          return;
        }

        /*
          VALIDATE SEATS
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
          SAVE IDs
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
          SAVE SEATS
        */
        setSelectedSeats(seats);

        /*
          SAVE TOTAL
        */
        setTotalAmount(savedTotal);

        /*
          LOAD SHOW
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
          RECOVER MOVIE ID
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
    CONVERT SEAT TO STRING
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
    FORMAT CARD NUMBER
  */
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

  /*
    FORMAT CARD EXPIRY
  */
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

  /*
    VALIDATE PAYMENT DETAILS

    IMPORTANT:
    These details are for the simulated
    payment interface only.
  */
  const validatePaymentDetails = () => {
    setError("");

    /*
      UPI
    */
    if (paymentMethod === "UPI") {
      if (!upiId.trim()) {
        setError(
          "Please enter a demo UPI ID."
        );
        return false;
      }

      if (
        !upiId.includes("@") ||
        upiId.trim().length < 5
      ) {
        setError(
          "Please enter a valid demo UPI ID, for example demo@upi."
        );
        return false;
      }

      return true;
    }

    /*
      CARD
    */
    if (paymentMethod === "Card") {
      const cleanCardNumber =
        cardNumber.replace(/\s/g, "");

      if (
        cleanCardNumber.length !== 16
      ) {
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

      if (
        !/^\d{2}\/\d{2}$/.test(
          cardExpiry
        )
      ) {
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

    /*
      NET BANKING
    */
    if (
      paymentMethod ===
      "Net Banking"
    ) {
      if (!bankName) {
        setError(
          "Please select a bank."
        );
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
        VALIDATE SELECTED PAYMENT FORM
      */
      if (!validatePaymentDetails()) {
        return;
      }

      /*
        CONVERT SEATS
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
        SAVE BOOKING DATA
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
        JSON.stringify(seatNumbers)
      );

      localStorage.setItem(
        "cinebookSeatTotal",
        String(totalAmount)
      );

      /*
        STEP 1
        CREATE BOOKING

        IMPORTANT:
        We intentionally send only
        paymentMethod to your existing
        backend.
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

        {/* HEADER */}

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

        {/* ERROR */}

        {error && (
          <div className="payment-error">
            {error}
          </div>
        )}

        {/* BOOKING SUMMARY */}

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

        {/* PAYMENT METHODS */}

        {show &&
          selectedSeats.length > 0 && (
            <div className="payment-method-section">

              <h2>
                Select Payment Method
              </h2>

              <div className="payment-methods">

                {/* UPI */}

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

                {/* CARD */}

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

                {/* NET BANKING */}

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

              {/* ========================================
                  UPI DETAILS
              ======================================== */}

              {paymentMethod ===
                "UPI" && (
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
                    Demo payment only. Do not
                    enter a real UPI credential.
                  </div>

                </div>
              )}

              {/* ========================================
                  CARD DETAILS
              ======================================== */}

              {paymentMethod ===
                "Card" && (
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
                      value={
                        cardHolderName
                      }
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
                    Demo card only. Never enter
                    your real card details.
                  </div>

                </div>
              )}

              {/* ========================================
                  NET BANKING DETAILS
              ======================================== */}

              {paymentMethod ===
                "Net Banking" && (
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
                    Demo banking only. No real
                    banking password is requested.
                  </div>

                </div>
              )}

              {/* PAY BUTTON */}

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