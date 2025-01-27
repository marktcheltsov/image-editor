import React from "react";
import { Filter, Crop, Eraser, Download } from "lucide-react"; // Иконки
import { settings } from "../types/types";

interface SettingsContainerProps {
  handleExport: () => void;
  handleTypeChange: (type: settings) => void;
  type: settings | null;
  toggleErase: () => void
  imageLoaded: boolean
}

const SettingsContainer: React.FC<SettingsContainerProps> = ({
  handleExport,
  handleTypeChange,
  type,
  toggleErase,
  imageLoaded
}) => {
  const getButtonStyles = (buttonType: settings) => {
    const isActive = type === buttonType;
    return `py-2 px-4 ${
      isActive ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-300"
    }`;
  };

  return (
    <div className="flex w-full">
      {/* Кнопка для фильтров */}
      <button
        className={getButtonStyles("filter")}
        onClick={() => imageLoaded && handleTypeChange("filter")}
      >
        <Filter className="w-6 h-6" />
      </button>

      {/* Кнопка для обрезания */}
      <button
        className={getButtonStyles("crop")}
        onClick={() => imageLoaded && handleTypeChange("crop")}
      >
        <Crop className="w-6 h-6" />
      </button>

      {/* Кнопка для ластика */}
      <button
        className={getButtonStyles("erasing")}
        onClick={() => {
            if (!imageLoaded) return
            toggleErase()
            handleTypeChange("erasing")
        }}
      >
        <Eraser className="w-6 h-6" />
      </button>

      {/* Кнопка для экспорта */}
      <button
        onClick={()=> imageLoaded && handleExport()}
        className={`py-2 px-4 ${imageLoaded ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300'} text-white transition`}
      >
        <Download className="w-6 h-6" />
      </button>
    </div>
  );
};

export default SettingsContainer;
