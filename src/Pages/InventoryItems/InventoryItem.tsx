import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import FormField from "../../Helper/FormField";
import FormSelect from "../../Helper/FormSelect";

const API = import.meta.env.VITE_API_URL;

const EXPIRY_WARNING_DAYS = 7;

type Option = { id: number; name: string };
type UnitOption = { id: number; name: string; abbreviation: string };

// What the form holds (inputs and selects give strings)
type InventoryItemForm = {
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  unitId: string;
  supplierId: string;
  locationId: string;
  reorderLevel: string;
  costPerUnit: string;
  expiryDate: string;
  isActive: boolean;
};

// What the API returns (DECIMAL columns come back from Postgres as strings)
type InventoryItemData = {
  id: number;
  name: string;
  sku: string | null;
  description: string | null;
  categoryId: number;
  unitId: number;
  supplierId: number | null;
  locationId: number | null;
  quantityInStock: string;
  reorderLevel: string;
  costPerUnit: string | null;
  expiryDate: string | null; // YYYY-MM-DD
  isActive: boolean;
  category: Option | null;
  unit: UnitOption | null;
  supplier: Option | null;
  location: Option | null;
};

const initialState: InventoryItemForm = {
  name: "",
  sku: "",
  description: "",
  categoryId: "",
  unitId: "",
  supplierId: "",
  locationId: "",
  reorderLevel: "",
  costPerUnit: "",
  expiryDate: "",
  isActive: true,
};

// Works out the warnings shown in the Status column
const getStatus = (item: InventoryItemData): string[] => {
  const flags: string[] = [];
  const qty = Number(item.quantityInStock);
  const reorder = Number(item.reorderLevel);

  if (qty <= 0) flags.push("Out of stock");
  else if (reorder > 0 && qty <= reorder) flags.push("Low stock");

  if (item.expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(`${item.expiryDate}T00:00:00`);
    const days = Math.round((expiry.getTime() - today.getTime()) / 86400000);
    if (days < 0) flags.push("Expired");
    else if (days <= EXPIRY_WARNING_DAYS) flags.push(`Expires in ${days}d`);
  }

  if (!item.isActive) flags.push("Inactive");
  return flags;
};

