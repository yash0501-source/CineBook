import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">

        <Link to="/" className="navbar-logo">
          CINE<span>BOOK</span>
        </Link>

        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/movies">Movies</Link>
          <Link to="/bookings">My Bookings</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;