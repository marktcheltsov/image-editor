import React from "react";

interface InputNumberProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}

const InputNumber: React.FC<InputNumberProps> = ({
  value,
  onChange,
  placeholder = "Enter a number",
  min,
  max,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);

    if (!isNaN(newValue)) {
      if ((min !== undefined && newValue < min) || (max !== undefined && newValue > max)) {
        return;
      }
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col">
      <input
        type="number"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className="p-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="mt-1 text-sm text-gray-500">
        {min !== undefined && max !== undefined && (
          <span>
            Min: {min}, Max: {max}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputNumber;
