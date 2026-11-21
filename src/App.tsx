import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const Layout = lazy(() => import("./Layout/Layout"));

const Dashboard = lazy(() => import("./Pages/Dashboard/Dashboard"));

const MenuItem = lazy(() => import("./Pages/MenuItems/MenuItem"));
const FoodTypePage = lazy(() => import("./Pages/FoodTypes/FoodTypePage"));
const LocationPage = lazy(() => import("./Pages/Locations/LocationPage"));
const OrderTypePage = lazy(() => import("./Pages/OrderTypes/OrderTypePage"));
const ErrorPage = lazy(() => import("./Pages/ErrorPage/ErrorPage"));

const Employee = lazy(() => import("./Pages/Employee/Employee"));
const EmployeeType = lazy(() => import("./Pages/EmployeeType/EmployeeType"));
const Position = lazy(() => import("./Pages/Position/Position"));

const App = () => {
  return (
    <Suspense fallback="Loading...">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/menu-items" element={<MenuItem />} />
          <Route path="/food-types" element={<FoodTypePage />} />
          <Route path="/locations" element={<LocationPage />} />
          <Route path="/order-types" element={<OrderTypePage />} />

          <Route path="/employees" element={<Employee />} />
          <Route path="/employee-types" element={<EmployeeType />} />
          <Route path="/positions" element={<Position />} />
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
