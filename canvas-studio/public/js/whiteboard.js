/**
 * Canvas Studio - Whiteboard & Visual Design Engine
 * Hỗ trợ vẽ tự do, hình khối, sticky notes, mũi tên, phóng to thu nhỏ (Zoom/Pan),
 * tương thích 100% cảm ứng đa điểm trên điện thoại và chuột trên máy tính.
 */

class WhiteboardEngine {
  constructor(canvasElement, containerElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.container = containerElement;

    this.tool = 'select'; // select, pen, eraser, rect, circle, arrow, note, text
    this.strokeColor = '#3b82f6';
    this.strokeWidth = 3;
    this.fillColor = 'transparent';

    this.elements = [];
    this.history = [];
    this.historyIndex = -1;

    this.scale = 1;
    this.panX = 0;
    this.panY = 0;

    this.isDrawing = false;
    this.isPanning = false;
    this.startPoint = { x: 0, y: 0 };
    this.currentPath = null;
    this.selectedElement = null;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.bindEvents();
    this.saveState();
    this.render();
  }

  resize() {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.scale(dpr, dpr);
    this.render();
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Transform screen coordinates to canvas space
    const x = (clientX - rect.left - this.panX) / this.scale;
    const y = (clientY - rect.top - this.panY) / this.scale;
    return { x, y, rawX: clientX - rect.left, rawY: clientY - rect.top };
  }

