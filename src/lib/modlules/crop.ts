class CropManager {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  public applyCrop(x: number, y: number, width: number, height: number) {
    const imageData = this.ctx.getImageData(x, y, width, height);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.putImageData(imageData, 0, 0);
  }
}

export default CropManager;