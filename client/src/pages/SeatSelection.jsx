import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../services/api";
import "./SeatSelection.css";

function SeatSelection() {
  const { id: movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const showId =
    location.state?.showId ||
    localStorage.getItem("cinebookShowId");

  const [show, setShow] = useState(
    location.state?.show || null
  );

  const [bookedSeats, setBookedSeats] =
    useState([]);

  const [selectedSeats, setSelectedSeats] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =====================================================
     SEAT CONFIGURATION
     ===================================================== */

  const seatRows = [
    {
      row: "A",
      type: "standard",
      label: "Standard",
    },
    {
      row: "B",
      type: "standard",
      label: "Standard",
    },
    {
      row: "C",
      type: "standard",
      label: "Standard",
    },
    {
      row: "D",
      type: "standard",
      label: "Standard",
    },
    {
      row: "E",
      type: "premium",
      label: "Premium",
    },
    {
      row: "F",
      type: "premium",
      label: "Premium",
    },
    {
      row: "G",
      type: "recliner",
      label: "Recliner",
    },
    {
      row: "H",
      type: "recliner",
      label: "Recliner",
    },
  ];

  const seatsPerRow = 10;

  /* =====================================================
     LOAD SHOW + BOOKED SEATS
     ===================================================== */

  useEffect(() => {
    const loadSeatData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!showId) {
          setError(
            "Show information is missing."
          );
          return;
        }

        localStorage.setItem(
          "cinebookShowId",
          showId
        );

        const showResponse =
          await api.get(
            `/shows/${showId}`
          );

        const showData =
          showResponse.data?.show ||
          showResponse.data?.data ||
          showResponse.data;

        if (!showData) {
          setError("Show not found.");
          return;
        }

        setShow(showData);

        const seatsResponse =
          await api.get(
            `/bookings/seats/${showId}`
          );

        const seatsData =
          seatsResponse.data?.seats ||
          seatsResponse.data?.bookedSeats ||
          seatsResponse.data?.data ||
          [];

        const normalizedSeats =
          Array.isArray(seatsData)
            ? seatsData
                .map((seat) => {
                  if (
                    typeof seat === "string"
                  ) {
                    return seat;
                  }

                  return (
                    seat?.seatNumber ||
                    seat?.seat ||
                    seat?.number ||
                    ""
                  );
                })
                .filter(Boolean)
            : [];

        setBookedSeats(
          normalizedSeats
        );
      } catch (err) {
        console.error(
          "SEAT SELECTION ERROR:",
          err.response?.data || err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load seats."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSeatData();
  }, [showId]);

  /* =====================================================
     PRICES
     ===================================================== */

  const prices = useMemo(() => {
    return {
      standard:
        show?.seatPrices?.standard ??
        show?.standardPrice ??
        230,

      premium:
        show?.seatPrices?.premium ??
        show?.premiumPrice ??
        300,

      recliner:
        show?.seatPrices?.recliner ??
        show?.reclinerPrice ??
        380,
    };
  }, [show]);

  /* =====================================================
     GET SEAT PRICE
     ===================================================== */

  const getSeatPrice = (seatNumber) => {
    const row =
      seatNumber.charAt(0);

    const seatRow =
      seatRows.find(
        (item) =>
          item.row === row
      );

    if (!seatRow) {
      return prices.standard;
    }

    return prices[
      seatRow.type
    ];
  };

  /* =====================================================
     TOTAL
     ===================================================== */

  const totalAmount = useMemo(() => {
    return selectedSeats.reduce(
      (total, seat) =>
        total +
        getSeatPrice(seat),
      0
    );
  }, [
    selectedSeats,
    prices,
  ]);

  /* =====================================================
     SEAT STATUS
     ===================================================== */

  const isBooked = (seatNumber) => {
    return bookedSeats.some(
      (seat) =>
        String(seat).toUpperCase() ===
        String(seatNumber).toUpperCase()
    );
  };

  const isSelected = (seatNumber) => {
    return selectedSeats.includes(
      seatNumber
    );
  };

  /* =====================================================
     SELECT SEAT
     ===================================================== */

  const handleSeatClick = (
    seatNumber
  ) => {
    if (isBooked(seatNumber)) {
      return;
    }

    if (
      isSelected(seatNumber)
    ) {
      setSelectedSeats(
        (previous) =>
          previous.filter(
            (seat) =>
              seat !== seatNumber
          )
      );

      return;
    }

    if (
      selectedSeats.length >= 8
    ) {
      alert(
        "You can select a maximum of 8 seats."
      );

      return;
    }

    setSelectedSeats(
      (previous) => [
        ...previous,
        seatNumber,
      ]
    );
  };

  /* =====================================================
     CONTINUE
     ===================================================== */

  const handleContinue = () => {
    if (!showId) {
      setError(
        "Show information is missing."
      );

      return;
    }

    if (
      selectedSeats.length === 0
    ) {
      alert(
        "Please select at least one seat."
      );

      return;
    }

    localStorage.setItem(
      "cinebookShowId",
      showId
    );

    localStorage.setItem(
      "cinebookSelectedSeats",
      JSON.stringify(
        selectedSeats
      )
    );

    localStorage.setItem(
      "cinebookSeatTotal",
      String(totalAmount)
    );

    navigate("/payment", {
      state: {
        showId,
        movieId,
        show,
        selectedSeats,
        totalAmount,
      },
    });
  };

  /* =====================================================
     BACK
     ===================================================== */

  const handleBack = () => {
    navigate(
      `/movies/${movieId}/theatres`
    );
  };

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="seat-selection-page">
        <div className="seat-loading-card">
          <div className="loading-ring" />

          <h2>
            Loading seats
          </h2>

          <p>
            Checking real-time seat
            availability...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
     ===================================================== */

  if (error) {
    return (
      <div className="seat-selection-page">
        <div className="seat-error-card">
          <div className="error-icon">
            !
          </div>

          <h2>
            Unable to load seats
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="seat-back-button"
            onClick={handleBack}
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     SHOW INFORMATION
     ===================================================== */

  const theatre =
    show?.theatre || {};

  const screen =
    show?.screen || {};

  const movie =
    show?.movie || {};

  const movieTitle =
    movie?.title ||
    location.state?.show?.movie
      ?.title ||
    "Movie";

  const showDate =
    show?.date
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
      : "";

  const showTime =
    show?.time ||
    show?.startTime ||
    "";

  return (
    <div className="seat-selection-page">

      <div className="seat-selection-container">

        {/* =================================================
            TOP HEADER
            ================================================= */}

        <header className="seat-page-header">

          <button
            type="button"
            className="seat-back-button"
            onClick={handleBack}
          >
            <span>←</span>
            Back
          </button>

          <div className="seat-brand">
            CINEBOOK
          </div>

          <div className="seat-header-content">

            <div className="seat-eyebrow">
              CHOOSE YOUR EXPERIENCE
            </div>

            <h1>
              Select Your Seats
            </h1>

            <p className="seat-header-description">
              Pick your preferred seats
              for the ultimate cinema
              experience.
            </p>

          </div>

        </header>

        {/* =================================================
            SHOW INFORMATION
            ================================================= */}

        <section className="show-info-card">

          <div className="movie-info">

            <div className="movie-icon">
              🎬
            </div>

            <div>
              <span className="info-label">
                MOVIE
              </span>

              <h2>
                {movieTitle}
              </h2>
            </div>

          </div>

          <div className="show-info-divider" />

          <div className="show-detail">

            <span className="info-label">
              THEATRE
            </span>

            <strong>
              {theatre?.name ||
                "Theatre"}
            </strong>

          </div>

          <div className="show-detail">

            <span className="info-label">
              SCREEN
            </span>

            <strong>
              {screen?.name ||
                "Screen"}
            </strong>

          </div>

          <div className="show-detail">

            <span className="info-label">
              DATE
            </span>

            <strong>
              {showDate}
            </strong>

          </div>

          <div className="show-detail">

            <span className="info-label">
              SHOWTIME
            </span>

            <strong className="gold-text">
              {showTime}
            </strong>

          </div>

        </section>

        {/* =================================================
            CINEMA SCREEN
            ================================================= */}

        <section className="screen-area">

          <div className="screen-glow" />

          <div className="cinema-screen">
            <span>
              SCREEN
            </span>
          </div>

          <p>
            All eyes this way
          </p>

        </section>

        {/* =================================================
            LEGEND
            ================================================= */}

        <div className="seat-legend">

          <div className="legend-item">
            <span className="legend-seat available" />
            <span>Available</span>
          </div>

          <div className="legend-item">
            <span className="legend-seat selected" />
            <span>Selected</span>
          </div>

          <div className="legend-item">
            <span className="legend-seat booked" />
            <span>Booked</span>
          </div>

        </div>

        {/* =================================================
            SEAT AREA
            ================================================= */}

        <section className="seat-area">

          {/* STANDARD */}

          <div className="seat-category standard-category">

            <div className="category-heading">

              <div>
                <span className="category-number">
                  01
                </span>

                <div>
                  <h3>
                    Standard
                  </h3>

                  <p>
                    Comfortable cinema seating
                  </p>
                </div>
              </div>

              <strong>
                ₹{prices.standard}
              </strong>

            </div>

            {seatRows
              .filter(
                (item) =>
                  item.type ===
                  "standard"
              )
              .map(
                ({
                  row,
                  type,
                }) => (
                  <div
                    className="seat-row"
                    key={row}
                  >

                    <span className="row-label">
                      {row}
                    </span>

                    <div className="seat-row-content">

                      {Array.from(
                        {
                          length:
                            seatsPerRow,
                        },
                        (_, index) => {

                          const seatNumber =
                            `${row}${index + 1}`;

                          const booked =
                            isBooked(
                              seatNumber
                            );

                          const selected =
                            isSelected(
                              seatNumber
                            );

                          return (
                            <button
                              key={
                                seatNumber
                              }
                              type="button"
                              disabled={
                                booked
                              }
                              className={[
                                "seat",
                                type,
                                booked
                                  ? "booked"
                                  : "",
                                selected
                                  ? "selected"
                                  : "",
                              ]
                                .filter(
                                  Boolean
                                )
                                .join(
                                  " "
                                )}
                              onClick={() =>
                                handleSeatClick(
                                  seatNumber
                                )
                              }
                              title={
                                booked
                                  ? `${seatNumber} - Booked`
                                  : `${seatNumber} - ₹${prices[type]}`
                              }
                            >
                              {index + 1}
                            </button>
                          );
                        }
                      )}

                    </div>

                    <span className="row-label">
                      {row}
                    </span>

                  </div>
                )
              )}

          </div>

          {/* PREMIUM */}

          <div className="seat-category premium-category">

            <div className="category-heading">

              <div>
                <span className="category-number">
                  02
                </span>

                <div>
                  <h3>
                    Premium
                  </h3>

                  <p>
                    Extra comfort and space
                  </p>
                </div>
              </div>

              <strong>
                ₹{prices.premium}
              </strong>

            </div>

            {seatRows
              .filter(
                (item) =>
                  item.type ===
                  "premium"
              )
              .map(
                ({
                  row,
                  type,
                }) => (
                  <div
                    className="seat-row"
                    key={row}
                  >

                    <span className="row-label">
                      {row}
                    </span>

                    <div className="seat-row-content">

                      {Array.from(
                        {
                          length:
                            seatsPerRow,
                        },
                        (_, index) => {

                          const seatNumber =
                            `${row}${index + 1}`;

                          const booked =
                            isBooked(
                              seatNumber
                            );

                          const selected =
                            isSelected(
                              seatNumber
                            );

                          return (
                            <button
                              key={
                                seatNumber
                              }
                              type="button"
                              disabled={
                                booked
                              }
                              className={[
                                "seat",
                                type,
                                booked
                                  ? "booked"
                                  : "",
                                selected
                                  ? "selected"
                                  : "",
                              ]
                                .filter(
                                  Boolean
                                )
                                .join(
                                  " "
                                )}
                              onClick={() =>
                                handleSeatClick(
                                  seatNumber
                                )
                              }
                              title={
                                booked
                                  ? `${seatNumber} - Booked`
                                  : `${seatNumber} - ₹${prices[type]}`
                              }
                            >
                              {index + 1}
                            </button>
                          );
                        }
                      )}

                    </div>

                    <span className="row-label">
                      {row}
                    </span>

                  </div>
                )
              )}

          </div>

          {/* RECLINER */}

          <div className="seat-category recliner-category">

            <div className="category-heading">

              <div>
                <span className="category-number">
                  03
                </span>

                <div>
                  <h3>
                    Recliner
                  </h3>

                  <p>
                    Premium reclining experience
                  </p>
                </div>
              </div>

              <strong>
                ₹{prices.recliner}
              </strong>

            </div>

            {seatRows
              .filter(
                (item) =>
                  item.type ===
                  "recliner"
              )
              .map(
                ({
                  row,
                  type,
                }) => (
                  <div
                    className="seat-row"
                    key={row}
                  >

                    <span className="row-label">
                      {row}
                    </span>

                    <div className="seat-row-content">

                      {Array.from(
                        {
                          length:
                            seatsPerRow,
                        },
                        (_, index) => {

                          const seatNumber =
                            `${row}${index + 1}`;

                          const booked =
                            isBooked(
                              seatNumber
                            );

                          const selected =
                            isSelected(
                              seatNumber
                            );

                          return (
                            <button
                              key={
                                seatNumber
                              }
                              type="button"
                              disabled={
                                booked
                              }
                              className={[
                                "seat",
                                type,
                                booked
                                  ? "booked"
                                  : "",
                                selected
                                  ? "selected"
                                  : "",
                              ]
                                .filter(
                                  Boolean
                                )
                                .join(
                                  " "
                                )}
                              onClick={() =>
                                handleSeatClick(
                                  seatNumber
                                )
                              }
                              title={
                                booked
                                  ? `${seatNumber} - Booked`
                                  : `${seatNumber} - ₹${prices[type]}`
                              }
                            >
                              {index + 1}
                            </button>
                          );
                        }
                      )}

                    </div>

                    <span className="row-label">
                      {row}
                    </span>

                  </div>
                )
              )}

          </div>

        </section>

        {/* =================================================
            SELECTION
            ================================================= */}

        <section className="selection-card">

          <div className="selection-left">

            <span className="selection-label">
              YOUR SELECTION
            </span>

            <h2>
              {selectedSeats.length === 0
                ? "No seats selected"
                : selectedSeats.join(
                    "  •  "
                  )}
            </h2>

          </div>

          <div className="selection-count">

            <span>
              SEATS
            </span>

            <strong>
              {selectedSeats.length}
              <small>/8</small>
            </strong>

          </div>

        </section>

        {/* =================================================
            BOTTOM SUMMARY
            ================================================= */}

        <section className="booking-summary">

          <div className="booking-summary-info">

            <div>
              <span>
                SELECTED SEATS
              </span>

              <strong>
                {selectedSeats.length}
              </strong>
            </div>

            <div className="summary-divider" />

            <div>
              <span>
                TOTAL AMOUNT
              </span>

              <strong className="summary-price">
                ₹{totalAmount}
              </strong>
            </div>

          </div>

          <button
            type="button"
            className="continue-button"
            disabled={
              selectedSeats.length ===
              0
            }
            onClick={
              handleContinue
            }
          >
            Continue to Payment
            <span>→</span>
          </button>

        </section>

      </div>

    </div>
  );
}

export default SeatSelection;