export type SelectFieldOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectFieldOption[];
  placeholder?: string;
  disabled?: boolean;
  name?: string;
};

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  name,
}: SelectFieldProps) {
  return (
    <label className="form-control w-full">
      <span className="field-label">{label}</span>
      <select
        className="select select-bordered w-full bg-white"
        name={name}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default SelectField;
