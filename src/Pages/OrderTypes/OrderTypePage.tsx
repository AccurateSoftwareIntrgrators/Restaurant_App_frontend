import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:3001";

type OrderTypeData = {
  id: number;
  name: string;
};

const OrderTypePage = () => {
  const [orderTypes, setOrderTypes] = useState<OrderTypeData[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchOrderTypes = async () => {
    try {
      const res = await axios.get<OrderTypeData[]>(`${API}/order-types`);
      setOrderTypes(res.data);
    } catch (err) {
      console.error("Error fetching order types:", err);
      setError("Could not load order types");
    }
  };

  useEffect(() => {
    fetchOrderTypes();
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
        await axios.put(`${API}/order-types/${editingId}`, { name: trimmed });
      } else {
        await axios.post(`${API}/order-types`, { name: trimmed });
      }
      resetForm();
      fetchOrderTypes();
    } catch (err) {
      showError(err);
    }
  };

  const handleEdit = (item: OrderTypeData) => {
    setEditingId(item.id);
    setName(item.name);
    setError("");
  };

  const handleDelete = async (item: OrderTypeData) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    setError("");

    try {
      await axios.delete(`${API}/order-types/${item.id}`);
      if (editingId === item.id) resetForm();
      fetchOrderTypes();
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div>
      <h2>Order Types</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Order type name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter order type name"
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
          {orderTypes.length === 0 ? (
            <tr>
              <td colSpan={3}>No order types yet</td>
            </tr>
          ) : (
            orderTypes.map((item) => (
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

export default OrderTypePage;