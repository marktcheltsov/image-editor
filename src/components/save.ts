class ImageEditer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private image: HTMLImageElement | null = null;
    private history: { imageData: ImageData; width: number; height: number }[] = [];
    private currentHistoryIndex: number = -1;
    private isErasing: boolean = false;
    private eraseRadius: number = 10;
  
    constructor(canvas: HTMLCanvasElement) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d")!;
    }
  
    public loadImageFromFile(file: File) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          this.image = img;
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          this.ctx.drawImage(img, 0, 0);
          this.pushHistory();
        };
        img.src = event.target?.result as string; // Set image source
      };
      reader.readAsDataURL(file); // Read file as Data URL
    }
  
    public loadImageFromBuffer(buffer: ArrayBuffer) {
      const img = new Image();
      const blob = new Blob([buffer]);
      const url = URL.createObjectURL(blob);
      img.onload = () => {
        this.image = img;
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        this.pushHistory();
      };
      img.src = url; // Set image source as URL
    }
  
    public applyFilters({
      exposure,
      contrast,
      saturation,
      temperature,
      tint,
      highlights,
      shadows,
    }: {
      exposure: number;
      contrast: number;
      saturation: number;
      temperature: number;
      tint: number;
      highlights: number;
      shadows: number;
    }) {
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
  
    public resetFilters() {
      if (this.image) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.image, 0, 0);
      }
    }
  
    private clamp(value: number) {
      return Math.max(0, Math.min(255, value));
    }
  
    public applyCrop(x: number, y: number, width: number, height: number) {
      if (!this.image) return;
  
      // Save the current state before crop to history
      this.pushHistory();
  
      const imageData = this.ctx.getImageData(x, y, width, height);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx.putImageData(imageData, 0, 0);
    }

    public applyBlur(radius: number) {
        if (!this.image) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.filter = `blur(${radius}px)`;
        this.ctx.drawImage(this.image, 0, 0);
        this.ctx.filter = "none";
    }

    public applySharpness(amount: number) {
        if (!this.image) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.filter = `contrast(${100 + amount}%)`;
        this.ctx.drawImage(this.image, 0, 0);
        this.ctx.filter = "none";
    }

    
    private pushHistory() {
      if (!this.image) return;
  
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.history = this.history.slice(0, this.currentHistoryIndex + 1); // Remove any redo history
      this.history.push({ imageData, width: this.canvas.width, height: this.canvas.height });
      this.currentHistoryIndex++;
    }
  
    public undo() {
      if (this.currentHistoryIndex > 0) {
        this.currentHistoryIndex--;
        const { imageData, width, height } = this.history[this.currentHistoryIndex];
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.putImageData(imageData, 0, 0);
      }
    }
  
    public redo() {
      if (this.currentHistoryIndex < this.history.length - 1) {
        this.currentHistoryIndex++;
        const { imageData, width, height } = this.history[this.currentHistoryIndex];
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.putImageData(imageData, 0, 0);
      }
    }

    public startErasing() {
        this.isErasing = true;
        this.ctx.globalCompositeOperation = 'destination-out'; // Переключаемся в режим стирания
    }

    public stopErasing() {
        this.isErasing = false;
        this.ctx.globalCompositeOperation = 'source-over'; // Возвращаем стандартный режим рисования
    }

    public setEraseRadius(radius: number) {
        this.eraseRadius = radius;
    }

    public erase(x: number, y: number) {
        if (!this.isErasing) return;

        // Применяем ластик с размытыми краями
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.eraseRadius, 0, Math.PI * 2, false);
        this.ctx.fill();
    }

    public reset() {
        if (this.image) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.image, 0, 0);
        }
    }
  
    // Export current canvas as image
    public exportImage(type: string = "image/png", quality: number = 1.0) {
        const imageUrl = this.canvas.toDataURL(type, quality); // Returns base64 string of the image
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = "edited-image.png"; // Имя файла для скачивания
        link.click();
    }
  
    // Return current image as an ArrayBuffer (e.g., for uploading or saving)
    public getImageBuffer(): Promise<ArrayBuffer> {
      return new Promise((resolve, reject) => {
        this.canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as ArrayBuffer);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
          } else {
            reject("Failed to get image buffer");
          }
        }, "image/png");
      });
    }
  }
  
export default ImageEditer;