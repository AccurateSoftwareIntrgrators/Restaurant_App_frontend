import { useEffect, useState } from "react";
import axios from "axios";
import FormField from "../../Helper/FormField";

const API = import.meta.env.VITE_API_URL;

type CategoryData = {
  id: number;
  name: string;
  description: string | null;
};

type CategoryForm = {
  name: string;
  description: string;
};

const initialState: CategoryForm = { name: "", description: "" };

const InventoryCategoryPage = () => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [form, setForm] = useState<CategoryForm>(initialState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get<CategoryData[]>(`${API}/inventory-categories`);
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching inventory categories:", err);
        setError("Could not load inventory categories");
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
    if (!name) return;
    const payload = { name, description: form.description.trim() || null };

    try {
      if (editingId !== null) {
        await axios.patch(`${API}/inventory-categories/${editingId}`, payload);
      } else {
        await axios.post(`${API}/inventory-categories`, payload);
      }
      resetForm();
      reload();
    } catch (err) {
      showError(err);
    }
  };

  const handleEdit = (item: CategoryData) => {
    setEditingId(item.id);
    setForm({ name: item.name, description: item.description ?? "" });
    setError("");
  };

  const handleDelete = async (item: CategoryData) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    setError("");

    try {
      await axios.delete(`${API}/inventory-categories/${item.id}`);
      if (editingId === item.id) resetForm();
      reload();
    } catch (err) {
      showError(err); // e.g. "Category is used by 12 inventory item(s)"
    }
  };

  return (
    <div>
      <h2>Inventory Categories</h2>

      <form onSubmit={handleSubmit}>
        <FormField label="Category name" id="name" name="name" placeholder="e.g. Vegetables"
          value={form.name} onChange={handleChange} required />

        <FormField label="Description" id="description" name="description"
          placeholder="Optional description" value={form.description} onChange={handleChange} />

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
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan={4}>No inventory categories yet</td>
            </tr>
          ) : (
            categories.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.description}</td>
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

export default InventoryCategoryPage;