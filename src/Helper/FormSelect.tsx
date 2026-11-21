type Option = { id: number; name: string };

type FormSelectProps = {
  label: string;
  id: string;
  name: string;
  value: string;
  options: Option[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
};

const FormSelect = ({ label, id, name, value, options, onChange, required }: FormSelectProps) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <select id={id} name={name} value={value} onChange={onChange} required={required}>
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
  </div>
);

export default FormSelect;