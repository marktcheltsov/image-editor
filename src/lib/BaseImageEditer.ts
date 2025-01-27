class BaseImageEditor {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected image: HTMLImageElement | null = null;
  

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  public loadImageFromFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        this.image = img;
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  public loadImageFromBuffer(buffer: ArrayBuffer): void {
    const img = new Image();
    const blob = new Blob([buffer]);
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      this.image = img;
      this.canvas.width = img.width;
      this.canvas.height = img.height;
      this.ctx.drawImage(img, 0, 0);
    };
    img.src = url;
  }

  public exportImage(type: string = "image/png", quality: number = 1.0): void {
    if (!this.image) return;
    const imageUrl = this.canvas.toDataURL(type, quality);
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "edited-image.png";
    link.click();
  }

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

  public reset(): void {
    if (this.image) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.image, 0, 0);
    }
  }

}

export default BaseImageEditor;