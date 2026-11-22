import { useEffect, useState } from "react";
import axios from "axios";
import FormField from "../../Helper/FormField";

const API = import.meta.env.VITE_API_URL;

type UnitData = {
  id: number;
  name: string;
  abbreviation: string;
};

type UnitForm = {
  name: string;
  abbreviation: string;
};

const initialState: UnitForm = { name: "", abbreviation: "" };

const UnitPage = () => {
  const [units, setUnits] = useState<UnitData[]>([]);
  const [form, setForm] = useState<UnitForm>(initialState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get<UnitData[]>(`${API}/units`);
        setUnits(res.data);
      } catch (err) {
        console.error("Error fetching units:", err);
        setError("Could not load units");
      }
    };
    load();
  }, [reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  const showError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } else {
      setError("Something went wrong");
    }
  };

  const resetForm = () => {
    setForm(initialState);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const name = form.name.trim();
    const abbreviation = form.abbreviation.trim();
    if (!name || !abbreviation) return;

    try {
      if (editingId !== null) {
        await axios.patch(`${API}/units/${editingId}`, { name, abbreviation });
      } else {
        await axios.post(`${API}/units`, { name, abbreviation });
      }
      resetForm();
      reload();
    } catch (err) {
      showError(err);
    }
  };

  const handleEdit = (item: UnitData) => {
    setEditingId(item.id);
    setForm({ name: item.name, abbreviation: item.abbreviation });
    setError("");
  };

  const handleDelete = async (item: UnitData) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    setError("");

    try {
      await axios.delete(`${API}/units/${item.id}`);
      if (editingId === item.id) resetForm();
      reload();
    } catch (err) {
      showError(err); // e.g. "Unit is used by 30 inventory item(s)"
    }
  };

  return (
    <div>
      <h2>Units</h2>

      <form onSubmit={handleSubmit}>
        <FormField label="Unit name" id="name" name="name" placeholder="e.g. Kilogram"
          value={form.name} onChange={handleChange} required />

        <FormField label="Abbreviation" id="abbreviation" name="abbreviation" placeholder="e.g. kg"
          value={form.abbreviation} onChange={handleChange} required />

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
            <th>Abbreviation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {units.length === 0 ? (
            <tr>
              <td colSpan={4}>No units yet</td>
            </tr>
          ) : (
            units.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.abbreviation}</td>
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

export default UnitPage;