import { useEffect, useState } from "react";
import axios from "axios";
import FormField from "../../Helper/FormField";

const API = import.meta.env.VITE_API_URL;

type FoodTypeData = {
  id: number;
  name: string;
};

const FoodTypePage = () => {
  const [foodTypes, setFoodTypes] = useState<FoodTypeData[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchFoodTypes = async () => {
    try {
      const res = await axios.get<FoodTypeData[]>(`${API}/food-types`);
      setFoodTypes(res.data);
    } catch (err) {
      console.error("Error fetching food types:", err);
      setError("Could not load food types");
    }
  };

  useEffect(() => {
    fetchFoodTypes();
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
        await axios.put(`${API}/food-types/${editingId}`, { name: trimmed });
      } else {
        await axios.post(`${API}/food-types`, { name: trimmed });
      }
      resetForm();
      fetchFoodTypes();
    } catch (err) {
      showError(err);
    }
  };

  const handleEdit = (item: FoodTypeData) => {
    setEditingId(item.id);
    setName(item.name);
    setError("");
  };

  const handleDelete = async (item: FoodTypeData) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    setError("");

    try {
      await axios.delete(`${API}/food-types/${item.id}`);
      if (editingId === item.id) resetForm();
      fetchFoodTypes();
    } catch (err) {
      showError(err);
    }
  };

  return (
    <div>
      <h2>Food Types</h2>

      <form onSubmit={handleSubmit}>




       

       <FormField label="Food type name" type="text" id="name" name="name"
          placeholder="Enter food type name" value={name} onChange={(e) => setName(e.target.value)} />




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
          {foodTypes.length === 0 ? (
            <tr>
              <td colSpan={3}>No food types yet</td>
            </tr>
          ) : (
            foodTypes.map((item) => (
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

export default FoodTypePage;