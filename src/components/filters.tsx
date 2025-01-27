import React, { useRef, useState } from "react";
import ImageProcessor from "../lib/ImageEditer";


const ImageEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [exposure, setExposure] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [tint, setTint] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [shadows, setShadows] = useState(0);

  const imageProcessor = useRef<ImageProcessor | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const canvas = canvasRef.current;
      if (canvas) {
        imageProcessor.current = new ImageProcessor(canvas);
        imageProcessor.current.loadImageFromFile(file);
      }
    }
  };

  const applyFilters = () => {
    if (imageProcessor.current) {
      imageProcessor.current.applyFilters({
        exposure,
        contrast,
        saturation,
        temperature,
        tint,
        highlights,
        shadows,
      });
    }
  };

  const resetFilters = () => {
    if (imageProcessor.current) {
      imageProcessor.current.resetFilters();
      setExposure(0);
      setContrast(0);
      setSaturation(0);
      setTemperature(0);
      setTint(0);
      setHighlights(0);
      setShadows(0);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      <canvas ref={canvasRef} className="border border-gray-300" />
      <div className="mt-4 space-y-4">
        {[{ label: "Exposure", value: exposure, setter: setExposure, min: -100, max: 100 },
          { label: "Contrast", value: contrast, setter: setContrast, min: -100, max: 100 },
          { label: "Saturation", value: saturation, setter: setSaturation, min: -100, max: 100 },
          { label: "Temperature", value: temperature, setter: setTemperature, min: -100, max: 100 },
          { label: "Tint", value: tint, setter: setTint, min: -100, max: 100 },
          { label: "Highlights", value: highlights, setter: setHighlights, min: -100, max: 100 },
          { label: "Shadows", value: shadows, setter: setShadows, min: -100, max: 100 },
        ].map(({ label, value, setter, min, max }) => (
          <div key={label}>
            <label className="block mb-2 font-medium">
              {label}: {value}
            </label>
            <input
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={(e) => {
                setter(parseInt(e.target.value, 10));
                applyFilters();
              }}
              className="w-full"
            />
          </div>
        ))}
      </div>
      <button
        onClick={resetFilters}
        className="mt-4 p-2 bg-red-500 text-white rounded"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default ImageEditor;