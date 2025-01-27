class EraseManager {
    private ctx: CanvasRenderingContext2D;
    private isErasing: boolean = false;
    private eraseRadius: number = 10;
  
    constructor(ctx: CanvasRenderingContext2D) {
      this.ctx = ctx;
    }
  
    public start() {
      this.isErasing = true;
      this.ctx.globalCompositeOperation = 'destination-out';
    }
  
    public stop() {
      this.isErasing = false;
      this.ctx.globalCompositeOperation = 'source-over';
    }
  
    public setRadius(radius: number) {
      this.eraseRadius = radius;
    }
  
    public erase(x: number, y: number) {
      if (!this.isErasing) return;
  
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.eraseRadius, 0, Math.PI * 2, false);
      this.ctx.fill();
    }
  }
  
  export default EraseManager;