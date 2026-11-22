// FormField.tsx
type FormFieldProps = {
  label: string;
  type?: string;
  id: string;
  name: string;
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  step?: string; // e.g. "0.01" so decimals pass browser validation
  min?: string;
  disabled?: boolean;
};

const FormField = ({
  label,
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  required,
  step,
  min,
  disabled,
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
      required={required}
      step={step}
      min={min}
      disabled={disabled}
    />
  </div>
);

export default FormField;