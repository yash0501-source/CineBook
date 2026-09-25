const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const theatreRoutes = require("./routes/theatreRoutes");
const showRoutes = require("./routes/showRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const adminRoutes = require("./routes/adminRoutes");
const adminMovieRoutes = require("./routes/adminMovieRoutes");
const adminTheatreRoutes = require("./routes/adminTheatreRoutes");
const adminScreenRoutes = require("./routes/adminScreenRoutes");
const adminShowRoutes = require("./routes/adminShowRoutes");
const adminBookingRoutes = require("./routes/adminBookingRoutes");

const app = express();

// =====================================================
// DATABASE
// =====================================================

connectDB();

// =====================================================
// CORS
// =====================================================

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json());

// =====================================================
// MOVIE POSTERS
// =====================================================

app.use(
  "/posters",
  express.static(
    path.join(__dirname, "public", "posters")
  )
);

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

app.use("/api/movies", movieRoutes);

app.use("/api/theatres", theatreRoutes);

app.use("/api/shows", showRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/payments", paymentRoutes);

// =====================================================
// ADMIN ROUTES
// =====================================================

app.use("/api/admin", adminRoutes);

app.use("/api/admin/movies", adminMovieRoutes);

app.use("/api/admin/theatres", adminTheatreRoutes);

app.use("/api/admin/screens", adminScreenRoutes);

app.use("/api/admin/shows", adminShowRoutes);

app.use("/api/admin/bookings", adminBookingRoutes);

// =====================================================
// ROOT API
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CineBook API is running",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CineBook backend is healthy",
    environment: process.env.NODE_ENV || "development",
  });
});

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error("========================================");
  console.error("SERVER ERROR");
  console.error("========================================");
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("========================================");
  console.log("        CINEBOOK SERVER STARTED");
  console.log("========================================");

  console.log(`Server running on port ${PORT}`);

  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);

  console.log(`API: http://localhost:${PORT}`);

  console.log(
    `Health: http://localhost:${PORT}/api/health`
  );

  console.log(
    `Movies API: http://localhost:${PORT}/api/movies`
  );

  console.log(
    `Posters: http://localhost:${PORT}/posters`
  );

  console.log(
    `Admin API: http://localhost:${PORT}/api/admin`
  );

  console.log(
    `Admin Movies API: http://localhost:${PORT}/api/admin/movies`
  );

  console.log(
    `Admin Theatres API: http://localhost:${PORT}/api/admin/theatres`
  );

  console.log(
    `Admin Screens API: http://localhost:${PORT}/api/admin/screens`
  );

  console.log(
    `Admin Shows API: http://localhost:${PORT}/api/admin/shows`
  );

  console.log(
    `Admin Bookings API: http://localhost:${PORT}/api/admin/bookings`
  );

  console.log("========================================");
});