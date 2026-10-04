
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
    screenType: "standard",
    totalSeats: "",
    rows: "",
    seatsPerRow: "",
    status: "active",
  });

  // ========================================
  // FETCH SCREENS AND THEATRES
  // ========================================

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [screensResult, theatresResult] =
        await Promise.allSettled([
          api.get("/screens"),
          api.get("/theatres"),
        ]);

      // Screens are essential for this page.
      if (screensResult.status === "rejected") {
        throw screensResult.reason;
      }

      const screenData = screensResult.value.data;

      const screenList = Array.isArray(screenData)
        ? screenData
        : screenData?.screens || [];

      setScreens(screenList);

      // Load theatres separately.
      if (theatresResult.status === "fulfilled") {
        const theatreData = theatresResult.value.data;

        const theatreList = Array.isArray(theatreData)
          ? theatreData
          : theatreData?.theatres || [];

        setTheatres(theatreList);
      } else {
        console.error(
          "THEATRE LOAD ERROR:",
          theatresResult.reason.response?.data ||
            theatresResult.reason
        );

        setTheatres([]);
        setError(
          "Screens loaded, but theatres could not be loaded."
        );
      }
    } catch (err) {
      console.error(
        "ADMIN SCREEN LOAD ERROR:",
        err.response?.data || err
      );

      setScreens([]);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load screen management data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    fetchData();
  }, []);

  // ========================================
  // HANDLE INPUT
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

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
      theatre: "",
      screenType: "standard",
      totalSeats: "",
      rows: "",
      seatsPerRow: "",
      status: "active",
    });

    setEditingId(null);
    setError("");
  };

  // ========================================
  // GENERATE ROW LABELS
  // ========================================

  const generateRows = (count) => {
    return Array.from(
      { length: count },
      (_, index) => {
        let label = "";
        let number = index + 1;

        while (number > 0) {
          number--;

          label =
            String.fromCharCode(65 + (number % 26)) +
            label;

          number = Math.floor(number / 26);
        }

        return label;
      }
    );
  };

  // ========================================
  // CREATE / UPDATE SCREEN
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.theatre ||
      !form.rows ||
      !form.seatsPerRow
    ) {
      setError("Please fill all required screen details.");
      return;
    }

    const rowCount = Number(form.rows);
    const seatsPerRow = Number(form.seatsPerRow);

    if (
      !Number.isInteger(rowCount) ||
      !Number.isInteger(seatsPerRow) ||
      rowCount <= 0 ||
      seatsPerRow <= 0
    ) {
      setError("Rows and seats per row must be positive whole numbers.");
      return;
    }

    const calculatedSeats = rowCount * seatsPerRow;

    if (calculatedSeats > 5000) {
      setError("The seating capacity is too large.");
      return;
    }

    const rowLabels = generateRows(rowCount);

    const payload = {
      name: form.name.trim(),
      theatre: form.theatre,
      screenType: form.screenType.toLowerCase(),
      totalSeats: calculatedSeats,
      rows: rowLabels,
      seatsPerRow: seatsPerRow,
      status: form.status,
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(
          `/screens/${editingId}`,
          payload
        );

        setSuccess("Screen updated successfully.");
      } else {
        await api.post("/screens", payload);

        setSuccess("Screen created successfully.");
      }

      resetForm();

      await fetchData();
    } catch (err) {
      console.error(
        "ADMIN SCREEN SAVE ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save screen."
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // EDIT SCREEN
  // ========================================

  const handleEdit = (screen) => {
    setEditingId(screen.id);

    const theatreId =
      typeof screen.theatre === "object"
        ? screen.theatre?.id || ""
        : screen.theatre || "";

    setForm({
      name: screen.name || "",
      theatre: theatreId,
      screenType: (
        screen.screenType || "standard"
      ).toLowerCase(),
      totalSeats: screen.totalSeats || "",
      rows: Array.isArray(screen.rows)
        ? screen.rows.length
        : screen.rows || "",
      seatsPerRow: screen.seatsPerRow || "",
      status: screen.status || "active",
    });

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ========================================
  // DELETE SCREEN
  // ========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this screen?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/screens/${id}`);

      setSuccess("Screen deleted successfully.");

      if (editingId === id) {
        resetForm();
      }

      await fetchData();
    } catch (err) {
      console.error(
        "ADMIN SCREEN DELETE ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete screen."
      );
    }
  };

  // ========================================
  // GET THEATRE DETAILS
  // ========================================

  const getTheatre = (screen) => {
    if (
      screen.theatre &&
      typeof screen.theatre === "object"
    ) {
      return screen.theatre;
    }

    return theatres.find(
      (item) =>
        String(item.id) === String(screen.theatre)
    );
  };

  const getTheatreName = (screen) => {
    return getTheatre(screen)?.name || "—";
  };

  const getTheatreCity = (screen) => {
    return getTheatre(screen)?.city || "";
  };

  // ========================================
  // FORMAT ROW COUNT
  // ========================================

  const getRowCount = (rows) => {
    if (Array.isArray(rows)) {
      return rows.length;
    }

    return Number(rows) || 0;
  };

  // ========================================
  // RENDER
  // ========================================

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
                  Manage cinema screens, seating capacity
                  and layouts.
                </p>
              </div>
            </div>
          </div>

          <div className="screen-total-card">
            <span>{screens.length}</span>

            <small>Total Screens</small>
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
                {editingId ? "EDIT SCREEN" : "CREATE SCREEN"}
              </span>

              <h2>
                {editingId ? "Update Screen" : "Add New Screen"}
              </h2>

              <p>
                Configure the theatre screen and its seating
                capacity.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                className="screen-cancel-button"
                onClick={resetForm}
                disabled={saving}
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
                  Screen Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: Screen 1"
                  disabled={saving}
                  required
                />
              </div>

              {/* THEATRE */}

              <div className="screen-field screen-field-large">
                <label>
                  Theatre <span>*</span>
                </label>

                <select
                  name="theatre"
                  value={form.theatre}
                  onChange={handleChange}
                  disabled={saving}
                  required
                >
                  <option value="">
                    Select Theatre
                  </option>

                  {theatres.map((theatre) => (
                    <option
                      key={theatre.id}
                      value={theatre.id}
                    >
                      {theatre.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SCREEN TYPE */}

              <div className="screen-field">
                <label>Screen Type</label>

                <select
                  name="screenType"
                  value={form.screenType}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="standard">Standard</option>
                  <option value="imax">IMAX</option>
                  <option value="4dx">4DX</option>
                  <option value="dolby atmos">Dolby Atmos</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              {/* TOTAL SEATS */}

              <div className="screen-field">
                <label>
                  Total Seats <span>*</span>
                </label>

                <input
                  type="number"
                  name="totalSeats"
                  value={
                    form.rows && form.seatsPerRow
                      ? Number(form.rows) *
                        Number(form.seatsPerRow)
                      : ""
                  }
                  readOnly
                  placeholder="Calculated automatically"
                  disabled={saving}
                />
              </div>

              {/* ROWS */}

              <div className="screen-field">
                <label>
                  Number of Rows <span>*</span>
                </label>

                <input
                  type="number"
                  name="rows"
                  value={form.rows}
                  onChange={handleChange}
                  min="1"
                  max="200"
                  placeholder="Example: 7"
                  disabled={saving}
                  required
                />
              </div>

              {/* SEATS PER ROW */}

              <div className="screen-field">
                <label>
                  Seats Per Row <span>*</span>
                </label>

                <input
                  type="number"
                  name="seatsPerRow"
                  value={form.seatsPerRow}
                  onChange={handleChange}
                  min="1"
                  max="200"
                  placeholder="Example: 8"
                  disabled={saving}
                  required
                />
              </div>

              {/* STATUS */}

              <div className="screen-field">
                <label>Status</label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
                  <span>Seating Capacity</span>

                  <strong>
                    {form.rows && form.seatsPerRow
                      ? Number(form.rows) *
                        Number(form.seatsPerRow)
                      : 0}{" "}
                    seats
                  </strong>
                </div>
              </div>

              <button
                type="submit"
                className="screen-submit-button"
                disabled={saving || theatres.length === 0}
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

        {/* SCREEN INVENTORY */}

        <section className="screen-list-card">
          <div className="screen-list-header">
            <div>
              <span className="screen-card-label">
                SCREEN INVENTORY
              </span>

              <h2>All Cinema Screens</h2>

              <p>
                View and manage all screens across your theatres.
              </p>
            </div>

            <button
              type="button"
              className="screen-refresh-button"
              onClick={fetchData}
              disabled={loading}
            >
              ↻ {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="screen-loading">
              Loading screens...
            </div>
          ) : screens.length === 0 ? (
            /* EMPTY */

            <div className="screen-empty">
              <div className="screen-empty-icon">
                🎬
              </div>

              <h3>No Screens Found</h3>

              <p>
                Create your first cinema screen using the
                form above.
              </p>
            </div>
          ) : (
            /* TABLE */

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
                  {screens.map((screen) => (
                    <tr key={screen.id}>
                      {/* SCREEN */}

                      <td>
                        <div className="screen-name-cell">
                          <div className="screen-number-icon">
                            🎬
                          </div>

                          <div>
                            <strong>{screen.name}</strong>

                            <small>
                              ID:{" "}
                              {screen.id
                                ? screen.id.slice(-6)
                                : "N/A"}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* THEATRE */}

                      <td>
                        <div className="screen-theatre-cell">
                          <strong>
                            {getTheatreName(screen)}
                          </strong>

                          <small>
                            {getTheatreCity(screen)}
                          </small>
                        </div>
                      </td>

                      {/* TYPE */}

                      <td>
                        <span className="screen-type-badge">
                          {screen.screenType || "Standard"}
                        </span>
                      </td>

                      {/* CAPACITY */}

                      <td>
                        <div className="screen-capacity">
                          <strong>
                            {screen.totalSeats || 0}
                          </strong>

                          <span>seats</span>
                        </div>
                      </td>

                      {/* LAYOUT */}

                      <td>
                        <div className="screen-layout">
                          <strong>
                            {getRowCount(screen.rows)} ×{" "}
                            {screen.seatsPerRow || 0}
                          </strong>

                          <small>Rows × Seats</small>
                        </div>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`screen-status ${
                            screen.status === "inactive"
                              ? "inactive"
                              : "active"
                          }`}
                        >
                          <span className="screen-status-dot" />

                          {screen.status === "inactive"
                            ? "Inactive"
                            : "Active"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div className="screen-actions">
                          <button
                            type="button"
                            className="screen-edit-button"
                            onClick={() => handleEdit(screen)}
                            disabled={saving}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="screen-delete-button"
                            onClick={() =>
                              handleDelete(screen.id)
                            }
                            disabled={saving}
                          >
                            Delete
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

export default AdminScreens;