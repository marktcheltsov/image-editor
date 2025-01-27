import React from "react";

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageLoaded: boolean;
  isErasing: boolean;
  isCroping: boolean;
  square: { x: number; y: number; width: number; height: number };
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void;
  handleMouseUp: (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => void;
  handleResize: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, corner: string) => void;
  stopErasing: () => void;
}

const CanvasEditor: React.FC<Props> = ({
  canvasRef,
  imageLoaded,
  isErasing,
  isCroping,
  square,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleResize,
  stopErasing,
}) => {
  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="border border-gray-300"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => isErasing && stopErasing()}
      />
      {imageLoaded && isCroping && (
        <div
          className="absolute border-2 border-red-500"
          style={{
            left: square.x,
            top: square.y,
            width: square.width,
            height: square.height,
          }}
        >
          {["top-left", "top-right", "bottom-left", "bottom-right"].map((corner) => (
            <div
              key={corner}
              onMouseDown={(e) => handleResize(e, corner)}
              className="absolute w-4 h-4 bg-blue-500"
              style={{
                cursor: `${corner.split("-").join("-")}-resize`,
                ...(corner === "top-left" && { top: -2, left: -2 }),
                ...(corner === "top-right" && { top: -2, right: -2 }),
                ...(corner === "bottom-left" && { bottom: -2, left: -2 }),
                ...(corner === "bottom-right" && { bottom: -2, right: -2 }),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CanvasEditor;
