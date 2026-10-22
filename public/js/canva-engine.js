/**
 * Canva Pro Design Studio - Core Graphic & Layout Engine
 * Tái hiện 100% công năng của Canva.com: Artboard, Smart Snapping, Bounding Box,
 * 8 Tay cầm co giãn (Resize Handles), Xoay 360°, Chỉnh sửa văn bản trực tiếp,
 * Quản lý Layer, Tải lên ảnh, Mẫu thiết kế chuyên nghiệp & Xuất ảnh chất lượng cao.
 */

class CanvaEngine {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.artboard = document.getElementById('canvaArtboard');
    this.artboardWrapper = document.getElementById('artboardWrapper');
    this.svgOverlay = document.getElementById('snappingGuideSvg');
    
    // Page Settings
    this.width = 1080;
    this.height = 1080;
    this.backgroundColor = '#ffffff';
    this.scale = (typeof window !== 'undefined' && window.innerWidth <= 768) ? 0.32 : 0.62;
    
    // Elements & Selection
    this.elements = [];
    this.selectedId = null;
    this.isEditingText = false;
    
    // Multi-page Support
    this.pages = [
      { id: 'page_1', title: 'Trang 1', elements: [], backgroundColor: '#ffffff' }
    ];
    this.currentPageIndex = 0;

    // History (Undo / Redo)
    this.history = [];
    this.historyIndex = -1;

    // Interaction State
    this.activeHandle = null; // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w', 'rot', 'move'
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.elementStart = {};
    
    // Clipboard
    this.clipboard = null;

