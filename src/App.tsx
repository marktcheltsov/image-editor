import React, { useRef, useState, useEffect } from "react";
import ImageProcessor from "./lib/image-editer";
import FileUploader from "./components/ui/file-uploader";
import SliderControl from "./components/ui/slider-controll";
import SettingsContainer from "./components/settings-container";
import { settings } from "./types/types";
import InputNumber from "./components/ui/input-number";
import CanvasEditor from "./components/canvas-editor";

const ImageEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [isCroping, setIsCroping] = useState(false)
  const [eraseRadius, setEraseRadius] = useState(10);
  const [blurRadius, setBlurRadius] = useState(0);
  const [sharpnessAmount, setSharpnessAmount] = useState(0);
  const [settingsType, setSettingsType] = useState<settings | null>(null);

  const [square, setSquare] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const [exposure, setExposure] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [tint, setTint] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [shadows, setShadows] = useState(0);

  const imageProcessor = useRef<ImageProcessor | null>(null);

  const handleResize = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();

    const canvas = canvasRef.current!;
    const startX = e.clientX;
    const startY = e.clientY;
    const startSquare = { ...square };

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isCroping) return null
      let dx = moveEvent.clientX - startX;
      let dy = moveEvent.clientY - startY;

      const newSquare = { ...startSquare };

      if (corner.includes("right")) newSquare.width = Math.min(canvas.width, Math.max(0, startSquare.width + dx));
      if (corner.includes("bottom")) newSquare.height = Math.min(canvas.height, Math.max(0, startSquare.height + dy));
      if (corner.includes("left")) {
        dx = Math.min(dx, startSquare.x);
        newSquare.width = Math.min(canvas.width, Math.max(0, startSquare.width - dx));
        newSquare.x = startSquare.x + dx;
      }
      if (corner.includes("top")) {
        dy = Math.min(dy, startSquare.y);
        newSquare.height = Math.min(canvas.height, Math.max(0, startSquare.height - dy));
        newSquare.y = startSquare.y + dy;
      }

      setSquare(newSquare);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
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

  const handleTypeChange = (type: settings) => {
    if (isErasing) setIsErasing(false)
    if (isCroping) setIsCroping(false)
    if (type === settingsType) {
      setSettingsType(null)
      return
    }
    if (type === 'crop') setIsCroping(true)
    setSettingsType(type)
  }

  const handleFileChange = (file: File) => {
    if (file) {
      const canvas = canvasRef.current;
      if (canvas) {
        setImageLoaded(true);
        imageProcessor.current = new ImageProcessor(canvas);
        imageProcessor.current.loadImageFromFile(file);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    const x = e.clientX - rect!.left;
    const y = e.clientY - rect!.top;

    if (isErasing && imageProcessor.current) {
      imageProcessor.current.startErasing();
      imageProcessor.current.erasing(x, y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isErasing || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isErasing && imageProcessor.current) {
      imageProcessor.current.erasing(x, y);
    }
  };

  const handleMouseUp = () => {
    if (isErasing && imageProcessor.current) {
      imageProcessor.current.stopErasing();
    }
  };

  const toggleErase = () => {
    setIsErasing(!isErasing);
    if (!isErasing && imageProcessor.current) {
      imageProcessor.current.stopErasing();
    } else if (imageProcessor.current) {
      imageProcessor.current.startErasing();
    }
  };

  const handleEraseRadiusChange = (radius: number) => {
    setEraseRadius(radius);
    if (imageProcessor.current) {
      imageProcessor.current.setEraseRadius(radius);
    }
  };

  const handleBlurChange = (radius: number) => {
    setBlurRadius(radius);
    if (imageProcessor.current) {
      imageProcessor.current.applyBlur(radius);
    }
  };

  const handleSharpnessChange = (amount: number) => {
    setSharpnessAmount(amount);
    if (imageProcessor.current) {
      imageProcessor.current.applySharpness(amount);
    }
  };

  const applyCrop = () => {
    if (imageProcessor.current) {
      const { x, y, width, height } = square;
  
      const cropX = Math.round(x);
      const cropY = Math.round(y);
      const cropWidth = Math.round(width);
      const cropHeight = Math.round(height);
  
      imageProcessor.current.applyCrop(cropX, cropY, cropWidth, cropHeight);
  
      setSquare({
        x: 0,
        y: 0,
        width: cropWidth,
        height: cropHeight,
      });
    }
  };

  const handleExport = () => imageProcessor.current && imageProcessor.current.exportImage();

  
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      imageProcessor.current = new ImageProcessor(canvas);
    }
  }, []);

  return (
    <div className="flex gap-2 bg-gray-900 h-screen w-screen text-white">
      <div className="w-full max-w-[300px]">
        <SettingsContainer 
          handleExport={handleExport} 
          handleTypeChange={handleTypeChange} 
          type={settingsType} 
          toggleErase={toggleErase} 
          imageLoaded={imageLoaded}
        />
        {settingsType === 'filter' && (
          <div>
            <div className="mt-4 space-y-4">
            {[{ label: "Exposure", value: exposure, setter: setExposure, min: -100, max: 100 },
              { label: "Contrast", value: contrast, setter: setContrast, min: -100, max: 100 },
              { label: "Saturation", value: saturation, setter: setSaturation, min: -100, max: 100 },
              { label: "Temperature", value: temperature, setter: setTemperature, min: -100, max: 100 },
              { label: "Tint", value: tint, setter: setTint, min: -100, max: 100 },
              { label: "Highlights", value: highlights, setter: setHighlights, min: -100, max: 100 },
              { label: "Shadows", value: shadows, setter: setShadows, min: -100, max: 100 },
            ].map(({ label, value, setter, min, max }) => (
              <SliderControl 
                key={label} 
                min={min} 
                max={max} 
                onChange={(value: number)=> {
                  setter(value);
                  applyFilters()
                }} 
                label={label} 
                value={value}
              />
            ))}
            <SliderControl  
              min={0} 
              max={50} 
              onChange={handleBlurChange}
              label={'Blur'} 
              value={blurRadius}
            />
            <SliderControl  
              min={0} 
              max={50} 
              onChange={handleSharpnessChange}
              label={'Sharpness'} 
              value={sharpnessAmount}
            />
          </div>
          <button
            onClick={resetFilters}
            className="mt-4 p-2 bg-red-500 text-white rounded w-full"
          >
            Reset Filters
          </button>              
        </div>
        )}
        {settingsType === 'crop' && (
        <div className="flex flex-col gap-2">
          <button
            onClick={applyCrop}
            className="p-2 bg-green-500 text-white rounded"
            disabled={!imageLoaded}
          >
            Apply Crop
          </button>
        </div>
        )}
        {settingsType === 'erasing' && <InputNumber max={50} min={5} value={eraseRadius} onChange={handleEraseRadiusChange}/>}
      </div>
      <div className="  ">
        <FileUploader onFileChange={handleFileChange} />
        <CanvasEditor
         canvasRef={canvasRef} 
         isCroping={isCroping} 
         isErasing={isErasing} 
         imageLoaded={imageLoaded} 
         square={square} 
         handleMouseDown={handleMouseDown} 
         handleMouseMove={handleMouseMove} 
         handleMouseUp={handleMouseUp} 
         handleResize={handleResize}
         stopErasing={toggleErase}
        />
      </div>
    </div>
  );
};

export default ImageEditor;
