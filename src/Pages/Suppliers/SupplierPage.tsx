import { useEffect, useState } from "react";
import axios from "axios";
import FormField from "../../Helper/FormField";

const API = import.meta.env.VITE_API_URL;

type SupplierData = {
  id: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
};

type SupplierForm = {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
};

const initialState: SupplierForm = {
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
};

const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [form, setForm] = useState<SupplierForm>(initialState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get<SupplierData[]>(`${API}/suppliers`);
        setSuppliers(res.data);
      } catch (err) {
        console.error("Error fetching suppliers:", err);
        setError("Could not load suppliers");
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

    // Empty optional fields go as null (the email validator rejects "")
    const payload = {
      name,
      contactPerson: form.contactPerson.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
    };

    try {
      if (editingId !== null) {
        await axios.patch(`${API}/suppliers/${editingId}`, payload);
      } else {
        await axios.post(`${API}/suppliers`, payload);
      }
      resetForm();
      reload();
    } catch (err) {
      showError(err);
    }
  };

  const handleEdit = (item: SupplierData) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      contactPerson: item.contactPerson ?? "",
      phone: item.phone ?? "",
      email: item.email ?? "",
      address: item.address ?? "",
    });
    setError("");
  };

  const handleDelete = async (item: SupplierData) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    setError("");

    try {
      await axios.delete(`${API}/suppliers/${item.id}`);
      if (editingId === item.id) resetForm();
      reload();
    } catch (err) {
      showError(err); // e.g. "Supplier is used by 5 inventory item(s)"
    }
  };

  return (
    <div>
      <h2>Suppliers</h2>

      <form onSubmit={handleSubmit}>
        <FormField label="Supplier name" id="name" name="name" placeholder="Enter supplier name"
          value={form.name} onChange={handleChange} required />

        <FormField label="Contact person" id="contactPerson" name="contactPerson"
          placeholder="Enter contact person" value={form.contactPerson} onChange={handleChange} />

        <FormField label="Phone" id="phone" name="phone" placeholder="Enter phone"
          value={form.phone} onChange={handleChange} />

        <FormField label="Email" type="email" id="email" name="email" placeholder="Enter email"
          value={form.email} onChange={handleChange} />

        <FormField label="Address" id="address" name="address" placeholder="Enter address"
          value={form.address} onChange={handleChange} />

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
            <th>Contact</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan={7}>No suppliers yet</td>
            </tr>
          ) : (
            suppliers.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.contactPerson}</td>
                <td>{item.phone}</td>
                <td>{item.email}</td>
                <td>{item.address}</td>
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

export default SupplierPage;