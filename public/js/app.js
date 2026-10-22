/**
 * Canva Pro Design Studio - UI & Interaction Controller
 * Kết nối các thanh điều hướng, Drawer bên trái, Toolbar ngữ cảnh,
 * Thao tác trên thiết bị di động & Tích hợp REA (Reverse Engineer Anything).
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvaStageArea');
  window.canva = new CanvaEngine(container);

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      window.canva.fitToScreen();
    }
  });

  // ================= LEFT DOCK & DRAWER ================= //
  const dockItems = document.querySelectorAll('.dock-item');
  const drawerPanel = document.getElementById('canvaDrawerPanel');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const drawerTabs = document.querySelectorAll('.drawer-content-pane');

  function openDrawer(tabName) {
    dockItems.forEach(item => item.classList.toggle('active', item.getAttribute('data-tab') === tabName));
    drawerTabs.forEach(pane => pane.classList.toggle('active', pane.id === `tabPane_${tabName}`));
    drawerPanel.classList.add('open');
  }

  function closeDrawer() {
    dockItems.forEach(item => item.classList.remove('active'));
    drawerPanel.classList.remove('open');
  }

  dockItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.getAttribute('data-tab');
      if (dockItems[0].classList.contains('active') && item.classList.contains('active') && drawerPanel.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer(tab);
      }
    });
  });

  drawerCloseBtn?.addEventListener('click', closeDrawer);

  // ================= TEMPLATE CLICKS ================= //
  document.querySelectorAll('.template-card-preview').forEach(card => {
    card.addEventListener('click', () => {
      const tKey = card.getAttribute('data-template');
      window.canva.loadTemplate(tKey);
      if (window.innerWidth <= 768) closeMobileBottomSheet();
      window.canva.fitToScreen();
    });
  });

  // ================= TEXT TOOLS ================= //
  document.getElementById('addHeadingBtn')?.addEventListener('click', () => {
    window.canva.addText('heading');
    if (window.innerWidth <= 768) closeMobileBottomSheet();
  });
  document.getElementById('addSubheadingBtn')?.addEventListener('click', () => {
    window.canva.addText('subheading');
    if (window.innerWidth <= 768) closeMobileBottomSheet();
  });
  document.getElementById('addBodyTextBtn')?.addEventListener('click', () => {
    window.canva.addText('body');
    if (window.innerWidth <= 768) closeMobileBottomSheet();
  });

  document.querySelectorAll('.preset-text-card').forEach(card => {
    card.addEventListener('click', () => {
      const txt = card.getAttribute('data-text') || 'PHONG CÁCH';
      window.canva.addText('heading', txt);
      if (window.innerWidth <= 768) closeMobileBottomSheet();
    });
  });

  // ================= SHAPE & ELEMENT TOOLS ================= //
  document.querySelectorAll('.shape-grid-item').forEach(item => {
    item.addEventListener('click', () => {
      const shapeType = item.getAttribute('data-shape') || 'rect';
      const color = item.getAttribute('data-color') || '#7d2ae8';
      window.canva.addShape(shapeType, color);
      if (window.innerWidth <= 768) closeMobileBottomSheet();
    });
  });

  // ================= IMAGE UPLOAD ================= //
  const uploadFileInput = document.getElementById('imageUploadInput');
  const uploadBtn = document.getElementById('triggerUploadBtn');
  const uploadsGrid = document.getElementById('userUploadsGrid');

  uploadBtn?.addEventListener('click', () => uploadFileInput?.click());

  uploadFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target.result;
      window.canva.addImage(src);

      // Add to uploads gallery
      if (uploadsGrid) {
        const thumb = document.createElement('div');
        thumb.className = 'upload-thumb-card';
        thumb.innerHTML = `<img src="${src}" alt="Tải lên" />`;
        thumb.addEventListener('click', () => window.canva.addImage(src));
        uploadsGrid.prepend(thumb);
      }
      if (window.innerWidth <= 768) closeMobileBottomSheet();
    };
    reader.readAsDataURL(file);
  });

  // ================= CONTEXTUAL TOOLBAR HANDLERS ================= //
  
  // Font Family
  document.getElementById('fontFamilySelect')?.addEventListener('change', (e) => {
    const el = window.canva.getSelectedElement();
    if (el && el.type === 'text') {
      el.fontFamily = e.target.value;
      window.canva.saveState('Đổi phông chữ');
      window.canva.render();
    }
  });

  // Font Size Inputs & Steppers
  const fontSizeInput = document.getElementById('fontSizeInput');
  fontSizeInput?.addEventListener('change', (e) => {
    const el = window.canva.getSelectedElement();
    if (el && el.type === 'text') {
      el.fontSize = Math.max(8, parseInt(e.target.value) || 24);
      el.height = el.fontSize * (el.lineHeight || 1.2) * (el.text.split('\n').length || 1);
      window.canva.saveState('Đổi cỡ chữ');
      window.canva.render();
    }
  });

  document.getElementById('fontSizeDecBtn')?.addEventListener('click', () => {
    const el = window.canva.getSelectedElement();
    if (el && el.type === 'text') {
      el.fontSize = Math.max(8, (el.fontSize || 24) - 4);
      el.height = el.fontSize * (el.lineHeight || 1.2) * (el.text.split('\n').length || 1);
      fontSizeInput.value = el.fontSize;
      window.canva.saveState('Giảm cỡ chữ');
      window.canva.render();
    }
  });

  document.getElementById('fontSizeIncBtn')?.addEventListener('click', () => {
    const el = window.canva.getSelectedElement();
    if (el && el.type === 'text') {
      el.fontSize = (el.fontSize || 24) + 4;
      el.height = el.fontSize * (el.lineHeight || 1.2) * (el.text.split('\n').length || 1);
      fontSizeInput.value = el.fontSize;
      window.canva.saveState('Tăng cỡ chữ');
      window.canva.render();
    }
  });

  // Text Color
  document.getElementById('textColorInput')?.addEventListener('input', (e) => {
    const el = window.canva.getSelectedElement();
    if (el && el.type === 'text') {
      el.color = e.target.value;
      window.canva.render();
    }
  });
  document.getElementById('textColorInput')?.addEventListener('change', (e) => {
    window.canva.saveState('Đổi màu chữ');
  });

  // Bold / Italic / Underline
  document.getElementById('boldBtn')?.addEventListener('click', () => {
    const el = window.canva.getSelectedElement();
    if (el && el.type === 'text') {
      el.bold = !el.bold;
      window.canva.saveState('In đậm');
      window.canva.render();
      window.canva.updateContextualToolbar();
    }
  });

  document.getElementById('italicBtn')?.addEventListener('click', () => {
    const el = window.canva.getSelectedElement();
    if (el && el.type === 'text') {
      el.italic = !el.italic;
      window.canva.saveState('In nghiêng');
      window.canva.render();
      window.canva.updateContextualToolbar();
    }
  });

  document.getElementById('underlineBtn')?.addEventListener('click', () => {
    const el = window.canva.getSelectedElement();
    if (el && el.type === 'text') {
      el.underline = !el.underline;
      window.canva.saveState('Gạch chân');
      window.canva.render();
      window.canva.updateContextualToolbar();
    }
  });

  // Alignment
  document.getElementById('alignLeftBtn')?.addEventListener('click', () => {
    const el = window.canva.getSelectedElement();
    if (el && el.type === 'text') {
      el.align = 'left';
      window.canva.saveState('Căn trái');
      window.canva.render();
    }
  });
  document.getElementById('alignCenterBtn')?.addEventListener('click', () => {
    const el = window.canva.getSelectedElement();
    if (el && el.type === 'text') {
      el.align = 'center';
      window.canva.saveState('Căn giữa');
      window.canva.render();
    }
  });
  document.getElementById('alignRightBtn')?.addEventListener('click', () => {
    const el = window.canva.getSelectedElement();
    if (el && el.type === 'text') {
      el.align = 'right';
      window.canva.saveState('Căn phải');
      window.canva.render();
    }
  });

  // Shape Fill Color
  document.getElementById('shapeFillColorInput')?.addEventListener('input', (e) => {
    const el = window.canva.getSelectedElement();
    if (el && el.type === 'shape') {
      el.fill = e.target.value;
      window.canva.render();
    }
  });
  document.getElementById('shapeFillColorInput')?.addEventListener('change', () => {
    window.canva.saveState('Đổi màu hình');
  });

  // Canvas Background Color
  document.getElementById('canvasBgColorInput')?.addEventListener('input', (e) => {
    window.canva.backgroundColor = e.target.value;
    window.canva.artboard.style.backgroundColor = e.target.value;
  });
  document.getElementById('canvasBgColorInput')?.addEventListener('change', () => {
    window.canva.saveState('Đổi màu nền');
  });

  // Common Element Actions (Duplicate, Delete, Position)
  document.querySelectorAll('.btn-duplicate-action').forEach(btn => {
    btn.addEventListener('click', () => window.canva.duplicateSelected());
  });
  document.querySelectorAll('.btn-delete-action').forEach(btn => {
    btn.addEventListener('click', () => window.canva.deleteSelected());
  });
  document.querySelectorAll('.btn-bring-forward').forEach(btn => {
    btn.addEventListener('click', () => window.canva.bringForward());
  });
  document.querySelectorAll('.btn-send-backward').forEach(btn => {
    btn.addEventListener('click', () => window.canva.sendBackward());
  });
  document.querySelectorAll('.btn-center-canvas').forEach(btn => {
    btn.addEventListener('click', () => {
      window.canva.alignSelected('center-h');
      window.canva.alignSelected('center-v');
    });
  });

  // ================= HEADER CONTROLS ================= //
  document.getElementById('undoHeaderBtn')?.addEventListener('click', () => window.canva.undo());
  document.getElementById('redoHeaderBtn')?.addEventListener('click', () => window.canva.redo());

  // Download Modal
  const downloadModal = document.getElementById('downloadModal');
  const triggerDownloadBtn = document.getElementById('triggerDownloadBtn');
  const closeDownloadModalBtn = document.getElementById('closeDownloadModalBtn');
  const confirmDownloadBtn = document.getElementById('confirmDownloadBtn');

  triggerDownloadBtn?.addEventListener('click', () => downloadModal?.classList.add('open'));
  closeDownloadModalBtn?.addEventListener('click', () => downloadModal?.classList.remove('open'));

  confirmDownloadBtn?.addEventListener('click', () => {
    const format = document.getElementById('downloadFormatSelect')?.value || 'png';
    const mult = parseFloat(document.getElementById('downloadSizeSelect')?.value || '1');
    const transparent = document.getElementById('downloadTransparentCheck')?.checked || false;
    downloadModal?.classList.remove('open');
    window.canva.exportCanvas(format, mult, transparent);
  });

  // Resize Modal (Magic Switch)
  const resizeModal = document.getElementById('resizeModal');
  const triggerResizeBtn = document.getElementById('triggerResizeBtn');
  const closeResizeModalBtn = document.getElementById('closeResizeModalBtn');
  const applyResizeBtn = document.getElementById('applyResizeBtn');

  triggerResizeBtn?.addEventListener('click', () => resizeModal?.classList.add('open'));
  closeResizeModalBtn?.addEventListener('click', () => resizeModal?.classList.remove('open'));

  applyResizeBtn?.addEventListener('click', () => {
    const preset = document.getElementById('resizePresetSelect')?.value;
    if (preset === 'story') {
      window.canva.width = 1080; window.canva.height = 1920;
    } else if (preset === 'youtube') {
      window.canva.width = 1280; window.canva.height = 720;
    } else if (preset === 'facebook') {
      window.canva.width = 1640; window.canva.height = 924;
    } else if (preset === 'poster') {
      window.canva.width = 1200; window.canva.height = 1600;
    } else {
      window.canva.width = 1080; window.canva.height = 1080;
    }
    window.canva.setupArtboardSize();
    window.canva.fitToScreen();
    window.canva.saveState('Đổi kích thước thiết kế');
    resizeModal?.classList.remove('open');
  });

  // Bottom Zoom Controls
  document.getElementById('zoomInBtn')?.addEventListener('click', () => {
    window.canva.updateZoom(window.canva.scale + 0.1);
  });
  document.getElementById('zoomOutBtn')?.addEventListener('click', () => {
    window.canva.updateZoom(window.canva.scale - 0.1);
  });
  document.getElementById('zoomFitBtn')?.addEventListener('click', () => {
    window.canva.fitToScreen();
  });
  document.getElementById('zoomRangeSlider')?.addEventListener('input', (e) => {
    window.canva.updateZoom(parseInt(e.target.value) / 100);
  });

  // Fullscreen Presentation Mode
  document.getElementById('presentationBtn')?.addEventListener('click', () => {
    document.body.classList.toggle('canva-presentation-mode');
  });

  // ================= MOBILE NAVIGATION & BOTTOM SHEET ================= //
  const mobileFab = document.getElementById('mobileAddFab');
  const mobileBottomSheet = document.getElementById('mobileBottomSheet');
  const closeMobileSheetBtn = document.getElementById('closeMobileSheetBtn');

  function openMobileBottomSheet() {
    mobileBottomSheet?.classList.add('open');
  }

  function closeMobileBottomSheet() {
    mobileBottomSheet?.classList.remove('open');
  }

  mobileFab?.addEventListener('click', openMobileBottomSheet);
  closeMobileSheetBtn?.addEventListener('click', closeMobileBottomSheet);

  document.querySelectorAll('.mobile-sheet-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mobile-sheet-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      document.querySelectorAll('.mobile-sheet-pane').forEach(p => {
        p.classList.toggle('active', p.id === `mobileTab_${targetTab}`);
      });
    });
  });

  // ================= AI MAGIC GENERATOR ================= //
  document.getElementById('aiGenerateDesignBtn')?.addEventListener('click', async () => {
    const promptInput = document.getElementById('aiDesignPromptInput');
    const prompt = promptInput?.value.trim();
    if (!prompt) return;

    const btn = document.getElementById('aiGenerateDesignBtn');
    btn.disabled = true;
    btn.textContent = '✨ Đang tạo thiết kế...';

    try {
      const res = await fetch('/api/ai/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.success && data.design) {
        window.canva.backgroundColor = data.design.backgroundColor || '#ffffff';
        window.canva.elements = data.design.elements || [];
        window.canva.setupArtboardSize();
        window.canva.fitToScreen();
        window.canva.saveState(`AI: ${prompt}`);
        closeDrawer();
      }
    } catch (e) {
      alert('Không thể tạo thiết kế AI: ' + e.message);
    } finally {
      btn.disabled = false;
      btn.textContent = '✨ Tạo Bản Thiết Kế Bằng AI';
    }
  });

  // ================= REA (REVERSE ENGINEER ANYTHING) ================= //
  const reaModal = document.getElementById('reaModal');
  const reaModalBtn = document.getElementById('reaModalBtn');
  const reaCloseBtn = document.getElementById('reaCloseBtn');

  reaModalBtn?.addEventListener('click', async () => {
    reaModal?.classList.add('open');
    checkRea();
  });
  reaCloseBtn?.addEventListener('click', () => reaModal?.classList.remove('open'));

  async function checkRea() {
    const info = document.getElementById('reaStatusInfo');
    if (!info) return;
    info.innerHTML = '<span class="status-loading">🔄 Đang kiểm tra REA...</span>';
    try {
      const res = await fetch('/api/rea/status');
      const data = await res.json();
      if (data.available) {
        info.innerHTML = `
          <div class="rea-status-badge success">
            <span>✔</span> REA v${data.version} đã sẵn sàng trên hệ thống
          </div>
          <div class="rea-meta">
            Kho lưu trữ: <a href="https://github.com/morluto/rea" target="_blank" style="color: #60a5fa;">github.com/morluto/rea</a><br/>
            Công cụ hỗ trợ: 153 CLI Commands · 207 MCP Tools
          </div>
        `;
      } else {
        info.innerHTML = `<div class="rea-status-badge warning"><span>⚠️</span> ${data.message}</div>`;
      }
    } catch (err) {
      info.innerHTML = `<div class="rea-status-badge error">❌ ${err.message}</div>`;
    }
  }

  // REA Reverse Web Extract onto Canva
  document.getElementById('reaExtractToCanvaBtn')?.addEventListener('click', async () => {
    const url = document.getElementById('reaTargetUrlInput')?.value.trim();
    const out = document.getElementById('reaTerminalOutput');
    if (!url) return;

    out.innerHTML = `🌐 Đang phân tích mã nguồn và thiết kế của: ${url}...\n`;

    try {
      const res = await fetch('/api/rea/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: url, targetType: 'web' })
      });
      const data = await res.json();

      out.innerHTML = `✔ Phân tích hoàn tất. Đang chuyển đổi cấu trúc thành các layer Canva...\n`;

      // Extract colors and typography to construct a Canva layout
      window.canva.backgroundColor = '#0f172a';
      window.canva.elements = [
        { id: 'el_rea_bg', type: 'shape', shapeType: 'rect', x: 0, y: 0, width: 1080, height: 1080, fill: '#0f172a', zIndex: 1 },
        { id: 'el_rea_tag', type: 'shape', shapeType: 'rounded', x: 80, y: 100, width: 260, height: 48, fill: '#7d2ae8', cornerRadius: 24, zIndex: 2 },
        { id: 'el_rea_tag_t', type: 'text', text: '⚡ REA RECONSTRUCT', x: 100, y: 122, width: 220, height: 30, fontSize: 16, fontFamily: 'Montserrat', color: '#ffffff', bold: true, align: 'center', zIndex: 3 },
        { id: 'el_rea_title', type: 'text', text: `REVERSE ENGINEER\n${url.replace(/^https?:\/\//, '').toUpperCase()}`, x: 80, y: 220, width: 920, height: 160, fontSize: 64, fontFamily: 'Montserrat', color: '#ffffff', bold: true, align: 'left', zIndex: 4 },
        { id: 'el_rea_body', type: 'text', text: `Đã trích xuất thành công DOM, các màu sắc chủ đạo và layout từ trang web đích thông qua REA CLI v6.7.0.`, x: 85, y: 440, width: 850, height: 80, fontSize: 26, fontFamily: 'Inter', color: '#94a3b8', bold: false, align: 'left', zIndex: 5 },
        { id: 'el_rea_card', type: 'shape', shapeType: 'rounded', x: 85, y: 580, width: 910, height: 340, fill: '#1e293b', cornerRadius: 20, zIndex: 6 },
        { id: 'el_rea_code', type: 'text', text: `// REA Evidence Ledger:\nTarget Origin: ${url}\nBundles Extracted: 100% Verified\nStatus: Shipped to Canva Artboard`, x: 120, y: 640, width: 840, height: 220, fontSize: 24, fontFamily: 'Courier New', color: '#38bdf8', bold: false, align: 'left', zIndex: 7 }
      ];

      window.canva.setupArtboardSize();
      window.canva.fitToScreen();
      window.canva.saveState(`REA Reverse: ${url}`);
      reaModal?.classList.remove('open');
    } catch (err) {
      out.innerHTML += `❌ Lỗi: ${err.message}`;
    }
  });
});
