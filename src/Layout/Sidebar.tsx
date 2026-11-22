import { NavLink } from "react-router-dom";

type SidebarLink = {
  id: number;
  label: string;
  path: string;
  icon: string;
};

const Links: SidebarLink[] = [
  { id: 1, label: "Dashboard", path: "/dashboard", icon: "dashboard" },
  { id: 2, label: "Menu Items", path: "/menu-items", icon: "menu_book" },
  { id: 3, label: "Food Types", path: "/food-types", icon: "restaurant" },
  { id: 4, label: "Locations", path: "/locations", icon: "location_on" },
  { id: 5, label: "Order Types", path: "/order-types", icon: "shopping_cart" },
  { id: 6, label: "Employee", path: "/employees", icon: "person" },
  { id: 7, label: "Employee Type", path: "/employee-types", icon: "people" },
  { id: 8, label: "Position", path: "/positions", icon: "work" },
  { id: 9, label: "Inventory", path: "/inventory-items", icon: "inventory_2" },
  { id: 10, label: "Stock Movements", path: "/stock-transactions", icon: "swap_vert" },
  { id: 11, label: "Inventory Categories", path: "/inventory-categories", icon: "category" },
  { id: 12, label: "Units", path: "/units", icon: "straighten" },
  { id: 13, label: "Suppliers", path: "/suppliers", icon: "local_shipping" },
];

const Sidebar = () => {
  return (
    <aside>
      <div>
        <h1>Restaurant Management</h1>
      </div>

      <nav>
        <ul>
          {Links.map((link) => (
            <li key={link.id}>
              <NavLink
                to={link.path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;