const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Data directory for persistence
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DESIGNS_FILE = path.join(DATA_DIR, 'designs.json');
function loadDesigns() {
  try {
    if (fs.existsSync(DESIGNS_FILE)) {
      return JSON.parse(fs.readFileSync(DESIGNS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading designs:', e);
  }
  return {};
}

function saveDesigns(designs) {
  try {
    fs.writeFileSync(DESIGNS_FILE, JSON.stringify(designs, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving designs:', e);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Canva Design Studio', time: new Date().toISOString(), port: PORT });
});

// Designs API
app.get('/api/designs', (req, res) => {
  res.json(loadDesigns());
});

app.post('/api/designs', (req, res) => {
  const { id, design } = req.body;
  if (!id || !design) {
    return res.status(400).json({ error: 'Thiếu id hoặc dữ liệu thiết kế' });
  }
  const designs = loadDesigns();
  designs[id] = {
    ...design,
    updatedAt: new Date().toISOString()
  };
  saveDesigns(designs);
  res.json({ success: true, id });
});

// Check REA installation status
app.get('/api/rea/status', (req, res) => {
  exec('rea --version', (error, stdout, stderr) => {
    if (error) {
      return res.json({
        available: false,
        version: null,
        message: 'REA CLI chưa tìm thấy trong PATH hoặc chưa được cấu hình.',
        error: stderr || error.message
      });
    }
    const version = stdout.trim();
    exec('rea capabilities --format json', (capErr, capOut) => {
      let capabilities = null;
      try {
        capabilities = JSON.parse(capOut);
      } catch (e) {
        capabilities = { raw: capOut ? capOut.slice(0, 1000) : '' };
      }
      res.json({
        available: true,
        version,
        capabilities,
        message: 'REA (Reverse Engineer Anything) v' + version + ' đã sẵn sàng hoạt động!'
      });
    });
  });
});

// Run REA inspection or command
app.post('/api/rea/analyze', (req, res) => {
  const { command, target, targetType } = req.body;
  
  if (!target && !command) {
    return res.status(400).json({ error: 'Cần cung cấp target đường dẫn hoặc lệnh REA' });
  }

  let finalCmd = '';
  if (command) {
    if (!command.startsWith('rea ')) {
      finalCmd = `rea ${command}`;
    } else {
      finalCmd = command;
    }
  } else if (targetType === 'web') {
    finalCmd = `rea analyze-web-bundle --origin "${target}" --json`;
  } else {
    finalCmd = `rea analyze-javascript-application "${target}" --json`;
  }

  console.log('Executing REA:', finalCmd);
  exec(finalCmd, { maxBuffer: 10 * 1024 * 1024, timeout: 60000 }, (err, stdout, stderr) => {
    let parsed = null;
    try {
      parsed = JSON.parse(stdout);
    } catch (e) {
      parsed = { rawOutput: stdout || stderr };
    }

    res.json({
      success: !err,
      command: finalCmd,
      data: parsed,
      stderr: stderr || '',
      error: err ? err.message : null
    });
  });
});

// Magic AI Design Generator endpoint
app.post('/api/ai/generate-design', (req, res) => {
  const { prompt, preset } = req.body;
  const p = (prompt || '').toLowerCase();

  let generatedDesign = {
    title: prompt ? `Thiết kế: ${prompt.slice(0, 30)}` : 'Mẫu Thiết Kế Mới',
    width: 1080,
    height: 1080,
    backgroundColor: '#ffffff',
    elements: []
  };

  if (p.includes('sale') || p.includes('khuyến mãi') || p.includes('giảm giá')) {
    generatedDesign.backgroundColor = '#18181b';
    generatedDesign.elements = [
      { id: 'el_bg', type: 'shape', shapeType: 'rect', x: 0, y: 0, width: 1080, height: 1080, fill: '#0f172a', zIndex: 1 },
      { id: 'el_badge', type: 'shape', shapeType: 'star', x: 120, y: 120, width: 200, height: 200, fill: '#ef4444', zIndex: 2 },
      { id: 'el_badge_txt', type: 'text', text: 'HOT\nDEAL', x: 160, y: 185, fontSize: 36, fontFamily: 'Montserrat', color: '#ffffff', bold: true, align: 'center', zIndex: 3 },
      { id: 'el_title', type: 'text', text: 'SIÊU SALE 50%', x: 100, y: 380, fontSize: 96, fontFamily: 'Montserrat', color: '#facc15', bold: true, align: 'left', zIndex: 4 },
      { id: 'el_sub', type: 'text', text: 'ÁP DỤNG DUY NHẤT HÔM NAY', x: 105, y: 510, fontSize: 38, fontFamily: 'Inter', color: '#ffffff', bold: true, align: 'left', zIndex: 5 },
      { id: 'el_desc', type: 'text', text: 'Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500k.\nSố lượng có hạn, nhanh tay săn ngay!', x: 105, y: 580, fontSize: 24, fontFamily: 'Inter', color: '#94a3b8', bold: false, align: 'left', zIndex: 6 },
      { id: 'el_btn', type: 'shape', shapeType: 'rounded', x: 105, y: 720, width: 340, height: 80, fill: '#00c4cc', cornerRadius: 40, zIndex: 7 },
      { id: 'el_btn_txt', type: 'text', text: 'MUA NGAY BÂY GIỜ ➔', x: 150, y: 768, fontSize: 24, fontFamily: 'Montserrat', color: '#0f172a', bold: true, align: 'left', zIndex: 8 }
    ];
  } else if (p.includes('cà phê') || p.includes('coffee') || p.includes('food') || p.includes('ẩm thực')) {
    generatedDesign.backgroundColor = '#fdf8f6';
    generatedDesign.elements = [
      { id: 'el_bg', type: 'shape', shapeType: 'rect', x: 0, y: 0, width: 1080, height: 1080, fill: '#292524', zIndex: 1 },
      { id: 'el_circle', type: 'shape', shapeType: 'circle', x: 290, y: 150, width: 500, height: 500, fill: '#78350f', zIndex: 2 },
      { id: 'el_title', type: 'text', text: 'COFFEE TIME', x: 140, y: 700, fontSize: 88, fontFamily: 'Playfair Display', color: '#fef3c7', bold: true, align: 'center', zIndex: 3 },
      { id: 'el_sub', type: 'text', text: 'Hương Vị Đậm Đà Khởi Đầu Ngày Mới', x: 220, y: 810, fontSize: 30, fontFamily: 'Inter', color: '#d6d3d1', bold: false, align: 'center', zIndex: 4 },
      { id: 'el_btn', type: 'shape', shapeType: 'rounded', x: 380, y: 880, width: 320, height: 70, fill: '#f59e0b', cornerRadius: 16, zIndex: 5 },
      { id: 'el_btn_txt', type: 'text', text: 'KHÁM PHÁ MENU', x: 420, y: 924, fontSize: 22, fontFamily: 'Montserrat', color: '#451a03', bold: true, align: 'center', zIndex: 6 }
    ];
  } else {
    // Elegant Modern Business / Tech Design
    generatedDesign.backgroundColor = '#0b0f19';
    generatedDesign.elements = [
      { id: 'el_bg', type: 'shape', shapeType: 'rect', x: 0, y: 0, width: 1080, height: 1080, fill: '#0b0f19', zIndex: 1 },
      { id: 'el_accent', type: 'shape', shapeType: 'rounded', x: 80, y: 120, width: 220, height: 44, fill: '#7d2ae8', cornerRadius: 22, zIndex: 2 },
      { id: 'el_accent_txt', type: 'text', text: '✨ CANVA STUDIO AI', x: 110, y: 148, fontSize: 16, fontFamily: 'Montserrat', color: '#ffffff', bold: true, align: 'left', zIndex: 3 },
      { id: 'el_title', type: 'text', text: 'SÁNG TẠO\nKHÔNG GIỚI HẠN', x: 80, y: 280, fontSize: 84, fontFamily: 'Montserrat', color: '#ffffff', bold: true, align: 'left', zIndex: 4 },
      { id: 'el_sub', type: 'text', text: 'Nền tảng thiết kế đồ họa kéo thả trực quan 100% chuyên nghiệp.', x: 85, y: 520, fontSize: 28, fontFamily: 'Inter', color: '#94a3b8', bold: false, align: 'left', zIndex: 5 },
      { id: 'el_btn1', type: 'shape', shapeType: 'rounded', x: 85, y: 640, width: 280, height: 75, fill: '#00c4cc', cornerRadius: 16, zIndex: 6 },
      { id: 'el_btn1_txt', type: 'text', text: 'BẮT ĐẦU NGAY', x: 135, y: 685, fontSize: 20, fontFamily: 'Montserrat', color: '#0b0f19', bold: true, align: 'left', zIndex: 7 }
    ];
  }

  res.json({
    success: true,
    design: generatedDesign
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🎨 Canva Studio Web Server is RUNNING at:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`👉 http://127.0.0.1:${PORT}`);
  console.log(`====================================================`);
});
