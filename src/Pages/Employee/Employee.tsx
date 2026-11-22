import axios from "axios";
import { useEffect, useState } from "react";
import FormField from "../../Helper/FormField";

const API = import.meta.env.VITE_API_URL;

type PositionType = { id: number; name: string };
type EmployeeTypeType = { id: number; name: string };

type EmployeeData = {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  nationalId: string;
  phone: string;
  address: string;
  emergencyContact: string;
  salary: number | string;
  employmentDate: string;
  employeeStatus: "active" | "inactive";
  positionId: number;
  employeeTypeId: number;
  position?: PositionType;
  employeeType?: EmployeeTypeType;
};

type FormState = {
  employeeId: string;
  name: string;
  email: string;
  nationalId: string;
  phone: string;
  address: string;
  emergencyContact: string;
  salary: string;
  employmentDate: string;
  employeeStatus: "active" | "inactive";
  positionId: string;
  employeeTypeId: string;
};

const emptyForm: FormState = {
  employeeId: "",
  name: "",
  email: "",
  nationalId: "",
  phone: "",
  address: "",
  emergencyContact: "",
  salary: "",
  employmentDate: "",
  employeeStatus: "active",
  positionId: "",
  employeeTypeId: "",
};

const Employee = () => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [positions, setPositions] = useState<PositionType[]>([]);
  const [employeeTypes, setEmployeeTypes] = useState<EmployeeTypeType[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const showError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } else {
      setError("Something went wrong");
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get<EmployeeData[]>(`${API}/employees`);
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      showError(err);
    }
  };

  const fetchLookups = async () => {
    try {
      const [posRes, typeRes] = await Promise.all([
        axios.get<PositionType[]>(`${API}/positions`),
        axios.get<EmployeeTypeType[]>(`${API}/employee-types`),
      ]);
      setPositions(posRes.data);
      setEmployeeTypes(typeRes.data);
    } catch (err) {
      console.error("Error fetching positions/employee types:", err);
      showError(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchLookups();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (emp: EmployeeData) => {
    setError("");
    setEditingId(emp.id);
    setForm({
      employeeId: emp.employeeId ?? "",
      name: emp.name ?? "",
      email: emp.email ?? "",
      nationalId: emp.nationalId ?? "",
      phone: emp.phone ?? "",
      address: emp.address ?? "",
      emergencyContact: emp.emergencyContact ?? "",
      salary: String(emp.salary ?? ""),
      employmentDate: emp.employmentDate ? emp.employmentDate.slice(0, 10) : "",
      employeeStatus: emp.employeeStatus,
      positionId: String(emp.positionId ?? ""),
      employeeTypeId: String(emp.employeeTypeId ?? ""),
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this employee?")) return;
    setError("");
    try {
      await axios.delete(`${API}/employees/${id}`);
      if (editingId === id) resetForm();
      fetchEmployees();
    } catch (err) {
      console.error("Error deleting employee:", err);
      showError(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      nationalId: form.nationalId.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      emergencyContact: form.emergencyContact.trim(),
      salary: Number(form.salary),
      employmentDate: form.employmentDate,
      employeeStatus: form.employeeStatus,
      positionId: Number(form.positionId),
      employeeTypeId: Number(form.employeeTypeId),
    };

    try {
      if (editingId !== null) {
        // employeeId is not updatable on the backend, so it isn't sent
        await axios.patch(`${API}/employees/${editingId}`, payload);
      } else {
        await axios.post(`${API}/employees`, {
          ...payload,
          employeeId: form.employeeId.trim(),
        });
      }
      resetForm();
      fetchEmployees();
    } catch (err) {
      console.error("Error adding/updating employee:", err);
      showError(err);
    }
  };

  return (
    <div>
      <div>
        <h1>Employees</h1>
      </div>

      <div>
        <form onSubmit={handleSubmit}>
          <FormField
            label="Employee ID"
            type="text"
            id="employeeId"
            name="employeeId"
            placeholder="Enter employee ID"
            value={form.employeeId}
            onChange={handleChange}
            disabled={editingId !== null}
          />
          <FormField
            label="Name"
            type="text"
            id="name"
            name="name"
            placeholder="Enter name"
            value={form.name}
            onChange={handleChange}
          />
          <FormField
            label="Email"
            type="email"
            id="email"
            name="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
          />
          <FormField
            label="National ID"
            type="text"
            id="nationalId"
            name="nationalId"
            placeholder="Enter national ID"
            value={form.nationalId}
            onChange={handleChange}
          />
          <FormField
            label="Phone"
            type="tel"
            id="phone"
            name="phone"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={handleChange}
          />
          <FormField
            label="Address"
            type="text"
            id="address"
            name="address"
            placeholder="Enter address"
            value={form.address}
            onChange={handleChange}
          />
          <FormField
            label="Emergency Contact"
            type="tel"
            id="emergencyContact"
            name="emergencyContact"
            placeholder="Enter emergency contact"
            value={form.emergencyContact}
            onChange={handleChange}
          />
          <FormField
            label="Salary"
            type="number"
            id="salary"
            name="salary"
            placeholder="Enter salary"
            value={form.salary}
            onChange={handleChange}
          />
          <FormField
            label="Employment Date"
            type="date"
            id="employmentDate"
            name="employmentDate"
            placeholder=""
            value={form.employmentDate}
            onChange={handleChange}
          />

          <div>
            <label htmlFor="positionId">Position</label>
            <select
              id="positionId"
              name="positionId"
              value={form.positionId}
              onChange={handleChange}
              required
            >
              <option value="">Select position</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="employeeTypeId">Employee Type</label>
            <select
              id="employeeTypeId"
              name="employeeTypeId"
              value={form.employeeTypeId}
              onChange={handleChange}
              required
            >
              <option value="">Select employee type</option>
              {employeeTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="employeeStatus">Status</label>
            <select
              id="employeeStatus"
              name="employeeStatus"
              value={form.employeeStatus}
              onChange={handleChange}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button type="submit">
            {editingId !== null ? "Update Employee" : "Add Employee"}
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
        <h2>Existing Employees</h2>
        {employees.length === 0 ? (
          <p>No employees yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Position</th>
                <th>Type</th>
                <th>Salary</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.employeeId}</td>
                  <td>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td>{emp.phone}</td>
                  <td>{emp.position?.name}</td>
                  <td>{emp.employeeType?.name}</td>
                  <td>{emp.salary}</td>
                  <td>{emp.employmentDate?.slice(0, 10)}</td>
                  <td>{emp.employeeStatus}</td>
                  <td>
                    <button onClick={() => handleEdit(emp)}>Edit</button>
                    <button onClick={() => handleDelete(emp.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Employee;