import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:3001";

type LocationData = {
  id: number;
  name: string;
};

const LocationPage = () => {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchLocations = async () => {
    try {
      const res = await axios.get<LocationData[]>(`${API}/locations`);
      setLocations(res.data);
    } catch (err) {
      console.error("Error fetching locations:", err);
      setError("Could not load locations");
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const showError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } else {
      setError("Something went wrong");
    }
  };

  const resetForm = () => {
    setName("");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      if (editingId !== null) {
        await axios.put(`${API}/locations/${editingId}`, { name: trimmed });
      } else {
        await axios.post(`${API}/locations`, { name: trimmed });
      }
      resetForm();
      fetchLocations();
    } catch (err) {
      showError(err);
    }
  };

  const handleEdit = (item: LocationData) => {
    setEditingId(item.id);
    setName(item.name);
    setError("");
  };

  const handleDelete = async (item: LocationData) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    setError("");

    try {
      await axios.delete(`${API}/locations/${item.id}`);
      if (editingId === item.id) resetForm();
      fetchLocations();
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div>
      <h2>Locations</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Location name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter location name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">{editingId !== null ? "Update" : "Add"}</button>
        {editingId !== null && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.length === 0 ? (
            <tr>
              <td colSpan={3}>No locations yet</td>
            </tr>
          ) : (
            locations.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => handleDelete(item)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LocationPage;