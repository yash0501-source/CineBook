import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function AdminScreens() {
  const [screens, setScreens] = useState([]);
  const [theatres, setTheatres] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    theatre: "",
    screenType: "Standard",
    totalSeats: "",
    rows: "",
    seatsPerRow: "",
    status: "active",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [screensResponse, theatresResponse] =
        await Promise.all([
          api.get("/admin/screens"),
          api.get("/admin/theatres"),
        ]);

      setScreens(
        screensResponse.data.screens || []
      );

      setTheatres(
        theatresResponse.data.theatres || []
      );
    } catch (error) {
      console.error(
        "ADMIN SCREEN LOAD ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load screen management data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      theatre: "",
      screenType: "Standard",
      totalSeats: "",
      rows: "",
      seatsPerRow: "",
      status: "active",
    });

    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.name ||
      !form.theatre ||
      !form.totalSeats ||
      !form.rows ||
      !form.seatsPerRow
    ) {
      setError(
        "Please fill all required screen details."
      );

      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name,
        theatre: form.theatre,
        screenType: form.screenType,
        totalSeats: Number(form.totalSeats),
        rows: Number(form.rows),
        seatsPerRow: Number(form.seatsPerRow),
        status: form.status,
      };

      if (editingId) {
        await api.put(
          `/admin/screens/${editingId}`,
          payload
        );

        setSuccess(
          "Screen updated successfully."
        );
      } else {
        await api.post(
          "/admin/screens",
          payload
        );

        setSuccess(
          "Screen created successfully."
        );
      }

      resetForm();

      await fetchData();
    } catch (error) {
      console.error(
        "ADMIN SCREEN SAVE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save screen."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (screen) => {
    setEditingId(screen._id);

    setForm({
      name: screen.name || "",
      theatre:
        screen.theatre?._id ||
        screen.theatre ||
        "",
      screenType:
        screen.screenType || "Standard",
      totalSeats:
        screen.totalSeats || "",
      rows:
        screen.rows || "",
      seatsPerRow:
        screen.seatsPerRow || "",
      status:
        screen.status || "active",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this screen?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/admin/screens/${id}`
      );

      setSuccess(
        "Screen deleted successfully."
      );

      await fetchData();
    } catch (error) {
      console.error(
        "ADMIN SCREEN DELETE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete screen."
      );
    }
  };

  const getTheatreName = (screen) => {
    if (
      screen.theatre &&
      typeof screen.theatre === "object"
    ) {
      return screen.theatre.name;
    }

    const theatre = theatres.find(
      (item) =>
        item._id === screen.theatre
    );

    return theatre?.name || "—";
  };

  const getTheatreCity = (screen) => {
    if (
      screen.theatre &&
      typeof screen.theatre === "object"
    ) {
      return screen.theatre.city;
    }

    const theatre = theatres.find(
      (item) =>
        item._id === screen.theatre
    );

    return theatre?.city || "";
  };

  return (
    <div className="screen-management-page">

      <div className="screen-management-container">

        {/* HEADER */}

        <div className="screen-management-header">

          <div>
            <Link
              to="/admin"
              className="screen-back-link"
            >
              ← Back to Dashboard
            </Link>

            <div className="screen-title-row">
              <div className="screen-title-icon">
                🎬
              </div>

              <div>
                <h1>Screen Management</h1>

                <p>
                  Manage cinema screens,
                  seating capacity and layouts.
                </p>
              </div>
            </div>
          </div>

          <div className="screen-total-card">
            <span>
              {screens.length}
            </span>

            <small>
              Total Screens
            </small>
          </div>

        </div>

        {/* ALERTS */}

        {error && (
          <div className="screen-alert screen-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="screen-alert screen-alert-success">
            {success}
          </div>
        )}

        {/* FORM */}

        <section className="screen-form-card">

          <div className="screen-card-header">

            <div>
              <span className="screen-card-label">
                {editingId
                  ? "EDIT SCREEN"
                  : "CREATE SCREEN"}
              </span>

              <h2>
                {editingId
                  ? "Update Screen"
                  : "Add New Screen"}
              </h2>

              <p>
                Configure the theatre screen
                and its seating capacity.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                className="screen-cancel-button"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}

          </div>

          <form
            className="screen-form"
            onSubmit={handleSubmit}
          >

            <div className="screen-form-grid">

              {/* SCREEN NAME */}

              <div className="screen-field screen-field-large">

                <label>
                  Screen Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: Screen 1"
                />

              </div>

              {/* THEATRE */}

              <div className="screen-field screen-field-large">

                <label>
                  Theatre
                  <span>*</span>
                </label>

                <select
                  name="theatre"
                  value={form.theatre}
                  onChange={handleChange}
                >
                  <option value="">
                    Select Theatre
                  </option>

                  {theatres.map(
                    (theatre) => (
                      <option
                        key={theatre._id}
                        value={theatre._id}
                      >
                        {theatre.name}
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* SCREEN TYPE */}

              <div className="screen-field">

                <label>
                  Screen Type
                </label>

                <select
                  name="screenType"
                  value={form.screenType}
                  onChange={handleChange}
                >
                  <option value="Standard">
                    Standard
                  </option>

                  <option value="IMAX">
                    IMAX
                  </option>

                  <option value="4DX">
                    4DX
                  </option>

                  <option value="Dolby Atmos">
                    Dolby Atmos
                  </option>

                  <option value="Premium">
                    Premium
                  </option>
                </select>

              </div>

              {/* TOTAL SEATS */}

              <div className="screen-field">

                <label>
                  Total Seats
                  <span>*</span>
                </label>

                <input
                  type="number"
                  name="totalSeats"
                  value={form.totalSeats}
                  onChange={handleChange}
                  min="1"
                  placeholder="Example: 120"
                />

              </div>

              {/* ROWS */}

              <div className="screen-field">

                <label>
                  Number of Rows
                  <span>*</span>
                </label>

                <input
                  type="number"
                  name="rows"
                  value={form.rows}
                  onChange={handleChange}
                  min="1"
                  placeholder="Example: 10"
                />

              </div>

              {/* SEATS PER ROW */}

              <div className="screen-field">

                <label>
                  Seats Per Row
                  <span>*</span>
                </label>

                <input
                  type="number"
                  name="seatsPerRow"
                  value={form.seatsPerRow}
                  onChange={handleChange}
                  min="1"
                  placeholder="Example: 12"
                />

              </div>

              {/* STATUS */}

              <div className="screen-field">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
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

            {/* FORM FOOTER */}

            <div className="screen-form-footer">

              <div className="screen-capacity-preview">

                <div className="capacity-icon">
                  💺
                </div>

                <div>
                  <span>
                    Seating Capacity
                  </span>

                  <strong>
                    {form.rows &&
                    form.seatsPerRow
                      ? Number(
                          form.rows
                        ) *
                        Number(
                          form.seatsPerRow
                        )
                      : 0}{" "}
                    seats
                  </strong>
                </div>

              </div>

              <button
                type="submit"
                className="screen-submit-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Screen"
                  : "Create Screen"}
              </button>

            </div>

          </form>

        </section>

        {/* SCREEN LIST */}

        <section className="screen-list-card">

          <div className="screen-list-header">

            <div>
              <span className="screen-card-label">
                SCREEN INVENTORY
              </span>

              <h2>
                All Cinema Screens
              </h2>

              <p>
                View and manage all screens
                across your theatres.
              </p>
            </div>

            <button
              type="button"
              className="screen-refresh-button"
              onClick={fetchData}
              disabled={loading}
            >
              ↻{" "}
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>

          </div>

          {loading ? (
            <div className="screen-loading">
              Loading screens...
            </div>
          ) : screens.length === 0 ? (
            <div className="screen-empty">
              <div className="screen-empty-icon">
                🎬
              </div>

              <h3>
                No Screens Found
              </h3>

              <p>
                Create your first cinema
                screen using the form above.
              </p>
            </div>
          ) : (
            <div className="screen-table-wrapper">

              <table className="screen-table">

                <thead>
                  <tr>
                    <th>Screen</th>
                    <th>Theatre</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Layout</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {screens.map(
                    (screen) => (
                      <tr
                        key={screen._id}
                      >

                        {/* SCREEN */}

                        <td>

                          <div className="screen-name-cell">

                            <div className="screen-number-icon">
                              🎬
                            </div>

                            <div>
                              <strong>
                                {screen.name}
                              </strong>

                              <small>
                                ID:{" "}
                                {screen._id?.slice(
                                  -6
                                )}
                              </small>
                            </div>

                          </div>

                        </td>

                        {/* THEATRE */}

                        <td>

                          <div className="screen-theatre-cell">

                            <strong>
                              {getTheatreName(
                                screen
                              )}
                            </strong>

                            <small>
                              {getTheatreCity(
                                screen
                              )}
                            </small>

                          </div>

                        </td>

                        {/* TYPE */}

                        <td>

                          <span className="screen-type-badge">
                            {screen.screenType ||
                              "Standard"}
                          </span>

                        </td>

                        {/* CAPACITY */}

                        <td>

                          <div className="screen-capacity">

                            <strong>
                              {screen.totalSeats ||
                                0}
                            </strong>

                            <span>
                              seats
                            </span>

                          </div>

                        </td>

                        {/* LAYOUT */}

                        <td>

                          <div className="screen-layout">

                            <strong>
                              {screen.rows ||
                                0}{" "}
                              ×{" "}
                              {screen.seatsPerRow ||
                                0}
                            </strong>

                            <small>
                              Rows × Seats
                            </small>

                          </div>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`screen-status ${
                              screen.status ===
                              "active"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            <span className="screen-status-dot"></span>

                            {screen.status ===
                            "active"
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="screen-actions">

                            <button
                              type="button"
                              className="screen-edit-button"
                              onClick={() =>
                                handleEdit(
                                  screen
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="screen-delete-button"
                              onClick={() =>
                                handleDelete(
                                  screen._id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>

    </div>
  );
}

export default AdminScreens;