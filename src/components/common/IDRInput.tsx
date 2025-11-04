import React from "react";

interface IDRInputProps {
  label?: string;
  value: string;
  onChange: (newValue: string) => void;
  required?: boolean;
}

const IDRInput: React.FC<IDRInputProps> = ({
  label = "Nominal",
  value,
  onChange,
  required = false,
}) => {
  const handleChange = (val: string) => {
    const cleaned = val.replace(/\D/g, ""); // remove non digits
    const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    onChange(formatted);
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
        <span className="mr-1 text-gray-600">Rp</span>
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          required={required}
          className="w-full outline-none"
          placeholder="0"
        />
      </div>
    </div>
  );
};

export default IDRInput;
