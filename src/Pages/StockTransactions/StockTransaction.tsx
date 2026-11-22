import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import FormField from "../../Helper/FormField";
import FormSelect from "../../Helper/FormSelect";

const API = import.meta.env.VITE_API_URL;

type Option = { id: number; name: string };

type TransactionType = "PURCHASE" | "USAGE" | "WASTE" | "RETURN" | "ADJUSTMENT";

const TYPES: { value: TransactionType; label: string }[] = [
  { value: "PURCHASE", label: "Purchase (stock in)" },
  { value: "USAGE", label: "Usage (used in kitchen)" },
  { value: "WASTE", label: "Waste / spoilage" },
  { value: "RETURN", label: "Return to supplier" },
  { value: "ADJUSTMENT", label: "Adjustment (stock-take, + or -)" },
];

// Item as returned by GET /inventory-items (only what this page needs)
type ItemOption = {
  id: number;
  name: string;
  quantityInStock: string;
  unit: { id: number; abbreviation: string } | null;
};

// What the API returns for a stock transaction
type TransactionData = {
  id: number;
  inventoryItemId: number;
  employeeId: number | null;
  type: TransactionType;
  quantity: string;
  costPerUnit: string | null;
  note: string | null;
  transactionDate: string;
  inventoryItem: {
    id: number;
    name: string;
    quantityInStock: string;
    unit: { id: number; abbreviation: string } | null;
  } | null;
  employee: Option | null;
};

type TransactionForm = {
  inventoryItemId: string;
  type: TransactionType;
  quantity: string;
  costPerUnit: string;
  employeeId: string;
  note: string;
};

// Shows +/- so it is clear whether the movement added or removed stock
const signedQuantity = (t: TransactionData): string => {
  const qty = Number(t.quantity);
  if (t.type === "PURCHASE") return `+${qty}`;
  if (t.type === "ADJUSTMENT") return qty > 0 ? `+${qty}` : `${qty}`;
  return `-${qty}`;
};

const StockTransaction = () => {
  // /stock-transactions?itemId=5 comes from the "Stock" link on the Inventory page
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState<TransactionForm>({
    inventoryItemId: searchParams.get("itemId") ?? "",
    type: "PURCHASE",
    quantity: "",
    costPerUnit: "",
    employeeId: "",
    note: "",
  });
  const [items, setItems] = useState<ItemOption[]>([]);
  const [employees, setEmployees] = useState<Option[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);

  const [filterItemId, setFilterItemId] = useState(searchParams.get("itemId") ?? "");
  const [filterType, setFilterType] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Employees, loaded once
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await axios.get<Option[]>(`${API}/employees`);
        setEmployees(res.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    loadEmployees();
  }, []);

  // Items (stock levels change after every movement, so reload with reloadKey)
  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await axios.get<ItemOption[]>(`${API}/inventory-items`);
        setItems(res.data);
      } catch (err) {
        console.error("Error fetching inventory items:", err);
        setError("Could not load inventory items");
      }
    };
    loadItems();
  }, [reloadKey]);

  // Movement history
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const res = await axios.get<TransactionData[]>(`${API}/stock-transactions`, {
          params: {
            inventoryItemId: filterItemId || undefined,
            type: filterType || undefined,
          },
        });
        setTransactions(res.data);
      } catch (err) {
        console.error("Error fetching stock transactions:", err);
        setError("Could not load stock movements");
      }
    };
    loadTransactions();
  }, [filterItemId, filterType, reloadKey]);

  const showError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } else {
      setError("Something went wrong");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const quantity = Number(form.quantity);
    if (!Number.isFinite(quantity) || quantity === 0) {
      setError("Enter a quantity");
      return;
    }
    if (form.type !== "ADJUSTMENT" && quantity < 0) {
      setError("Quantity must be positive (only an adjustment can be negative)");
      return;
    }

    try {
      const res = await axios.post<TransactionData>(`${API}/stock-transactions`, {
        inventoryItemId: Number(form.inventoryItemId),
        type: form.type,
        quantity,
        costPerUnit:
          form.type === "PURCHASE" && form.costPerUnit !== "" ? Number(form.costPerUnit) : null,
        employeeId: form.employeeId ? Number(form.employeeId) : null,
        note: form.note.trim() || null,
      });

      const saved = res.data.inventoryItem;
      setMessage(
        saved
          ? `Saved. ${saved.name} now has ${Number(saved.quantityInStock)} ${saved.unit?.abbreviation ?? ""} in stock.`
          : "Saved."
      );
      // Keep the chosen item and type so several movements are quick to enter
      setForm((prev) => ({ ...prev, quantity: "", costPerUnit: "", note: "" }));
      setReloadKey((k) => k + 1);
    } catch (err) {
      showError(err); // e.g. "Insufficient stock. Available: 2, requested change: -5"
    }
  };

  const selectedItem = items.find((i) => String(i.id) === form.inventoryItemId);
  const itemOptions = items.map((i) => ({
    id: i.id,
    name: `${i.name} (${Number(i.quantityInStock)} ${i.unit?.abbreviation ?? ""} in stock)`,
  }));

  return (
    <div>
      <h2>Stock Movements</h2>

      <form onSubmit={handleSubmit}>
        <FormSelect label="Item" id="inventoryItemId" name="inventoryItemId"
          value={form.inventoryItemId} options={itemOptions} onChange={handleChange} required />

        <div>
          <label htmlFor="type">Type</label>
          <select id="type" name="type" value={form.type} onChange={handleChange}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <FormField
          label={`Quantity${selectedItem?.unit ? ` (${selectedItem.unit.abbreviation})` : ""}`}
          type="number" id="quantity" name="quantity" step="0.001"
          placeholder={form.type === "ADJUSTMENT" ? "Use - to remove stock" : "Enter quantity"}
          value={form.quantity} onChange={handleChange} required />

        {form.type === "PURCHASE" && (
          <FormField label="Cost per unit (₹)" type="number" id="costPerUnit" name="costPerUnit"
            placeholder="Optional, updates the item's cost" step="0.01" min="0"
            value={form.costPerUnit} onChange={handleChange} />
        )}

        <FormSelect label="Done by" id="employeeId" name="employeeId"
          value={form.employeeId} options={employees} onChange={handleChange} />

        <FormField label="Note" id="note" name="note" placeholder="Optional note"
          value={form.note} onChange={handleChange} />

        <button type="submit">Record movement</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <h3>History</h3>

      <div>
        <FormSelect label="Item" id="filterItemId" name="filterItemId" value={filterItemId}
          options={items.map((i) => ({ id: i.id, name: i.name }))}
          onChange={(e) => setFilterItemId(e.target.value)} />

        <div>
          <label htmlFor="filterType">Type</label>
          <select id="filterType" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Item</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Cost / unit</th>
            <th>By</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={7}>No stock movements yet</td>
            </tr>
          ) : (
            transactions.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.transactionDate).toLocaleString()}</td>
                <td>{t.inventoryItem?.name}</td>
                <td>{t.type}</td>
                <td>
                  {signedQuantity(t)} {t.inventoryItem?.unit?.abbreviation ?? ""}
                </td>
                <td>{t.costPerUnit ? `₹${t.costPerUnit}` : "-"}</td>
                <td>{t.employee?.name ?? "-"}</td>
                <td>{t.note}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockTransaction;