const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Show = require("../models/Show");

/* =========================================================
   SEAT TYPE
   A-D  = Standard
   E-F  = Premium
   G-H  = Recliner
   ========================================================= */

const getSeatType = (seat) => {
  if (!seat || typeof seat !== "string") {
    return null;
  }

  const row = seat
    .charAt(0)
    .toUpperCase();

  if (
    ["A", "B", "C", "D"].includes(row)
  ) {
    return "standard";
  }

  if (
    ["E", "F"].includes(row)
  ) {
    return "premium";
  }

  if (
    ["G", "H"].includes(row)
  ) {
    return "recliner";
  }

  return null;
};

/* =========================================================
   GET SEAT PRICE
   ========================================================= */

const getSeatPrice = (show, seat) => {
  const seatType = getSeatType(seat);

  if (!seatType) {
    return null;
  }

  const price =
    show?.seatPrices?.[seatType] ??
    show?.[`${seatType}Price`] ??
    (
      seatType === "standard"
        ? 230
        : seatType === "premium"
        ? 300
        : 380
    );

  return Number(price);
};

/* =========================================================
   CREATE BOOKING
   POST /api/bookings
   ========================================================= */

const createBooking = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const {
      movieId,
      showId,
      seats,
    } = req.body;

    /* -----------------------------------------------------
       BASIC VALIDATION
       ----------------------------------------------------- */

    if (!movieId) {
      return res.status(400).json({
        message: "Movie ID is required.",
      });
    }

    if (!showId) {
      return res.status(400).json({
        message: "Show ID is required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        showId
      )
    ) {
      return res.status(400).json({
        message: "Invalid show ID.",
      });
    }

    if (
      !Array.isArray(seats) ||
      seats.length === 0
    ) {
      return res.status(400).json({
        message:
          "Please select at least one seat.",
      });
    }

    /* -----------------------------------------------------
       MAXIMUM 8 SEATS
       ----------------------------------------------------- */

    if (seats.length > 8) {
      return res.status(400).json({
        message:
          "You can book a maximum of 8 seats.",
      });
    }

    /* -----------------------------------------------------
       CLEAN SEAT NUMBERS
       ----------------------------------------------------- */

    const cleanedSeats = [
      ...new Set(
        seats
          .map((seat) =>
            String(seat)
              .trim()
              .toUpperCase()
          )
          .filter(Boolean)
      ),
    ];

    if (
      cleanedSeats.length === 0
    ) {
      return res.status(400).json({
        message:
          "No valid seats were selected.",
      });
    }

    if (
      cleanedSeats.length > 8
    ) {
      return res.status(400).json({
        message:
          "You can book a maximum of 8 seats.",
      });
    }

    /* -----------------------------------------------------
       VALIDATE SEAT FORMAT
       ----------------------------------------------------- */

    for (const seat of cleanedSeats) {
      if (
        !/^[A-H](10|[1-9])$/.test(
          seat
        )
      ) {
        return res.status(400).json({
          message:
            `Invalid seat number: ${seat}`,
        });
      }

      if (!getSeatType(seat)) {
        return res.status(400).json({
          message:
            `Invalid seat type: ${seat}`,
        });
      }
    }

    /* -----------------------------------------------------
       LOAD SHOW
       ----------------------------------------------------- */

    const show = await Show.findById(
      showId
    )
      .populate("movie")
      .populate("theatre")
      .populate("screen");

    if (!show) {
      return res.status(404).json({
        message: "Show not found.",
      });
    }

    /* -----------------------------------------------------
       CHECK SHOW STATUS
       ----------------------------------------------------- */

    if (
      show.isActive === false
    ) {
      return res.status(400).json({
        message:
          "This show is no longer available.",
      });
    }

    /* -----------------------------------------------------
       CHECK MOVIE MATCH
       ----------------------------------------------------- */

    const showMovieId =
      show?.movie?._id ||
      show?.movie;

    if (
      showMovieId &&
      String(showMovieId) !==
        String(movieId)
    ) {
      return res.status(400).json({
        message:
          "Selected movie does not match the show.",
      });
    }

    /* -----------------------------------------------------
       CHECK ALREADY BOOKED SEATS
       ----------------------------------------------------- */

    const existingBookings =
      await Booking.find({
        showId: showId,
        status: "confirmed",
        seats: {
          $in: cleanedSeats,
        },
      }).select("seats bookingId");

    const alreadyBooked = [];

    existingBookings.forEach(
      (booking) => {
        booking.seats.forEach(
          (seat) => {
            if (
              cleanedSeats.includes(
                String(seat).toUpperCase()
              )
            ) {
              if (
                !alreadyBooked.includes(
                  String(seat).toUpperCase()
                )
              ) {
                alreadyBooked.push(
                  String(seat).toUpperCase()
                );
              }
            }
          }
        );
      }
    );

    if (
      alreadyBooked.length > 0
    ) {
      return res.status(409).json({
        message:
          "Some selected seats are already booked.",
        bookedSeats:
          alreadyBooked,
      });
    }

    /* -----------------------------------------------------
       CALCULATE PRICE ON SERVER
       ----------------------------------------------------- */

    let totalAmount = 0;

    for (const seat of cleanedSeats) {
      const seatPrice =
        getSeatPrice(
          show,
          seat
        );

      if (
        seatPrice === null ||
        Number.isNaN(seatPrice)
      ) {
        return res.status(400).json({
          message:
            `Unable to calculate price for seat ${seat}.`,
        });
      }

      totalAmount += seatPrice;
    }

    /* -----------------------------------------------------
       MOVIE INFORMATION
       ----------------------------------------------------- */

    const movieTitle =
      show?.movie?.title ||
      show?.movieTitle ||
      "Movie";

    /* -----------------------------------------------------
       THEATRE INFORMATION
       ----------------------------------------------------- */

    const theatreName =
      show?.theatre?.name ||
      show?.theatreName ||
      "Theatre";

    /* -----------------------------------------------------
       SCREEN INFORMATION
       ----------------------------------------------------- */

    const screenName =
      show?.screen?.name ||
      show?.screenName ||
      "Screen";

    /* -----------------------------------------------------
       DATE
       ----------------------------------------------------- */

    const bookingDate =
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

    /* -----------------------------------------------------
       TIME
       ----------------------------------------------------- */

    const bookingTime =
      show?.time ||
      show?.startTime ||
      "";

    /* -----------------------------------------------------
       GENERATE CUSTOM BOOKING ID
       ----------------------------------------------------- */

    const bookingId =
      `CB${Date.now()}${Math.floor(
        1000 + Math.random() * 9000
      )}`;

    /* -----------------------------------------------------
       CREATE BOOKING
       ----------------------------------------------------- */

    const booking =
      await Booking.create({
        user: userId,

        movieId:
          String(movieId),

        showId:
          show._id,

        movieTitle:
          movieTitle,

        theatre:
          theatreName,

        date:
          bookingDate,

        time:
          bookingTime,

        seats:
          cleanedSeats,

        amount:
          totalAmount,

        status:
          "confirmed",

        bookingId:
          bookingId,
      });

    /* -----------------------------------------------------
       RESPONSE
       ----------------------------------------------------- */

    return res.status(201).json({
      message:
        "Booking created successfully.",

      booking: {
        _id:
          booking._id,

        bookingId:
          booking.bookingId,

        user:
          booking.user,

        movieId:
          booking.movieId,

        showId:
          booking.showId,

        movieTitle:
          booking.movieTitle,

        theatre:
          booking.theatre,

        screen:
          screenName,

        date:
          booking.date,

        time:
          booking.time,

        seats:
          booking.seats,

        amount:
          booking.amount,

        status:
          booking.status,

        createdAt:
          booking.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "CREATE BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to create booking.",
      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =========================================================
   GET MY BOOKINGS
   GET /api/bookings/my
   ========================================================= */

const getMyBookings = async (
  req,
  res
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        message:
          "Authentication required.",
      });
    }

    const bookings =
      await Booking.find({
        user: userId,
      })
        .sort({
          createdAt: -1,
        })
        .populate({
          path: "showId",
          populate: [
            {
              path: "movie",
            },
            {
              path: "theatre",
            },
            {
              path: "screen",
            },
          ],
        });

    return res.status(200).json({
      bookings,
    });
  } catch (error) {
    console.error(
      "GET MY BOOKINGS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load bookings.",
    });
  }
};

