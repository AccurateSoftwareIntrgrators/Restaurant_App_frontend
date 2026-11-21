import axios from "axios";
import { useEffect, useState } from "react";
import FormField from "../../Helper/FormField";

const API = import.meta.env.VITE_API_URL;

type PositionType = {
  id: number;
  name: string;
  description: string;
};

const Position = () => {
  const [positions, setPositions] = useState<PositionType[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const showError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } else {
      setError("Something went wrong");
    }
  };

  const fetchPositions = async () => {
    try {
      const res = await axios.get<PositionType[]>(`${API}/positions`);
      setPositions(res.data);
    } catch (err) {
      console.error("Error fetching positions:", err);
      showError(err);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const handleEdit = (position: PositionType) => {
    setError("");
    setEditingId(position.id);
    setName(position.name);
    setDescription(position.description);
  };

  const handleDelete = async (id: number) => {
    setError("");
    try {
      await axios.delete(`${API}/positions/${id}`);
      if (editingId === id) resetForm();
      fetchPositions();
    } catch (err) {
      console.error("Error deleting position:", err);
      showError(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const payload = {
      name: name.trim(),
      description: description.trim(),
    };
    if (!payload.name || !payload.description) return;

    try {
      if (editingId !== null) {
        await axios.patch(`${API}/positions/${editingId}`, payload);
      } else {
        await axios.post(`${API}/positions`, payload);
      }
      resetForm();
      fetchPositions();
    } catch (err) {
      console.error("Error adding/updating position:", err);
      showError(err);
    }
  };

  return (
    <div>
      <div>
        <h1>Positions</h1>
      </div>

      <div>
        <form onSubmit={handleSubmit}>
          <FormField
            label="Position Name"
            type="text"
            id="name"
            name="name"
            placeholder="Enter position name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FormField
            label="Position Description"
            type="text"
            id="description"
            name="description"
            placeholder="Enter position description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit">
            {editingId !== null ? "Update Position" : "Add Position"}
          </button>
          {editingId !== null && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <h2>Existing Positions</h2>
        <ul>
          {positions.map((position) => (
            <li key={position.id}>
              <strong>{position.name}</strong>: {position.description}
              <button onClick={() => handleEdit(position)}>Edit</button>
              <button onClick={() => handleDelete(position.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Position;