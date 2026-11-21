import axios from "axios";
import { useEffect, useState } from "react";
import FormField from "../../Helper/FormField";

const API = import.meta.env.VITE_API_URL;

type EmployeeTypeType = {
  id: number;
  name: string;
};

const EmployeeType = () => {
  const [employeeTypes, setEmployeeTypes] = useState<EmployeeTypeType[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const showError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } else {
      setError("Something went wrong");
    }
  };

  const fetchEmployeeTypes = async () => {
    try {
      const res = await axios.get<EmployeeTypeType[]>(`${API}/employee-types`);
      setEmployeeTypes(res.data);
    } catch (err) {
      console.error("Error fetching employee types:", err);
      showError(err);
    }
  };

  useEffect(() => {
    fetchEmployeeTypes();
  }, []);

  const resetForm = () => {
    setName("");
    setEditingId(null);
  };

  const handleEdit = (type: EmployeeTypeType) => {
    setError("");
    setEditingId(type.id);
    setName(type.name);
  };

  const handleDelete = async (id: number) => {
    setError("");
    try {
      await axios.delete(`${API}/employee-types/${id}`);
      if (editingId === id) resetForm();
      fetchEmployeeTypes();
    } catch (err) {
      console.error("Error deleting employee type:", err);
      showError(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const payload = { name: name.trim() };
    if (!payload.name) return;

    try {
      if (editingId !== null) {
        await axios.patch(`${API}/employee-types/${editingId}`, payload);
      } else {
        await axios.post(`${API}/employee-types`, payload);
      }
      resetForm();
      fetchEmployeeTypes();
    } catch (err) {
      console.error("Error adding/updating employee type:", err);
      showError(err);
    }
  };

  return (
    <div>
      <div>
        <h1>Employee Types</h1>
      </div>

      <div>
        <form onSubmit={handleSubmit}>
          <FormField
            label="Employee Type Name"
            type="text"
            id="name"
            name="name"
            placeholder="Enter employee type name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit">
            {editingId !== null ? "Update Employee Type" : "Add Employee Type"}
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
        <h2>Existing Employee Types</h2>
        {employeeTypes.length === 0 ? (
          <p>No employee types yet.</p>
        ) : (
          <ul>
            {employeeTypes.map((type) => (
              <li key={type.id}>
                <strong>{type.name}</strong>
                <button onClick={() => handleEdit(type)}>Edit</button>
                <button onClick={() => handleDelete(type.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EmployeeType;