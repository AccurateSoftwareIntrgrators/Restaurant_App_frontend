// FormField.tsx
type FormFieldProps = {
  label: string;
  type?: string;
  id: string;
  name: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const FormField = ({
  label,
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
}: FormFieldProps) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <input
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default FormField;