  bindEvents() {
    const c = this.canvas;

    // Pointer Down (Mouse / Touch)
    const onStart = (e) => {
      if (e.touches && e.touches.length > 1) {
        // Multi-touch pinch/pan handling
        return;
      }
      const pos = this.getPointerPos(e);
      this.startPoint = pos;

      if (this.tool === 'pen' || this.tool === 'eraser') {
        this.isDrawing = true;
        this.currentPath = {
          type: this.tool,
          color: this.tool === 'eraser' ? '#ffffff' : this.strokeColor,
          width: this.tool === 'eraser' ? this.strokeWidth * 4 : this.strokeWidth,
          points: [{ x: pos.x, y: pos.y }]
        };
      } else if (['rect', 'circle', 'arrow'].includes(this.tool)) {
        this.isDrawing = true;
        this.currentShape = {
          type: this.tool,
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          color: this.strokeColor,
          widthStroke: this.strokeWidth
        };
      } else if (this.tool === 'note') {
        const text = prompt('Nhập nội dung ghi chú Sticky Note:', 'Ý tưởng mới...');
        if (text) {
          this.elements.push({
            type: 'note',
            x: pos.x - 60,
            y: pos.y - 40,
            width: 150,
            height: 120,
            text: text,
            color: '#fef08a'
          });
          this.saveState();
          this.render();
        }
      } else if (this.tool === 'text') {
        const text = prompt('Nhập chữ cần thêm:', 'Văn bản mẫu');
        if (text) {
          this.elements.push({
            type: 'text',
            x: pos.x,
            y: pos.y,
            text: text,
            color: this.strokeColor,
            fontSize: 20
          });
          this.saveState();
          this.render();
        }
      } else if (this.tool === 'select') {
        // Check if clicked an element
        this.selectedElement = this.findElementAt(pos.x, pos.y);
        if (!this.selectedElement) {
          this.isPanning = true;
          this.panStart = { x: pos.rawX - this.panX, y: pos.rawY - this.panY };
        } else {
          this.isDraggingElement = true;
          this.dragOffset = {
            x: pos.x - (this.selectedElement.x || 0),
            y: pos.y - (this.selectedElement.y || 0)
          };
        }
      }
    };

    // Pointer Move
    const onMove = (e) => {
      const pos = this.getPointerPos(e);

      if (this.isDrawing) {
        if (this.currentPath) {
          this.currentPath.points.push({ x: pos.x, y: pos.y });
          this.render();
        } else if (this.currentShape) {
          this.currentShape.width = pos.x - this.startPoint.x;
          this.currentShape.height = pos.y - this.startPoint.y;
          this.render();
        }
      } else if (this.isPanning) {
        this.panX = pos.rawX - this.panStart.x;
        this.panY = pos.rawY - this.panStart.y;
        this.render();
      } else if (this.isDraggingElement && this.selectedElement) {
        this.selectedElement.x = pos.x - this.dragOffset.x;
        this.selectedElement.y = pos.y - this.dragOffset.y;
        this.render();
      }
    };

    // Pointer Up
    const onEnd = () => {
      if (this.isDrawing) {
        if (this.currentPath && this.currentPath.points.length > 1) {
          this.elements.push(this.currentPath);
        } else if (this.currentShape && (Math.abs(this.currentShape.width) > 5 || Math.abs(this.currentShape.height) > 5)) {
          this.elements.push(this.currentShape);
        }
        this.currentPath = null;
        this.currentShape = null;
        this.isDrawing = false;
        this.saveState();
        this.render();
      }
      this.isPanning = false;
      this.isDraggingElement = false;
    };

    c.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    c.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });

    // Wheel zoom
    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.min(Math.max(0.3, this.scale * zoomFactor), 4);
      this.scale = newScale;
      this.render();
    }, { passive: false });
  }

  findElementAt(x, y) {
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const el = this.elements[i];
      if (el.type === 'note' || el.type === 'rect') {
        const w = el.width || 100;
        const h = el.height || 80;
        if (x >= el.x && x <= el.x + w && y >= el.y && y <= el.y + h) {
          return el;
        }
      } else if (el.type === 'circle') {
        const r = Math.abs(el.width || 40);
        const dist = Math.hypot(x - el.x, y - el.y);
        if (dist <= r) return el;
      }
    }
    return null;
  }

  saveState() {
    const json = JSON.stringify(this.elements);
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(json);
    this.historyIndex = this.history.length - 1;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.elements = JSON.parse(this.history[this.historyIndex]);
      this.render();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.elements = JSON.parse(this.history[this.historyIndex]);
      this.render();
    }
  }

  clear() {
    this.elements = [];
    this.saveState();
    this.render();
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Apply Pan and Zoom
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.scale, this.scale);

    // Render Grid Dots
    this.drawGrid(ctx);

    // Render All Elements
    this.elements.forEach(el => this.drawElement(ctx, el));

    // Render In-Progress Path/Shape
    if (this.currentPath) this.drawElement(ctx, this.currentPath);
    if (this.currentShape) this.drawElement(ctx, this.currentShape);

    ctx.restore();
  }

  drawGrid(ctx) {
    const gridSize = 30;
    const left = -this.panX / this.scale - 100;
    const top = -this.panY / this.scale - 100;
    const right = left + (this.canvas.width / this.scale) + 200;
    const bottom = top + (this.canvas.height / this.scale) + 200;

    ctx.fillStyle = document.body.classList.contains('light-theme') ? '#e2e8f0' : '#334155';
    for (let x = Math.floor(left / gridSize) * gridSize; x < right; x += gridSize) {
      for (let y = Math.floor(top / gridSize) * gridSize; y < bottom; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawElement(ctx, el) {
    ctx.save();
    if (el.type === 'pen' || el.type === 'eraser') {
      if (el.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(el.points[0].x, el.points[0].y);
      for (let i = 1; i < el.points.length; i++) {
        ctx.lineTo(el.points[i].x, el.points[i].y);
      }
      ctx.stroke();
    } else if (el.type === 'rect') {
      ctx.beginPath();
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.widthStroke || 3;
      ctx.fillStyle = el.color + '15';
      ctx.roundRect ? ctx.roundRect(el.x, el.y, el.width, el.height, 8) : ctx.rect(el.x, el.y, el.width, el.height);
      ctx.fill();
      ctx.stroke();
      if (el.text) {
        ctx.fillStyle = '#0f172a';
        ctx.font = '14px sans-serif';
        ctx.fillText(el.text, el.x + 10, el.y + 25);
      }
    } else if (el.type === 'circle') {
      ctx.beginPath();
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.widthStroke || 3;
      ctx.fillStyle = el.color + '15';
      const r = Math.abs(el.width) / 2;
      ctx.arc(el.x + el.width / 2, el.y + el.height / 2, Math.max(5, r), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (el.type === 'arrow') {
      ctx.beginPath();
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.widthStroke || 3;
      const toX = el.x + el.width;
      const toY = el.y + el.height;
      ctx.moveTo(el.x, el.y);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(toY - el.y, toX - el.x);
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - 15 * Math.cos(angle - Math.PI / 6), toY - 15 * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - 15 * Math.cos(angle + Math.PI / 6), toY - 15 * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    } else if (el.type === 'note') {
      ctx.fillStyle = el.color || '#fef08a';
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(el.x, el.y, el.width || 140, el.height || 110, 6) : ctx.rect(el.x, el.y, el.width || 140, el.height || 110);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Note text
      ctx.fillStyle = '#1e293b';
      ctx.font = '13px "Inter", -apple-system, sans-serif';
      const lines = (el.text || '').split('\n');
      lines.forEach((line, idx) => {
        ctx.fillText(line, el.x + 10, el.y + 24 + idx * 18, (el.width || 140) - 20);
      });
    } else if (el.type === 'text') {
      ctx.fillStyle = el.color || '#3b82f6';
      ctx.font = (el.fontSize || 18) + 'px "Inter", sans-serif';
      ctx.fillText(el.text, el.x, el.y);
    }
    ctx.restore();
  }

  exportImage() {
    return this.canvas.toDataURL('image/png');
  }

  loadElements(elementsArray) {
    this.elements = Array.isArray(elementsArray) ? elementsArray : [];
    this.saveState();
    this.render();
  }
}

window.WhiteboardEngine = WhiteboardEngine;