/* =========================================================
   GET BOOKING BY ID
   GET /api/bookings/:id
   Supports:
   - Custom bookingId: CB...
   - MongoDB _id
   ========================================================= */

const getBookingById = async (
  req,
  res
) => {
  try {
    const userId = req.user?._id;
    const id = req.params.id;

    if (!userId) {
      return res.status(401).json({
        message:
          "Authentication required.",
      });
    }

    if (!id) {
      return res.status(400).json({
        message:
          "Booking ID is required.",
      });
    }

    let booking = null;

    /* -----------------------------------------------------
       CUSTOM BOOKING ID
       ----------------------------------------------------- */

    booking =
      await Booking.findOne({
        bookingId: id,
        user: userId,
      }).populate({
        path: "showId",
        populate: [
          {
            path: "movie",
          },
          {
            path: "theatre",
          },
          {
            path: "screen",
          },
        ],
      });

    /* -----------------------------------------------------
       MONGODB _id FALLBACK
       ----------------------------------------------------- */

    if (
      !booking &&
      mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      booking =
        await Booking.findOne({
          _id: id,
          user: userId,
        }).populate({
          path: "showId",
          populate: [
            {
              path: "movie",
            },
            {
              path: "theatre",
            },
            {
              path: "screen",
            },
          ],
        });
    }

    if (!booking) {
      return res.status(404).json({
        message:
          "Booking not found.",
      });
    }

    return res.status(200).json({
      booking,
    });
  } catch (error) {
    console.error(
      "GET BOOKING ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load booking.",
    });
  }
};

/* =========================================================
   GET BOOKED SEATS
   GET /api/bookings/seats/:showId
   ========================================================= */

const getBookedSeats = async (
  req,
  res
) => {
  try {
    const { showId } =
      req.params;

    if (
      !showId ||
      !mongoose.Types.ObjectId.isValid(
        showId
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid show ID.",
      });
    }

    const bookings =
      await Booking.find({
        showId: showId,
        status: "confirmed",
      }).select("seats");

    const bookedSeats = [];

    bookings.forEach(
      (booking) => {
        if (
          Array.isArray(
            booking.seats
          )
        ) {
          booking.seats.forEach(
            (seat) => {
              const normalizedSeat =
                String(
                  seat
                ).toUpperCase();

              if (
                !bookedSeats.includes(
                  normalizedSeat
                )
              ) {
                bookedSeats.push(
                  normalizedSeat
                );
              }
            }
          );
        }
      }
    );

    return res.status(200).json({
      seats: bookedSeats,
      bookedSeats: bookedSeats,
    });
  } catch (error) {
    console.error(
      "GET BOOKED SEATS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load booked seats.",
    });
  }
};

/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  getBookedSeats,
};