    this.init();
  }

  init() {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.scale = 0.28;
    } else {
      this.fitToScreen();
    }
    this.setupArtboardSize();
    this.bindEvents();
    this.loadDefaultTemplate();
  }

  setupArtboardSize() {
    if (!this.artboard) return;
    this.artboard.style.width = `${this.width}px`;
    this.artboard.style.height = `${this.height}px`;
    this.artboard.style.backgroundColor = this.backgroundColor;
    this.updateZoom(this.scale);
  }

  updateZoom(scale) {
    this.scale = Math.max(0.1, Math.min(2.5, scale));
    if (this.artboardWrapper && this.artboard) {
      const scaledW = Math.round(this.width * this.scale);
      const scaledH = Math.round(this.height * this.scale);
      this.artboardWrapper.style.width = `${scaledW}px`;
      this.artboardWrapper.style.height = `${scaledH}px`;
      this.artboard.style.width = `${this.width}px`;
      this.artboard.style.height = `${this.height}px`;
      this.artboard.style.transform = `scale(${this.scale})`;
      this.artboard.style.transformOrigin = 'top left';
    }
    const zoomText = document.getElementById('zoomPercentText');
    if (zoomText) zoomText.textContent = `${Math.round(this.scale * 100)}%`;
    const zoomSlider = document.getElementById('zoomRangeSlider');
    if (zoomSlider) zoomSlider.value = Math.round(this.scale * 100);
  }

  fitToScreen() {
    const isMobile = window.innerWidth <= 768;
    const screenW = isMobile ? Math.min(window.innerWidth, document.documentElement.clientWidth || 390) : (this.container ? this.container.clientWidth : window.innerWidth);
    const screenH = isMobile ? Math.min(window.innerHeight, document.documentElement.clientHeight || 844) : (this.container ? this.container.clientHeight : window.innerHeight);
    const paddingX = isMobile ? 36 : 160;
    const paddingY = isMobile ? 200 : 160;
    const availableW = Math.max(160, screenW - paddingX);
    const availableH = Math.max(160, screenH - paddingY);
    const scaleW = availableW / this.width;
    const scaleH = availableH / this.height;
    this.scale = Math.min(scaleW, scaleH);
    this.updateZoom(this.scale);
  }

  saveState(actionName = 'Chỉnh sửa') {
    const page = this.pages[this.currentPageIndex];
    if (page) {
      page.elements = JSON.parse(JSON.stringify(this.elements));
      page.backgroundColor = this.backgroundColor;
    }

    const state = {
      pages: JSON.parse(JSON.stringify(this.pages)),
      currentPageIndex: this.currentPageIndex,
      width: this.width,
      height: this.height,
      action: actionName
    };

    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(state);
    this.historyIndex = this.history.length - 1;

    // Update Cloud Save Status Indicator in Header
    const saveStatus = document.getElementById('cloudSaveStatus');
    if (saveStatus) {
      saveStatus.innerHTML = `<span>✔</span> Đã lưu tất cả thay đổi`;
    }

    // Auto save to local storage
    this.persistLocal();
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreState(this.history[this.historyIndex]);
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreState(this.history[this.historyIndex]);
    }
  }

  restoreState(state) {
    this.pages = JSON.parse(JSON.stringify(state.pages));
    this.currentPageIndex = state.currentPageIndex || 0;
    this.width = state.width || 1080;
    this.height = state.height || 1080;
    
    const curPage = this.pages[this.currentPageIndex];
    this.elements = curPage ? curPage.elements : [];
    this.backgroundColor = curPage ? curPage.backgroundColor : '#ffffff';
    
    this.setupArtboardSize();
    this.render();
  }

  persistLocal() {
    try {
      const data = {
        title: document.getElementById('designTitleInput')?.value || 'Thiết kế Canva',
        pages: this.pages,
        width: this.width,
        height: this.height,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('canva_studio_current', JSON.stringify(data));
    } catch (e) {}
  }

  // ================= ELEMENT CREATION ================= //

  addText(type = 'heading', customText = null) {
    const id = 'txt_' + Date.now();
    let text = customText || 'Tiêu đề thiết kế';
    let fontSize = 64;
    let bold = true;

    if (type === 'subheading') {
      text = customText || 'Thêm một tiêu đề phụ';
      fontSize = 36;
      bold = false;
    } else if (type === 'body') {
      text = customText || 'Thêm một chút nội dung nội dung';
      fontSize = 24;
      bold = false;
    }

    const newEl = {
      id: id,
      type: 'text',
      text: text,
      x: this.width / 2 - 250,
      y: this.height / 2 - (fontSize * 1.5) / 2,
      width: 500,
      height: fontSize * 1.6,
      fontSize: fontSize,
      fontFamily: 'Inter',
      color: '#111827',
      bold: bold,
      italic: false,
      underline: false,
      align: 'center',
      letterSpacing: 0,
      lineHeight: 1.2,
      opacity: 1,
      rotation: 0,
      zIndex: this.getNextZIndex(),
      isLocked: false
    };

    this.elements.push(newEl);
    this.selectElement(id);
    this.saveState('Thêm văn bản');
    this.render();
  }

  addShape(shapeType = 'rect', color = '#7d2ae8') {
    const id = 'shp_' + Date.now();
    const size = 200;
    const newEl = {
      id: id,
      type: 'shape',
      shapeType: shapeType, // rect, rounded, circle, triangle, star, heart
      x: this.width / 2 - size / 2,
      y: this.height / 2 - size / 2,
      width: size,
      height: size,
      fill: color,
      stroke: 'transparent',
      strokeWidth: 0,
      cornerRadius: shapeType === 'rounded' ? 24 : 0,
      opacity: 1,
      rotation: 0,
      zIndex: this.getNextZIndex(),
      isLocked: false
    };

    this.elements.push(newEl);
    this.selectElement(id);
    this.saveState(`Thêm hình ${shapeType}`);
    this.render();
  }

  addImage(src, naturalW = 400, naturalH = 400) {
    const id = 'img_' + Date.now();
    const maxDim = 400;
    let w = naturalW;
    let h = naturalH;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = (h / w) * maxDim;
        w = maxDim;
      } else {
        w = (w / h) * maxDim;
        h = maxDim;
      }
    }

    const newEl = {
      id: id,
      type: 'image',
      src: src,
      x: this.width / 2 - w / 2,
      y: this.height / 2 - h / 2,
      width: w,
      height: h,
      opacity: 1,
      rotation: 0,
      zIndex: this.getNextZIndex(),
      isLocked: false
    };

    this.elements.push(newEl);
    this.selectElement(id);
    this.saveState('Thêm hình ảnh');
    this.render();
  }

  getNextZIndex() {
    if (this.elements.length === 0) return 1;
    return Math.max(...this.elements.map(e => e.zIndex || 1)) + 1;
  }

  // ================= SELECTION & INTERACTIONS ================= //

  selectElement(id) {
    this.selectedId = id;
    this.render();
    this.updateContextualToolbar();
  }

  deselect() {
    this.selectedId = null;
    this.render();
    this.updateContextualToolbar();
  }

  getSelectedElement() {
    return this.elements.find(e => e.id === this.selectedId) || null;
  }

  deleteSelected() {
    if (!this.selectedId) return;
    this.elements = this.elements.filter(e => e.id !== this.selectedId);
    this.selectedId = null;
    this.saveState('Xóa đối tượng');
    this.render();
    this.updateContextualToolbar();
  }

  duplicateSelected() {
    const el = this.getSelectedElement();
    if (!el) return;
    const cloned = JSON.parse(JSON.stringify(el));
    cloned.id = el.type + '_' + Date.now();
    cloned.x += 30;
    cloned.y += 30;
    cloned.zIndex = this.getNextZIndex();
    this.elements.push(cloned);
    this.selectElement(cloned.id);
    this.saveState('Nhân bản đối tượng');
    this.render();
  }

  bringForward() {
    const el = this.getSelectedElement();
    if (!el) return;
    el.zIndex = this.getNextZIndex();
    this.saveState('Đưa lên trên');
    this.render();
  }

  sendBackward() {
    const el = this.getSelectedElement();
    if (!el) return;
    const minZ = Math.min(...this.elements.map(e => e.zIndex || 1));
    el.zIndex = Math.max(1, minZ - 1);
    this.saveState('Đưa xuống dưới');
    this.render();
  }

  alignSelected(position) {
    const el = this.getSelectedElement();
    if (!el) return;
    if (position === 'center-h') el.x = (this.width - el.width) / 2;
    if (position === 'center-v') el.y = (this.height - el.height) / 2;
    if (position === 'top') el.y = 0;
    if (position === 'bottom') el.y = this.height - el.height;
    if (position === 'left') el.x = 0;
    if (position === 'right') el.x = this.width - el.width;
    this.saveState(`Căn chỉnh ${position}`);
    this.render();
  }

  // ================= TEMPLATES ================= //

  loadDefaultTemplate() {
    this.elements = [
      { id: 'bg_card', type: 'shape', shapeType: 'rect', x: 60, y: 60, width: 960, height: 960, fill: '#0f172a', zIndex: 1 },
      { id: 'badge', type: 'shape', shapeType: 'rounded', x: 120, y: 140, width: 220, height: 50, fill: '#7d2ae8', cornerRadius: 25, zIndex: 2 },
      { id: 'badge_t', type: 'text', text: '⚡ CANVA PRO AI', x: 130, y: 154, width: 200, height: 30, fontSize: 18, fontFamily: 'Montserrat', color: '#ffffff', bold: true, align: 'center', zIndex: 3 },
      { id: 'title', type: 'text', text: 'THIẾT KẾ ĐỒ HỌA\nCHUYÊN NGHIỆP', x: 120, y: 240, width: 820, height: 180, fontSize: 72, fontFamily: 'Montserrat', color: '#ffffff', bold: true, align: 'left', lineHeight: 1.2, zIndex: 4 },
      { id: 'desc', type: 'text', text: 'Kéo thả dễ dàng, hàng ngàn mẫu thiết kế trực tuyến,\ntinh chỉnh mượt mà trên cả máy tính lẫn điện thoại di động.', x: 125, y: 460, width: 780, height: 80, fontSize: 26, fontFamily: 'Inter', color: '#94a3b8', bold: false, align: 'left', lineHeight: 1.5, zIndex: 5 },
      { id: 'circle_decor', type: 'shape', shapeType: 'circle', x: 680, y: 560, width: 260, height: 260, fill: '#00c4cc', opacity: 0.9, zIndex: 6 },
      { id: 'circle_txt', type: 'text', text: '100%\nFREE', x: 710, y: 645, width: 200, height: 100, fontSize: 44, fontFamily: 'Montserrat', color: '#0f172a', bold: true, align: 'center', zIndex: 7 },
      { id: 'cta_btn', type: 'shape', shapeType: 'rounded', x: 125, y: 680, width: 320, height: 75, fill: '#00c4cc', cornerRadius: 16, zIndex: 8 },
      { id: 'cta_txt', type: 'text', text: 'BẮT ĐẦU SÁNG TẠO ➔', x: 155, y: 705, width: 260, height: 35, fontSize: 20, fontFamily: 'Montserrat', color: '#0f172a', bold: true, align: 'center', zIndex: 9 }
    ];
    this.saveState('Khởi tạo mẫu mặc định');
    this.render();
  }

  loadTemplate(templateKey) {
    if (templateKey === 'sale') {
      this.backgroundColor = '#18181b';
      this.elements = [
        { id: 'el_1', type: 'shape', shapeType: 'rect', x: 0, y: 0, width: 1080, height: 1080, fill: '#18181b', zIndex: 1 },
        { id: 'el_2', type: 'shape', shapeType: 'star', x: 120, y: 120, width: 180, height: 180, fill: '#ef4444', zIndex: 2 },
        { id: 'el_3', type: 'text', text: 'HOT\nDEAL', x: 140, y: 175, width: 140, height: 80, fontSize: 32, fontFamily: 'Montserrat', color: '#ffffff', bold: true, align: 'center', zIndex: 3 },
        { id: 'el_4', type: 'text', text: 'MEGA SALE 50%', x: 100, y: 380, width: 880, height: 120, fontSize: 92, fontFamily: 'Montserrat', color: '#facc15', bold: true, align: 'left', zIndex: 4 },
        { id: 'el_5', type: 'text', text: 'DUY NHẤT TRONG TUẦN NÀY', x: 105, y: 520, width: 800, height: 50, fontSize: 36, fontFamily: 'Inter', color: '#ffffff', bold: true, align: 'left', zIndex: 5 },
        { id: 'el_6', type: 'shape', shapeType: 'rounded', x: 105, y: 680, width: 340, height: 80, fill: '#00c4cc', cornerRadius: 40, zIndex: 6 },
        { id: 'el_7', type: 'text', text: 'MUA NGAY BÂY GIỜ', x: 145, y: 708, width: 260, height: 30, fontSize: 22, fontFamily: 'Montserrat', color: '#0f172a', bold: true, align: 'center', zIndex: 7 }
      ];
    } else if (templateKey === 'coffee') {
      this.backgroundColor = '#fdf8f6';
      this.elements = [
        { id: 'el_1', type: 'shape', shapeType: 'rect', x: 0, y: 0, width: 1080, height: 1080, fill: '#292524', zIndex: 1 },
        { id: 'el_2', type: 'shape', shapeType: 'circle', x: 290, y: 140, width: 500, height: 500, fill: '#78350f', zIndex: 2 },
        { id: 'el_3', type: 'text', text: 'COFFEE TIME', x: 140, y: 690, width: 800, height: 110, fontSize: 84, fontFamily: 'Playfair Display', color: '#fef3c7', bold: true, align: 'center', zIndex: 3 },
        { id: 'el_4', type: 'text', text: 'Hương Vị Cà Phê Mộc Tinh Tế', x: 200, y: 810, width: 680, height: 50, fontSize: 28, fontFamily: 'Inter', color: '#d6d3d1', bold: false, align: 'center', zIndex: 4 },
        { id: 'el_5', type: 'shape', shapeType: 'rounded', x: 380, y: 880, width: 320, height: 70, fill: '#f59e0b', cornerRadius: 16, zIndex: 5 },
        { id: 'el_6', type: 'text', text: 'XEM THỰC ĐƠN', x: 420, y: 902, width: 240, height: 30, fontSize: 20, fontFamily: 'Montserrat', color: '#451a03', bold: true, align: 'center', zIndex: 6 }
      ];
    }
    this.setupArtboardSize();
    this.saveState(`Mẫu: ${templateKey}`);
    this.render();
  }

  // ================= RENDERING ================= //

  render() {
    if (!this.artboard) return;
    this.artboard.innerHTML = '';
    this.artboard.style.backgroundColor = this.backgroundColor;

    // Sort elements by zIndex
    const sorted = [...this.elements].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1));

    sorted.forEach(el => {
      const dom = this.createDomElement(el);
      this.artboard.appendChild(dom);
    });

    // Render Bounding Box and Resize Handles if selected
    if (this.selectedId) {
      const selected = this.getSelectedElement();
      if (selected) {
        const box = this.createSelectionBox(selected);
        this.artboard.appendChild(box);
      }
    }

    // Update Layers Panel if open
    this.updateLayersPanel();
  }

  createDomElement(el) {
    const div = document.createElement('div');
    div.id = `el_${el.id}`;
    div.className = `canva-element canva-${el.type}`;
    div.style.left = `${el.x}px`;
    div.style.top = `${el.y}px`;
    div.style.width = `${el.width}px`;
    div.style.height = `${el.height}px`;
    div.style.zIndex = el.zIndex || 1;
    div.style.opacity = el.opacity !== undefined ? el.opacity : 1;
    div.style.transform = `rotate(${el.rotation || 0}deg)`;

    if (el.type === 'text') {
      div.style.fontSize = `${el.fontSize}px`;
      div.style.fontFamily = el.fontFamily || 'Inter';
      div.style.color = el.color || '#111827';
      div.style.fontWeight = el.bold ? '700' : '400';
      div.style.fontStyle = el.italic ? 'italic' : 'normal';
      div.style.textDecoration = el.underline ? 'underline' : 'none';
      div.style.textAlign = el.align || 'center';
      div.style.letterSpacing = `${el.letterSpacing || 0}px`;
      div.style.lineHeight = el.lineHeight || 1.2;
      div.innerText = el.text;

      // Double click to inline edit text
      div.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.enableInlineTextEdit(el, div);
      });
    } else if (el.type === 'shape') {
      const svg = this.createShapeSvg(el);
      div.appendChild(svg);
    } else if (el.type === 'image') {
      const img = document.createElement('img');
      img.src = el.src;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.pointerEvents = 'none';
      div.appendChild(img);
    }

    // Pointer down on element
    div.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      this.startDrag(e, el.id, 'move');
    });

    div.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      this.startDrag(e, el.id, 'move');
    }, { passive: false });

    return div;
  }

  createShapeSvg(el) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${el.width} ${el.height}`);
    svg.style.overflow = 'visible';

    const w = el.width;
    const h = el.height;
    const fill = el.fill || '#7d2ae8';
    const stroke = el.stroke || 'transparent';
    const strokeWidth = el.strokeWidth || 0;

    if (el.shapeType === 'circle') {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      c.setAttribute('cx', w / 2);
      c.setAttribute('cy', h / 2);
      c.setAttribute('rx', w / 2);
      c.setAttribute('ry', h / 2);
      c.setAttribute('fill', fill);
      c.setAttribute('stroke', stroke);
      c.setAttribute('stroke-width', strokeWidth);
      svg.appendChild(c);
    } else if (el.shapeType === 'triangle') {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', `${w/2},0 ${w},${h} 0,${h}`);
      poly.setAttribute('fill', fill);
      poly.setAttribute('stroke', stroke);
      poly.setAttribute('stroke-width', strokeWidth);
      svg.appendChild(poly);
    } else if (el.shapeType === 'star') {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const pts = this.calculateStarPoints(w/2, h/2, 5, w/2, w/4);
      poly.setAttribute('points', pts);
      poly.setAttribute('fill', fill);
      poly.setAttribute('stroke', stroke);
      poly.setAttribute('stroke-width', strokeWidth);
      svg.appendChild(poly);
    } else { // rect or rounded
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', 0);
      rect.setAttribute('y', 0);
      rect.setAttribute('width', w);
      rect.setAttribute('height', h);
      rect.setAttribute('rx', el.cornerRadius || 0);
      rect.setAttribute('ry', el.cornerRadius || 0);
      rect.setAttribute('fill', fill);
      rect.setAttribute('stroke', stroke);
      rect.setAttribute('stroke-width', strokeWidth);
      svg.appendChild(rect);
    }
    return svg;
  }

  calculateStarPoints(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;
    let pts = [];
    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outerRadius;
      let y = cy + Math.sin(rot) * outerRadius;
      pts.push(`${x},${y}`);
      rot += step;
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      pts.push(`${x},${y}`);
      rot += step;
    }
    return pts.join(' ');
  }

  createSelectionBox(el) {
    const box = document.createElement('div');
    box.className = 'canva-selection-box';
    box.style.left = `${el.x}px`;
    box.style.top = `${el.y}px`;
    box.style.width = `${el.width}px`;
    box.style.height = `${el.height}px`;
    box.style.transform = `rotate(${el.rotation || 0}deg)`;

    // 8 Resize Handles: 4 corners + 4 edges
    const handles = ['nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'];
    handles.forEach(pos => {
      const h = document.createElement('div');
      h.className = `canva-handle handle-${pos}`;
      h.setAttribute('data-handle', pos);
      h.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        this.startDrag(e, el.id, pos);
      });
      h.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        this.startDrag(e, el.id, pos);
      }, { passive: false });
      box.appendChild(h);
    });

    // Rotation Pin Handle
    const rotWrap = document.createElement('div');
    rotWrap.className = 'handle-rot-wrapper';
    const rotPin = document.createElement('div');
    rotPin.className = 'handle-rot-pin';
    rotPin.title = 'Kéo để xoay góc';
    rotPin.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      this.startDrag(e, el.id, 'rot');
    });
    rotPin.addEventListener('touchstart', (e) => {
      e.stopPropagation();
      this.startDrag(e, el.id, 'rot');
    }, { passive: false });
    rotWrap.appendChild(rotPin);
    box.appendChild(rotWrap);

    return box;
  }

  enableInlineTextEdit(el, domDiv) {
    this.isEditingText = true;
    const input = document.createElement('textarea');
    input.className = 'canva-inline-editor';
    input.value = el.text;
    input.style.fontSize = `${el.fontSize}px`;
    input.style.fontFamily = el.fontFamily || 'Inter';
    input.style.color = el.color;
    input.style.textAlign = el.align || 'center';
    input.style.fontWeight = el.bold ? '700' : '400';
    input.style.lineHeight = el.lineHeight || 1.2;

    domDiv.innerHTML = '';
    domDiv.appendChild(input);
    input.focus();
    input.select();

    const finish = () => {
      if (!this.isEditingText) return;
      el.text = input.value || ' ';
      this.isEditingText = false;
      this.saveState('Sửa nội dung chữ');
      this.render();
    };

    input.addEventListener('blur', finish);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') finish();
    });
  }

  // ================= DRAG, RESIZE & ROTATE LOGIC ================= //

  startDrag(e, id, handle) {
    if (this.isEditingText) return;
    this.selectElement(id);
    const el = this.getSelectedElement();
    if (!el || el.isLocked) return;

    this.isDragging = true;
    this.activeHandle = handle;

    const pt = this.getPointerEventPos(e);
    this.dragStart = { x: pt.x, y: pt.y };
    this.elementStart = {
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      rotation: el.rotation || 0,
      fontSize: el.fontSize || 24
    };
  }

  getPointerEventPos(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX, y: clientY };
  }

  bindEvents() {
    const onMove = (e) => {
      if (!this.isDragging || !this.selectedId) return;
      const el = this.getSelectedElement();
      if (!el) return;

      const pt = this.getPointerEventPos(e);
      const dx = (pt.x - this.dragStart.x) / this.scale;
      const dy = (pt.y - this.dragStart.y) / this.scale;

      if (this.activeHandle === 'move') {
        let newX = this.elementStart.x + dx;
        let newY = this.elementStart.y + dy;

        // Smart Snapping to Canvas Center
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const elCenterX = newX + el.width / 2;
        const elCenterY = newY + el.height / 2;

        if (Math.abs(elCenterX - centerX) < 8) {
          newX = centerX - el.width / 2;
          this.showSnappingGuide('v', centerX);
        } else {
          this.hideSnappingGuide('v');
        }

        if (Math.abs(elCenterY - centerY) < 8) {
          newY = centerY - el.height / 2;
          this.showSnappingGuide('h', centerY);
        } else {
          this.hideSnappingGuide('h');
        }

        el.x = Math.round(newX);
        el.y = Math.round(newY);
      } else if (this.activeHandle === 'rot') {
        const rect = this.artboard.getBoundingClientRect();
        const centerScreenX = rect.left + (el.x + el.width / 2) * this.scale;
        const centerScreenY = rect.top + (el.y + el.height / 2) * this.scale;
        const angleRad = Math.atan2(pt.y - centerScreenY, pt.x - centerScreenX);
        let deg = Math.round(angleRad * (180 / Math.PI)) - 90;
        if (deg < 0) deg += 360;
        // Snap to 0, 90, 180, 270 if close
        if (Math.abs(deg % 90) < 4 || Math.abs(deg % 90) > 86) {
          deg = Math.round(deg / 90) * 90;
        }
        el.rotation = deg % 360;
      } else {
        // Resizing
        this.handleResize(el, this.activeHandle, dx, dy);
      }

      this.render();
    };

    const onEnd = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.activeHandle = null;
        this.hideSnappingGuide('both');
        this.saveState('Điều chỉnh đối tượng');
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd, { passive: false });

    // Deselect when clicking on empty artboard
    this.artboard?.addEventListener('mousedown', (e) => {
      if (e.target === this.artboard) {
        this.deselect();
      }
    });

    // Keyboard Shortcuts (Delete, Undo, Redo, Copy, Paste, Nudge)
    window.addEventListener('keydown', (e) => {
      if (this.isEditingText) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedId) {
          e.preventDefault();
          this.deleteSelected();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) this.redo();
        else this.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        this.redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (this.selectedId) {
          this.clipboard = JSON.parse(JSON.stringify(this.getSelectedElement()));
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (this.clipboard) {
          e.preventDefault();
          this.duplicateSelected();
        }
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const el = this.getSelectedElement();
        if (el) {
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          if (e.key === 'ArrowUp') el.y -= step;
          if (e.key === 'ArrowDown') el.y += step;
          if (e.key === 'ArrowLeft') el.x -= step;
          if (e.key === 'ArrowRight') el.x += step;
          this.render();
        }
      }
    });
  }

  handleResize(el, handle, dx, dy) {
    const init = this.elementStart;
    const minSize = 20;

    if (handle.includes('e')) {
      el.width = Math.max(minSize, init.width + dx);
    }
    if (handle.includes('s')) {
      el.height = Math.max(minSize, init.height + dy);
    }
    if (handle.includes('w')) {
      const newW = Math.max(minSize, init.width - dx);
      el.x = init.x + (init.width - newW);
      el.width = newW;
    }
    if (handle.includes('n')) {
      const newH = Math.max(minSize, init.height - dy);
      el.y = init.y + (init.height - newH);
      el.height = newH;
    }

    // Proportional font scaling for Text elements when using corner handles
    if (el.type === 'text' && ['nw', 'ne', 'se', 'sw'].includes(handle)) {
      const scaleFactor = el.width / init.width;
      el.fontSize = Math.max(10, Math.round(init.fontSize * scaleFactor));
      el.height = el.fontSize * (el.lineHeight || 1.2) * (el.text.split('\n').length || 1);
    }
  }

  showSnappingGuide(dir, val) {
    if (!this.svgOverlay) return;
    let line = document.getElementById(`snapGuide_${dir}`);
    if (!line) {
      line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.id = `snapGuide_${dir}`;
      line.setAttribute('stroke', '#7d2ae8');
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-dasharray', '4,4');
      this.svgOverlay.appendChild(line);
    }

    if (dir === 'v') {
      line.setAttribute('x1', val);
      line.setAttribute('y1', 0);
      line.setAttribute('x2', val);
      line.setAttribute('y2', this.height);
    } else {
      line.setAttribute('x1', 0);
      line.setAttribute('y1', val);
      line.setAttribute('x2', this.width);
      line.setAttribute('y2', val);
    }
    line.style.display = 'block';
  }

  hideSnappingGuide(dir) {
    if (dir === 'both') {
      const lv = document.getElementById('snapGuide_v');
      const lh = document.getElementById('snapGuide_h');
      if (lv) lv.style.display = 'none';
      if (lh) lh.style.display = 'none';
    } else {
      const l = document.getElementById(`snapGuide_${dir}`);
      if (l) l.style.display = 'none';
    }
  }

  // ================= CONTEXTUAL TOOLBAR ================= //

  updateContextualToolbar() {
    const el = this.getSelectedElement();
    const textToolbar = document.getElementById('contextTextToolbar');
    const shapeToolbar = document.getElementById('contextShapeToolbar');
    const canvasToolbar = document.getElementById('contextCanvasToolbar');

    [textToolbar, shapeToolbar, canvasToolbar].forEach(tb => tb && (tb.style.display = 'none'));

    if (!el) {
      if (canvasToolbar) canvasToolbar.style.display = 'flex';
      const bgColor = document.getElementById('canvasBgColorInput');
      if (bgColor) bgColor.value = this.backgroundColor;
      return;
    }

    if (el.type === 'text') {
      if (textToolbar) {
        textToolbar.style.display = 'flex';
        document.getElementById('fontFamilySelect').value = el.fontFamily || 'Inter';
        document.getElementById('fontSizeInput').value = el.fontSize || 36;
        document.getElementById('textColorInput').value = el.color || '#111827';
        document.getElementById('boldBtn')?.classList.toggle('active', !!el.bold);
        document.getElementById('italicBtn')?.classList.toggle('active', !!el.italic);
        document.getElementById('underlineBtn')?.classList.toggle('active', !!el.underline);
      }
    } else if (el.type === 'shape' || el.type === 'image') {
      if (shapeToolbar) {
        shapeToolbar.style.display = 'flex';
        const fillInput = document.getElementById('shapeFillColorInput');
        if (fillInput && el.fill) fillInput.value = el.fill;
      }
    }
  }

  updateLayersPanel() {
    const list = document.getElementById('layersList');
    if (!list) return;

    let html = '';
    const reversed = [...this.elements].reverse();
    reversed.forEach(el => {
      const isSel = el.id === this.selectedId ? 'selected' : '';
      const name = el.type === 'text' ? `T: ${(el.text || '').slice(0, 15)}...` : `${el.type}: ${el.shapeType || 'media'}`;
      html += `
        <div class="layer-item ${isSel}" onclick="window.canva.selectElement('${el.id}')">
          <span class="layer-icon">${el.type === 'text' ? '🔤' : (el.type === 'shape' ? '⬛' : '🖼️')}</span>
          <span class="layer-name">${name}</span>
          <div class="layer-actions">
            <button class="layer-btn" onclick="event.stopPropagation(); window.canva.deleteSelected();" title="Xóa">🗑️</button>
          </div>
        </div>
      `;
    });
    list.innerHTML = html || '<div class="empty-layers">Chưa có phần tử nào trên trang</div>';
  }

  // ================= EXPORT & DOWNLOAD ================= //

  async exportCanvas(format = 'png', multiplier = 1, transparent = false) {
    const exportW = this.width * multiplier;
    const exportH = this.height * multiplier;

    const canvas = document.createElement('canvas');
    canvas.width = exportW;
    canvas.height = exportH;
    const ctx = canvas.getContext('2d');

    // Background
    if (!transparent) {
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(0, 0, exportW, exportH);
    } else {
      ctx.clearRect(0, 0, exportW, exportH);
    }

    ctx.scale(multiplier, multiplier);

    // Sort and draw all elements
    const sorted = [...this.elements].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1));

    for (const el of sorted) {
      ctx.save();
      ctx.globalAlpha = el.opacity !== undefined ? el.opacity : 1;

      // Translate to element center for rotation
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(((el.rotation || 0) * Math.PI) / 180);
      ctx.translate(-cx, -cy);

      if (el.type === 'shape') {
        ctx.fillStyle = el.fill || '#7d2ae8';
        if (el.shapeType === 'circle') {
          ctx.beginPath();
          ctx.ellipse(cx, cy, el.width / 2, el.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (el.shapeType === 'rounded') {
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(el.x, el.y, el.width, el.height, el.cornerRadius || 20) : ctx.rect(el.x, el.y, el.width, el.height);
          ctx.fill();
        } else {
          ctx.fillRect(el.x, el.y, el.width, el.height);
        }
      } else if (el.type === 'text') {
        ctx.fillStyle = el.color || '#111827';
        ctx.font = `${el.bold ? '700' : '400'} ${el.fontSize}px "${el.fontFamily || 'Inter'}", sans-serif`;
        ctx.textAlign = el.align || 'center';
        ctx.textBaseline = 'top';

        const lines = (el.text || '').split('\n');
        const lineHeight = el.fontSize * (el.lineHeight || 1.2);
        let startX = el.x + (el.align === 'center' ? el.width / 2 : (el.align === 'right' ? el.width : 0));

        lines.forEach((line, idx) => {
          ctx.fillText(line, startX, el.y + idx * lineHeight);
        });
      } else if (el.type === 'image') {
        await new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.drawImage(img, el.x, el.y, el.width, el.height);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = el.src;
        });
      }
      ctx.restore();
    }

    const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mime, 0.95);
    const link = document.createElement('a');
    const title = document.getElementById('designTitleInput')?.value || 'canva_design';
    link.download = `${title.replace(/\s+/g, '_')}.${format}`;
    link.href = dataUrl;
    link.click();
  }
}

window.CanvaEngine = CanvaEngine;
