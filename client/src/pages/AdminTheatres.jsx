import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./AdminTheatres.css";

function AdminTheatres() {
  const [theatres, setTheatres] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    facilities: "",
    status: "active",
  });

  // ========================================
  // FETCH THEATRES
  // ========================================

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/theatres");

      setTheatres(response.data?.theatres || []);
    } catch (error) {
      console.error(
        "GET THEATRES ERROR:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load theatres."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    fetchTheatres();
  }, []);

  // ========================================
  // HANDLE INPUT
  // ========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ========================================
  // RESET FORM
  // ========================================

  const resetForm = () => {
    setForm({
      name: "",
      city: "",
      address: "",
      facilities: "",
      status: "active",
    });

    setEditingId(null);
  };

  // ========================================
  // CREATE / UPDATE
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Theatre name is required.");
      return;
    }

    if (!form.city.trim()) {
      setError("City is required.");
      return;
    }

    if (!form.address.trim()) {
      setError("Address is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        city: form.city.trim(),
        address: form.address.trim(),

        facilities: form.facilities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        status: form.status,
      };

      if (editingId) {
        const response = await api.put(
          `/admin/theatres/${editingId}`,
          payload
        );

        setSuccess(
          response.data?.message ||
            "Theatre updated successfully."
        );
      } else {
        const response = await api.post(
          "/admin/theatres",
          payload
        );

        setSuccess(
          response.data?.message ||
            "Theatre created successfully."
        );
      }

      resetForm();
      await fetchTheatres();
    } catch (error) {
      console.error(
        "SAVE THEATRE ERROR:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save theatre."
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // EDIT
  // ========================================

  const handleEdit = (theatre) => {
    setEditingId(theatre._id);

    setForm({
      name: theatre.name || "",
      city: theatre.city || "",
      address: theatre.address || "",

      facilities: Array.isArray(theatre.facilities)
        ? theatre.facilities.join(", ")
        : "",

      status: theatre.status || "active",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ========================================
  // DELETE
  // ========================================

  const handleDelete = async (theatreId) => {
    const theatre = theatres.find(
      (item) => item._id === theatreId
    );

    if (!theatre) {
      setError("Theatre not found.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${theatre.name}"?\n\nUnused screens and shows belonging to this theatre will also be deleted.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(theatreId);
      setError("");
      setSuccess("");

      const response = await api.delete(
        `/admin/theatres/${theatreId}`
      );

      setSuccess(
        response.data?.message ||
          "Theatre deleted successfully."
      );

      if (editingId === theatreId) {
        resetForm();
      }

      await fetchTheatres();
    } catch (error) {
      console.error(
        "DELETE THEATRE ERROR:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete theatre."
      );
    } finally {
      setDeletingId("");
    }
  };

  // ========================================
  // STATUS
  // ========================================

  const getStatusClass = (status) => {
    return status === "active"
      ? "theatre-status active"
      : "theatre-status inactive";
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="admin-theatres-page">
      <div className="admin-theatres-container">

        {/* ==================================
            HEADER
        ================================== */}

        <div className="admin-theatres-header">
          <div>
            <Link
              to="/admin"
              className="admin-back-link"
            >
              ← Back to Dashboard
            </Link>

            <h1>Theatre Management</h1>

            <p>
              Manage CineBook theatres, locations
              and facilities.
            </p>
          </div>

          <div className="admin-theatres-count">
            <span>{theatres.length}</span>
            <small>Total Theatres</small>
          </div>
        </div>

        {/* ==================================
            ERROR
        ================================== */}

        {error && (
          <div className="admin-error theatre-error">
            <strong>Action failed</strong>
            <span>{error}</span>
          </div>
        )}

        {/* ==================================
            SUCCESS
        ================================== */}

        {success && (
          <div className="admin-success theatre-success">
            {success}
          </div>
        )}

        {/* ==================================
            CREATE / EDIT FORM
        ================================== */}

        <section className="admin-theatre-form-card">

          <div className="admin-section-heading">
            <div>
              <span className="admin-form-label">
                {editingId
                  ? "EDIT THEATRE"
                  : "CREATE THEATRE"}
              </span>

              <h2>
                {editingId
                  ? "Update Theatre"
                  : "Add New Theatre"}
              </h2>

              <p>
                Enter the theatre information used
                throughout CineBook.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                className="admin-secondary-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            className="admin-theatre-form"
            onSubmit={handleSubmit}
          >

            <div className="admin-theatre-form-grid">

              {/* NAME */}

              <div className="admin-form-group">
                <label htmlFor="theatre-name">
                  Theatre Name
                  <span>*</span>
                </label>

                <input
                  id="theatre-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: CineBook Grand Central"
                  disabled={saving}
                />
              </div>

              {/* CITY */}

              <div className="admin-form-group">
                <label htmlFor="theatre-city">
                  City
                  <span>*</span>
                </label>

                <input
                  id="theatre-city"
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Example: Mumbai"
                  disabled={saving}
                />
              </div>

              {/* ADDRESS */}

              <div className="admin-form-group admin-form-full">
                <label htmlFor="theatre-address">
                  Address
                  <span>*</span>
                </label>

                <input
                  id="theatre-address"
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Example: Lower Parel, Mumbai"
                  disabled={saving}
                />
              </div>

              {/* FACILITIES */}

              <div className="admin-form-group admin-form-full">
                <label htmlFor="theatre-facilities">
                  Facilities
                </label>

                <input
                  id="theatre-facilities"
                  type="text"
                  name="facilities"
                  value={form.facilities}
                  onChange={handleChange}
                  placeholder="IMAX, Dolby Atmos, Parking, Food Court"
                  disabled={saving}
                />

                <small className="admin-form-help">
                  Separate facilities with commas.
                </small>
              </div>

              {/* STATUS */}

              <div className="admin-form-group">
                <label htmlFor="theatre-status">
                  Status
                </label>

                <select
                  id="theatre-status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>

            </div>

            {/* FORM BUTTONS */}

            <div className="admin-theatre-form-footer">

              <button
                type="submit"
                className="admin-primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Theatre"
                  : "Create Theatre"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Clear
                </button>
              )}

            </div>

          </form>
        </section>

        {/* ==================================
            THEATRE LIST
        ================================== */}

        <section className="admin-theatre-list-card">

          <div className="admin-section-heading">
            <div>
              <h2>All Theatres</h2>

              <p>
                View and manage all CineBook
                theatre locations.
              </p>
            </div>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={fetchTheatres}
              disabled={loading || deletingId !== ""}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="admin-loading">
              Loading theatres...
            </div>
          ) : theatres.length === 0 ? (

            /* EMPTY */

            <div className="admin-empty-state">
              <h3>No theatres found</h3>

              <p>
                Add your first theatre using
                the form above.
              </p>
            </div>

          ) : (

            /* TABLE */

            <div className="admin-theatre-table-wrapper">

              <table className="admin-theatre-table">

                <thead>
                  <tr>
                    <th>Theatre</th>
                    <th>City</th>
                    <th>Address</th>
                    <th>Facilities</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {theatres.map((theatre) => (
                    <tr key={theatre._id}>

                      {/* THEATRE */}

                      <td>
                        <div className="admin-theatre-name">

                          <div className="admin-theatre-icon">
                            🎬
                          </div>

                          <div>
                            <strong>
                              {theatre.name}
                            </strong>

                            <small>
                              ID:{" "}
                              {theatre._id
                                ? theatre._id.slice(-6)
                                : "N/A"}
                            </small>
                          </div>

                        </div>
                      </td>

                      {/* CITY */}

                      <td>
                        {theatre.city || "—"}
                      </td>

                      {/* ADDRESS */}

                      <td>
                        <div className="admin-theatre-address">
                          {theatre.address || "—"}
                        </div>
                      </td>

                      {/* FACILITIES */}

                      <td>
                        <div className="admin-facilities">

                          {Array.isArray(
                            theatre.facilities
                          ) &&
                          theatre.facilities.length > 0 ? (

                            theatre.facilities.map(
                              (facility, index) => (
                                <span
                                  key={`${theatre._id}-${index}`}
                                >
                                  {facility}
                                </span>
                              )
                            )

                          ) : (
                            <span>—</span>
                          )}

                        </div>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={getStatusClass(
                            theatre.status
                          )}
                        >
                          <span className="theatre-status-dot"></span>

                          {theatre.status === "active"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div className="admin-theatre-actions">

                          <button
                            type="button"
                            className="admin-edit-button"
                            onClick={() =>
                              handleEdit(theatre)
                            }
                            disabled={
                              deletingId !== ""
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="admin-delete-button"
                            onClick={() =>
                              handleDelete(
                                theatre._id
                              )
                            }
                            disabled={
                              deletingId ===
                              theatre._id
                            }
                          >
                            {deletingId ===
                            theatre._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            </div>
          )}

        </section>

      </div>
    </div>
  );
}

export default AdminTheatres;