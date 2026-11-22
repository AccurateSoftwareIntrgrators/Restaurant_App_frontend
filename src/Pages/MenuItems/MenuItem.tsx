import { useEffect, useState } from "react";
import axios from "axios";
import FormField from "../../Helper/FormField";
import FormSelect from "../../Helper/FormSelect";

const API = import.meta.env.VITE_API_URL;

type Option = { id: number; name: string };

// What the form holds (select values are strings in the DOM)
type MenuItemForm = {
  name: string;
  description: string;
  foodTypeId: string;
  orderTypeId: string;
  locationId: string;
  price: number | "";
  isAvailable: boolean;
};

// What the API returns
type MenuItemData = {
  id: number;
  name: string;
  description: string | null;
  price: string; // DECIMAL comes back from Postgres as a string
  isAvailable: boolean;
  foodType: Option | null;
  orderType: Option | null;
  location: Option | null;
};

const initialState: MenuItemForm = {
  name: "",
  description: "",
  foodTypeId: "",
  orderTypeId: "",
  locationId: "",
  price: "",
  isAvailable: true,
};

const MenuItem = () => {
  const [form, setForm] = useState<MenuItemForm>(initialState);
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [foodTypes, setFoodTypes] = useState<Option[]>([]);
  const [orderTypes, setOrderTypes] = useState<Option[]>([]);
  const [locations, setLocations] = useState<Option[]>([]);

  const fetchMenuItems = async () => {
    try {
      const res = await axios.get<MenuItemData[]>(`${API}/menu-items`);
      setMenuItems(res.data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const fetchLookups = async () => {
    try {
      const [food, order, loc] = await Promise.all([
        axios.get<Option[]>(`${API}/food-types`),
        axios.get<Option[]>(`${API}/order-types`),
        axios.get<Option[]>(`${API}/locations`),
      ]);
      setFoodTypes(food.data);
      setOrderTypes(order.data);
      setLocations(loc.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchLookups();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? value === "" ? "" : parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/menu-items`, {
        name: form.name,
        description: form.description,
        price: form.price,
        isAvailable: form.isAvailable,
        foodTypeId: Number(form.foodTypeId),
        orderTypeId: Number(form.orderTypeId),
        locationId: form.locationId ? Number(form.locationId) : null,
      });

      setForm(initialState);
      fetchMenuItems(); // refresh the list
    } catch (error) {
      console.error("Error creating menu item:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <FormField label="Name" id="name" name="name" placeholder="Enter name"
          value={form.name} onChange={handleChange} />

        <FormField label="Description" id="description" name="description"
          placeholder="Enter description" value={form.description} onChange={handleChange} />

        <FormSelect label="Food Type" id="foodTypeId" name="foodTypeId"
          value={form.foodTypeId} options={foodTypes} onChange={handleChange} required />

        <FormSelect label="Order Type" id="orderTypeId" name="orderTypeId"
          value={form.orderTypeId} options={orderTypes} onChange={handleChange} required />

        <FormSelect label="Location" id="locationId" name="locationId"
          value={form.locationId} options={locations} onChange={handleChange} />

        <FormField label="Price" type="number" id="price" name="price"
          placeholder="Enter price" value={form.price} onChange={handleChange} />

        <div>
          <label htmlFor="isAvailable">Available</label>
          <input
            type="checkbox"
            id="isAvailable"
            name="isAvailable"
            checked={form.isAvailable}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Submit</button>
      </form>

      <ul>
        {menuItems.map((item) => (
          <li key={item.id}>
            {item.name} · {item.foodType?.name} · {item.orderType?.name} · ₹{item.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MenuItem;