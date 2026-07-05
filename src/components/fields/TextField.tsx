type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
};

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  name,
}: TextFieldProps) {
  return (
    <label className="form-control w-full">
      <span className="field-label">{label}</span>
      <input
        className="input input-bordered w-full bg-white"
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export default TextField;
