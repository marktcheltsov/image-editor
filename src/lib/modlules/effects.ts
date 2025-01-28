class EffectsManager {
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
  
    constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
      this.ctx = ctx;
      this.canvas = canvas;
    }
  
    public applyBlur(image: HTMLImageElement, radius: number) {
      if (!image) return;
  
      this.ctx.filter = `blur(${radius / 4}px)`;
      this.ctx.drawImage(image, 0, 0);
      this.ctx.filter = "none";
    }
  
    public applySharpness(image: HTMLImageElement, amount: number) {
      if (!image) return;
  
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.filter = `contrast(${100 + amount}%)`;
      this.ctx.drawImage(image, 0, 0);
      this.ctx.filter = "none";
    }
  }
  
  export default EffectsManager;