import React, { useRef, useState, useEffect } from "react";
import ImageProcessor from "../lib/ImageEditer";

const ImageEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageProcessor = useRef<ImageProcessor | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      imageProcessor.current = new ImageProcessor(canvas);
    }
  }, []);

  // Load image and render it on canvas
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const canvas = canvasRef.current;
      if (canvas) {
        setImageLoaded(true);
        imageProcessor.current = new ImageProcessor(canvas);
        imageProcessor.current.loadImageFromFile(file);
      }
    }
  };

  // Crop selection handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    const x = e.clientX - rect!.left;
    const y = e.clientY - rect!.top;

    setStartX(x);
    setStartY(y);
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = x - startX;
    const height = y - startY;

    setCropWidth(width > 0 ? width : 0);
    setCropHeight(height > 0 ? height : 0);

    setCropX(width < 0 ? x : startX);
    setCropY(height < 0 ? y : startY);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    // Apply crop once the user releases the mouse
    applyCrop();
  };

  const applyCrop = () => {
    if (imageProcessor.current && cropWidth > 0 && cropHeight > 0) {
      imageProcessor.current.applyCrop(cropX, cropY, cropWidth, cropHeight);
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
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-gray-300"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsSelecting(false)} // Close selection when the mouse leaves the canvas
        />

        {isSelecting && (
          <div
            style={{
              position: "absolute",
              border: "2px dashed red",
              top: cropY,
              left: cropX,
              width: cropWidth,
              height: cropHeight,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ImageEditor;
