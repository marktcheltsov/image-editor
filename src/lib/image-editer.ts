import BaseImageEditor from "./base-image-editer";
import CropManager from "./modlules/crop";
import EffectsManager from "./modlules/effects";
import EraseManager from "./modlules/erase";
import { filters } from "./types/filters.types";

class ImageEditer extends BaseImageEditor {
    private erase: EraseManager;
    private effects: EffectsManager;
    private crop: CropManager;  // Declare an instance of CropManager

    constructor(canvas: HTMLCanvasElement) {
      super(canvas);
      this.erase = new EraseManager(this.ctx);
      this.effects = new EffectsManager(this.ctx, this.canvas);
      this.crop = new CropManager(this.ctx, this.canvas);  // Initialize the CropManager
    }
  
    public applyFilters({
      exposure,
      contrast,
      saturation,
      temperature,
      tint,
      highlights,
      shadows,
    }: filters) {
      if (!this.image) return;
  
      this.ctx.drawImage(this.image, 0, 0);
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const data = imageData.data;
  
      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      const saturationFactor = saturation / 100 + 1;
      const highlightsFactor = highlights / 100;
      const shadowsFactor = shadows / 100;
  
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
  
        // Exposure
        r += exposure;
        g += exposure;
        b += exposure;
  
        // Contrast
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;
  
        // Temperature
        r += temperature;
        b -= temperature;
  
        // Tint
        g += tint;
  
        // Saturation
        const avg = (r + g + b) / 3;
        r = avg + (r - avg) * saturationFactor;
        g = avg + (g - avg) * saturationFactor;
        b = avg + (b - avg) * saturationFactor;
  
        // Highlights
        if (highlightsFactor > 0) {
          r += (255 - r) * highlightsFactor;
          g += (255 - g) * highlightsFactor;
          b += (255 - b) * highlightsFactor;
        }
  
        // Shadows
        if (shadowsFactor > 0) {
          r *= 1 - shadowsFactor;
          g *= 1 - shadowsFactor;
          b *= 1 - shadowsFactor;
        }
  
        // Clamp values
        data[i] = this.clamp(r);
        data[i + 1] = this.clamp(g);
        data[i + 2] = this.clamp(b);
      }
  
      this.ctx.putImageData(imageData, 0, 0);
    }


    public applyCrop(x: number, y: number, width: number, height: number) {
      if (!this.image) return;
      this.crop.applyCrop(x, y, width, height);
    }

    public applyBlur(radius: number) {
      if (!this.image) return;
      this.effects.applyBlur(this.image, radius);
    }
  
    public applySharpness(amount: number) {
      if (!this.image) return;
      this.effects.applySharpness(this.image, amount);
    }

    private clamp(value: number): number {
      return Math.max(0, Math.min(255, value));
    }
  
    public resetFilters() {
      this.reset()
    }

    public startErasing() {
      this.erase.start();
    }

    public stopErasing() {
      this.erase.stop();
    }

    public setEraseRadius(radius: number) {
      this.erase.setRadius(radius);
    }

    public erasing(x: number, y: number) {
      this.erase.erase(x, y);
    }
  }
  
export default ImageEditer;