const InventoryItem = () => {
  const [form, setForm] = useState<InventoryItemForm>(initialState);
  const [items, setItems] = useState<InventoryItemData[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [suppliers, setSuppliers] = useState<Option[]>([]);
  const [locations, setLocations] = useState<Option[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Filters for the table
  const [search, setSearch] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Dropdown data, loaded once
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [cat, unit, sup, loc] = await Promise.all([
          axios.get<Option[]>(`${API}/inventory-categories`),
          axios.get<UnitOption[]>(`${API}/units`),
          axios.get<Option[]>(`${API}/suppliers`),
          axios.get<Option[]>(`${API}/locations`),
        ]);
        setCategories(cat.data);
        setUnits(unit.data);
        setSuppliers(sup.data);
        setLocations(loc.data);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
      }
    };
    loadLookups();
  }, []);

  // Items list, reloaded when a filter changes or after create / update / delete
  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await axios.get<InventoryItemData[]>(`${API}/inventory-items`, {
          params: {
            search: search.trim() || undefined,
            categoryId: filterCategoryId || undefined,
            lowStock: lowStockOnly ? "true" : undefined,
          },
        });
        setItems(res.data);
      } catch (err) {
        console.error("Error fetching inventory items:", err);
        setError("Could not load inventory items");
      }
    };
    loadItems();
  }, [search, filterCategoryId, lowStockOnly, reloadKey]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Empty optional fields go as null (a blank SKU would clash with the unique rule)
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim() || null,
      description: form.description.trim() || null,
      categoryId: Number(form.categoryId),
      unitId: Number(form.unitId),
      supplierId: form.supplierId ? Number(form.supplierId) : null,
      locationId: form.locationId ? Number(form.locationId) : null,
      reorderLevel: form.reorderLevel === "" ? 0 : Number(form.reorderLevel),
      costPerUnit: form.costPerUnit === "" ? null : Number(form.costPerUnit),
      expiryDate: form.expiryDate || null,
      isActive: form.isActive,
    };

    try {
      if (editingId !== null) {
        await axios.patch(`${API}/inventory-items/${editingId}`, payload);
      } else {
        await axios.post(`${API}/inventory-items`, payload);
      }
      resetForm();
      reload();
    } catch (err) {
      showError(err);
    }
  };

  const handleEdit = (item: InventoryItemData) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      sku: item.sku ?? "",
      description: item.description ?? "",
      categoryId: String(item.categoryId),
      unitId: String(item.unitId),
      supplierId: item.supplierId ? String(item.supplierId) : "",
      locationId: item.locationId ? String(item.locationId) : "",
      reorderLevel: String(Number(item.reorderLevel)),
      costPerUnit: item.costPerUnit ?? "",
      expiryDate: item.expiryDate ?? "",
      isActive: item.isActive,
    });
    setError("");
  };

  const handleDelete = async (item: InventoryItemData) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    setError("");

    try {
      await axios.delete(`${API}/inventory-items/${item.id}`);
      if (editingId === item.id) resetForm();
      reload();
    } catch (err) {
      showError(err);
    }
  };

  const outOfStockCount = items.filter((i) => Number(i.quantityInStock) <= 0).length;
  const lowStockCount = items.filter((i) => getStatus(i).includes("Low stock")).length;

  return (
    <div>
      <h2>Inventory</h2>

      <form onSubmit={handleSubmit}>
        <FormField label="Name" id="name" name="name" placeholder="Enter item name"
          value={form.name} onChange={handleChange} required />

        <FormField label="SKU" id="sku" name="sku" placeholder="Optional code"
          value={form.sku} onChange={handleChange} />

        <FormField label="Description" id="description" name="description"
          placeholder="Enter description" value={form.description} onChange={handleChange} />

        <FormSelect label="Category" id="categoryId" name="categoryId"
          value={form.categoryId} options={categories} onChange={handleChange} required />

        <FormSelect label="Unit" id="unitId" name="unitId" value={form.unitId}
          options={units.map((u) => ({ id: u.id, name: `${u.name} (${u.abbreviation})` }))}
          onChange={handleChange} required />

        <FormSelect label="Supplier" id="supplierId" name="supplierId"
          value={form.supplierId} options={suppliers} onChange={handleChange} />

        <FormSelect label="Storage location" id="locationId" name="locationId"
          value={form.locationId} options={locations} onChange={handleChange} />

        <FormField label="Reorder level" type="number" id="reorderLevel" name="reorderLevel"
          placeholder="Alert when stock falls to this" step="0.001" min="0"
          value={form.reorderLevel} onChange={handleChange} />

        <FormField label="Cost per unit (₹)" type="number" id="costPerUnit" name="costPerUnit"
          placeholder="Enter cost" step="0.01" min="0"
          value={form.costPerUnit} onChange={handleChange} />

        <FormField label="Expiry date" type="date" id="expiryDate" name="expiryDate"
          value={form.expiryDate} onChange={handleChange} />

        <div>
          <label htmlFor="isActive">Active</label>
          <input type="checkbox" id="isActive" name="isActive"
            checked={form.isActive} onChange={handleChange} />
        </div>

        <p>Current stock is changed from Stock Movements, not here.</p>

        <button type="submit">{editingId !== null ? "Update" : "Add"}</button>
        {editingId !== null && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Stock list</h3>

      <div>
        <FormField label="Search" id="search" name="search" placeholder="Search by name"
          value={search} onChange={(e) => setSearch(e.target.value)} />

        <FormSelect label="Category" id="filterCategoryId" name="filterCategoryId"
          value={filterCategoryId} options={categories}
          onChange={(e) => setFilterCategoryId(e.target.value)} />

        <div>
          <label htmlFor="lowStockOnly">Low stock only</label>
          <input type="checkbox" id="lowStockOnly" checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)} />
        </div>
      </div>

      <p>
        {items.length} items · {lowStockCount} low stock · {outOfStockCount} out of stock
      </p>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>In stock</th>
            <th>Reorder level</th>
            <th>Cost / unit</th>
            <th>Supplier</th>
            <th>Location</th>
            <th>Expiry</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={11}>No inventory items found</td>
            </tr>
          ) : (
            items.map((item) => {
              const flags = getStatus(item);
              const unit = item.unit?.abbreviation ?? "";
              return (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.category?.name}</td>
                  <td>{Number(item.quantityInStock)} {unit}</td>
                  <td>{Number(item.reorderLevel)} {unit}</td>
                  <td>{item.costPerUnit ? `₹${item.costPerUnit}` : "-"}</td>
                  <td>{item.supplier?.name ?? "-"}</td>
                  <td>{item.location?.name ?? "-"}</td>
                  <td>{item.expiryDate ?? "-"}</td>
                  <td>
                    {flags.length > 0 ? (
                      <span style={{ color: "red" }}>{flags.join(", ")}</span>
                    ) : (
                      "OK"
                    )}
                  </td>
                  <td>
                    <Link to={`/stock-transactions?itemId=${item.id}`}>Stock</Link>
                    <button onClick={() => handleEdit(item)}>Edit</button>
                    <button onClick={() => handleDelete(item)}>Delete</button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryItem;