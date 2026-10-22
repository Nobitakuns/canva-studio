/**
 * Canvas Studio - Core Canvas Manager
 * Quản lý trạng thái, lịch sử phiên bản, công cụ AI đặc trưng của ChatGPT Canvas,
 * Trình soạn thảo văn bản, trình biên tập code và tích hợp bộ so sánh Diff.
 */

class CanvasManager {
  constructor(options = {}) {
    this.mode = 'document'; // 'document' | 'code' | 'whiteboard'
    this.title = 'Tài liệu không tên';
    this.language = 'javascript';
    
    // Versions History
    this.versions = [];
    this.currentIndex = -1;
    this.isDiffMode = false;
    
    // Inline suggestions & annotations
    this.annotations = [];
    
    // DOM Elements
    this.dom = {
      container: document.getElementById('canvasPanel'),
      headerTitle: document.getElementById('canvasTitleInput'),
      modeDocumentBtn: document.getElementById('modeDocBtn'),
      modeCodeBtn: document.getElementById('modeCodeBtn'),
      modeWhiteboardBtn: document.getElementById('modeWhiteboardBtn'),
      
      // Version Controls
      prevVersionBtn: document.getElementById('prevVersionBtn'),
      nextVersionBtn: document.getElementById('nextVersionBtn'),
      versionLabel: document.getElementById('versionLabel'),
      versionMenuBtn: document.getElementById('versionMenuBtn'),
      versionDropdown: document.getElementById('versionDropdown'),
      restoreVersionBtn: document.getElementById('restoreVersionBtn'),
      toggleDiffBtn: document.getElementById('toggleDiffBtn'),
      
      // Top Action Buttons
      copyBtn: document.getElementById('canvasCopyBtn'),
      downloadBtn: document.getElementById('canvasDownloadBtn'),
      fullscreenBtn: document.getElementById('canvasFullscreenBtn'),
      closeBtn: document.getElementById('canvasCloseBtn'),
      
      // Bodies
      docBody: document.getElementById('canvasDocBody'),
      codeBody: document.getElementById('canvasCodeBody'),
      whiteboardBody: document.getElementById('canvasWhiteboardBody'),
      diffBody: document.getElementById('canvasDiffBody'),
      
      // Document Elements
      docEditor: document.getElementById('docEditorContent'),
      floatingMenu: document.getElementById('floatingSelectionMenu'),
      selectionPromptInput: document.getElementById('selectionPromptInput'),
      selectionPromptSubmit: document.getElementById('selectionPromptSubmit'),
      annotationsContainer: document.getElementById('docAnnotationsContainer'),
      
      // Code Elements
      codeTextarea: document.getElementById('codeTextarea'),
      codeLineNumbers: document.getElementById('codeLineNumbers'),
      codeHighlightPre: document.getElementById('codeHighlightPre'),
      codeLangSelect: document.getElementById('codeLangSelect'),
      runCodeBtn: document.getElementById('runCodeBtn'),
      codeConsole: document.getElementById('codeConsole'),
      consoleOutput: document.getElementById('consoleOutput'),
      
      // Stats
      wordCountEl: document.getElementById('canvasWordCount'),
      charCountEl: document.getElementById('canvasCharCount'),
      readTimeEl: document.getElementById('canvasReadTime'),
      
      // Floating AI Hub
      floatingAiBtn: document.getElementById('floatingAiBtn'),
      aiActionMenu: document.getElementById('aiActionMenu'),
      sliderContainer: document.getElementById('lengthSliderModal'),
      readingLevelModal: document.getElementById('readingLevelModal')
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.bindEditorEvents();
    this.bindFloatingAiEvents();
    
    // Set initial default document
    const initialText = `# Bắt đầu làm việc với Canvas Studio\n\nChào mừng bạn đến với **Canvas Studio** — không gian làm việc trực quan hai màn hình song song kết hợp giữa khả năng sáng tạo của bạn và trí tuệ nhân tạo AI.\n\n### Những điều bạn có thể làm ngay bây giờ:\n1. **Trò chuyện ở khung bên trái**: Đặt câu hỏi, yêu cầu viết dàn ý, phân tích nghiệp vụ hoặc lập trình mã nguồn.\n2. **Soạn thảo và sửa trực tiếp ở khung này**: Mọi câu chữ của bạn đều được lưu trữ phiên bản tự động.\n3. **Bôi đen bất kỳ đoạn văn nào**: Thanh công cụ AI nổi sẽ xuất hiện tức thì để bạn yêu cầu trau chuốt hoặc viết lại.\n4. **Bấm vào nút tròn AI ở góc dưới bên phải**: Để trải nghiệm 5 tính năng kinh điển của Canvas: *Đề xuất sửa đổi, Điều chỉnh độ dài 5 mức, Thay đổi cấp độ đọc, Trau chuốt câu từ và Thêm biểu tượng cảm xúc!*\n\nChúc bạn có những trải nghiệm sáng tạo tuyệt vời! 🚀`;
    
    // Check URL params for initial mode (?mode=code or ?mode=whiteboard)
    const urlParams = new URLSearchParams(window.location.search);
    const initialMode = urlParams.get('mode');
    if (initialMode === 'code') {
      const codeSample = `import express from 'express';\nimport cors from 'cors';\n\nconst app = express();\napp.use(cors());\napp.use(express.json());\n\n// Route xử lý AI Canvas\napp.post('/api/canvas', async (req, res) => {\n  const { action, content } = req.body;\n  console.log('[CANVAS ACTION]', action);\n  return res.json({ status: 'success', timestamp: Date.now() });\n});\n\napp.listen(3030, () => console.log('Server is running on port 3030'));`;
      this.setCode('API Controller (Node.js)', codeSample, 'javascript', 'Khởi tạo mã nguồn ban đầu');
    } else if (initialMode === 'whiteboard') {
      this.setMode('whiteboard');
    } else {
      this.setDocument('Tài liệu hướng dẫn Canvas', initialText, 'Khởi tạo tài liệu mặc định');
    }
  }

  setMode(mode) {
    this.mode = mode;
    
    // Update Mode Buttons
    [this.dom.modeDocumentBtn, this.dom.modeCodeBtn, this.dom.modeWhiteboardBtn].forEach(b => b?.classList.remove('active'));
    if (mode === 'document') this.dom.modeDocumentBtn?.classList.add('active');
    if (mode === 'code') this.dom.modeCodeBtn?.classList.add('active');
    if (mode === 'whiteboard') this.dom.modeWhiteboardBtn?.classList.add('active');

    // Update Bodies
    this.dom.docBody.style.display = mode === 'document' && !this.isDiffMode ? 'flex' : 'none';
    this.dom.codeBody.style.display = mode === 'code' && !this.isDiffMode ? 'flex' : 'none';
    this.dom.whiteboardBody.style.display = mode === 'whiteboard' && !this.isDiffMode ? 'flex' : 'none';
    this.dom.diffBody.style.display = this.isDiffMode ? 'block' : 'none';

    // Show/hide floating AI hub
    if (mode === 'whiteboard') {
      this.dom.floatingAiBtn.style.display = 'none';
    } else {
      this.dom.floatingAiBtn.style.display = 'flex';
    }

    this.updateStats();
    this.renderAiMenuOptions();

    // Trigger whiteboard resize if switched
    if (mode === 'whiteboard' && window.whiteboardInstance) {
      setTimeout(() => window.whiteboardInstance.resize(), 50);
    }
  }

  setDocument(title, content, summary = 'Tạo mới tài liệu') {
    this.title = title || 'Tài liệu không tên';
    this.dom.headerTitle.value = this.title;
    this.mode = 'document';
    this.setMode('document');
    this.commitVersion(content, summary);
    this.renderCurrentContent();
  }

  setCode(title, content, language = 'javascript', summary = 'Tạo mới mã nguồn') {
    this.title = title || 'Script';
    this.dom.headerTitle.value = this.title;
    this.language = language;
    if (this.dom.codeLangSelect) this.dom.codeLangSelect.value = language;
    this.mode = 'code';
    this.setMode('code');
    this.commitVersion(content, summary);
    this.renderCurrentContent();
  }

  setWhiteboard(title, content, summary = 'Khởi tạo sơ đồ bảng vẽ') {
    this.title = title || 'Bảng vẽ trực quan';
    this.dom.headerTitle.value = this.title;
    this.mode = 'whiteboard';
    this.setMode('whiteboard');
    if (window.whiteboardInstance && content) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        if (parsed.elements) window.whiteboardInstance.loadElements(parsed.elements);
      } catch (e) {}
    }
    this.commitVersion(typeof content === 'string' ? content : JSON.stringify(content), summary);
  }

  commitVersion(content, summary = 'Chỉnh sửa') {
    const current = this.getCurrentContent();
    if (content === current && this.versions.length > 0) return;

    const newVer = {
      versionNumber: this.versions.length + 1,
      id: 'v' + (this.versions.length + 1),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      content: content || '',
      summary: summary,
      mode: this.mode,
      language: this.language
    };

    // If we were viewing an older version and made edits, branch out
    if (this.currentIndex < this.versions.length - 1) {
      this.versions = this.versions.slice(0, this.currentIndex + 1);
    }

    this.versions.push(newVer);
    this.currentIndex = this.versions.length - 1;
    this.updateVersionUI();
    this.updateStats();

    // Trigger auto save event
    if (window.onCanvasUpdated) {
      window.onCanvasUpdated({
        title: this.title,
        mode: this.mode,
        content: content,
        version: newVer.versionNumber
      });
    }
  }

  getCurrentContent() {
    if (this.currentIndex >= 0 && this.versions[this.currentIndex]) {
      return this.versions[this.currentIndex].content;
    }
    return '';
  }

  renderCurrentContent() {
    const content = this.getCurrentContent();
    if (this.mode === 'document') {
      // If content has markdown tags, convert to clean HTML for rich editing
      this.dom.docEditor.innerHTML = this.markdownToHtml(content);
      this.renderDocAnnotations();
    } else if (this.mode === 'code') {
      this.dom.codeTextarea.value = content;
      this.updateCodeHighlighting();
    }
    this.updateStats();
    if (this.isDiffMode) {
      this.renderDiff();
    }
  }

  markdownToHtml(md) {
    if (!md) return '';
    // If it's already HTML (contains <p> or <h1>), return as is
    if (/<[a-z][\s\S]*>/i.test(md)) return md;

    const lines = md.split('\n');
    let html = '';
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        if (inList) { html += '</ul>'; inList = false; }
        continue;
      }

      if (line.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h3>${this.inlineFormat(line.substring(4))}</h3>`;
      } else if (line.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h2>${this.inlineFormat(line.substring(3))}</h2>`;
      } else if (line.startsWith('# ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h1>${this.inlineFormat(line.substring(2))}</h1>`;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += `<li>${this.inlineFormat(line.substring(2))}</li>`;
      } else if (/^\d+\.\s/.test(line)) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<p><strong>${line.match(/^\d+\./)[0]}</strong> ${this.inlineFormat(line.replace(/^\d+\.\s*/, ''))}</p>`;
      } else if (line.startsWith('> ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<blockquote>${this.inlineFormat(line.substring(2))}</blockquote>`;
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<p>${this.inlineFormat(line)}</p>`;
      }
    }
    if (inList) html += '</ul>';
    return html;
  }

  inlineFormat(str) {
    return DiffEngine.escapeHtml(str)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  goToVersion(index) {
    if (index >= 0 && index < this.versions.length) {
      this.currentIndex = index;
      const ver = this.versions[this.currentIndex];
      if (ver.mode) this.setMode(ver.mode);
      if (ver.language && this.dom.codeLangSelect) {
        this.language = ver.language;
        this.dom.codeLangSelect.value = ver.language;
      }
      this.renderCurrentContent();
      this.updateVersionUI();
    }
  }

  updateVersionUI() {
    const total = this.versions.length;
    const cur = this.currentIndex + 1;
    this.dom.versionLabel.textContent = `Phiên bản ${cur}/${total}`;
    
    this.dom.prevVersionBtn.disabled = this.currentIndex <= 0;
    this.dom.nextVersionBtn.disabled = this.currentIndex >= total - 1;
    
    // Show restore button only when viewing an older version
    if (this.currentIndex < total - 1) {
      this.dom.restoreVersionBtn.style.display = 'inline-flex';
    } else {
      this.dom.restoreVersionBtn.style.display = 'none';
    }

    // Populate Version Dropdown
    if (this.dom.versionDropdown) {
      let html = '<div class="version-list-header">Lịch sử thay đổi</div>';
      for (let i = this.versions.length - 1; i >= 0; i--) {
        const v = this.versions[i];
        const isSelected = i === this.currentIndex ? 'selected' : '';
        html += `
          <div class="version-item ${isSelected}" data-idx="${i}">
            <div class="version-item-title">
              <span class="version-badge">v${v.versionNumber}</span>
              <span class="version-time">${v.timestamp}</span>
            </div>
            <div class="version-summary">${DiffEngine.escapeHtml(v.summary || 'Chỉnh sửa')}</div>
          </div>
        `;
      }
      this.dom.versionDropdown.innerHTML = html;
      this.dom.versionDropdown.querySelectorAll('.version-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.getAttribute('data-idx'));
          this.goToVersion(idx);
          this.dom.versionDropdown.classList.remove('open');
        });
      });
    }
  }

  toggleDiff() {
    this.isDiffMode = !this.isDiffMode;
    this.dom.toggleDiffBtn.classList.toggle('active', this.isDiffMode);
    
    if (this.isDiffMode) {
      this.dom.toggleDiffBtn.innerHTML = `<span>✕ Tắt So Sánh</span>`;
      this.renderDiff();
    } else {
      this.dom.toggleDiffBtn.innerHTML = `<span>🔀 So sánh Diff</span>`;
      this.setMode(this.mode);
    }
  }

  renderDiff() {
    this.dom.docBody.style.display = 'none';
    this.dom.codeBody.style.display = 'none';
    this.dom.whiteboardBody.style.display = 'none';
    this.dom.diffBody.style.display = 'block';

    const currentText = this.getCurrentContent();
    let prevText = '';
    if (this.currentIndex > 0) {
      prevText = this.versions[this.currentIndex - 1].content;
    } else {
      prevText = '';
    }

    const diffResult = DiffEngine.computeLineDiff(prevText, currentText);
    const { html, addCount, remCount } = DiffEngine.renderDiffHtml(diffResult);
    
    const banner = `
      <div class="diff-summary-banner">
        <div class="diff-summary-title">
          So sánh giữa <strong>v${this.currentIndex}</strong> và <strong>v${this.currentIndex + 1}</strong>:
          <span class="diff-badge-add">+${addCount} dòng thêm</span>
          <span class="diff-badge-rem">−${remCount} dòng bớt</span>
        </div>
        <button class="btn-diff-action" id="diffKeepBtn">Giữ phiên bản này</button>
        ${this.currentIndex > 0 ? `<button class="btn-diff-action secondary" id="diffRollbackBtn">Lùi về v${this.currentIndex}</button>` : ''}
      </div>
    `;

    this.dom.diffBody.innerHTML = banner + html;

    document.getElementById('diffKeepBtn')?.addEventListener('click', () => this.toggleDiff());
    document.getElementById('diffRollbackBtn')?.addEventListener('click', () => {
      this.goToVersion(this.currentIndex - 1);
      this.toggleDiff();
    });
  }

  bindEvents() {
    // Mode Switchers
    this.dom.modeDocumentBtn?.addEventListener('click', () => this.setMode('document'));
    this.dom.modeCodeBtn?.addEventListener('click', () => this.setMode('code'));
    this.dom.modeWhiteboardBtn?.addEventListener('click', () => this.setMode('whiteboard'));

    // Title editing
    this.dom.headerTitle?.addEventListener('change', () => {
      this.title = this.dom.headerTitle.value || 'Tài liệu không tên';
    });

    // Version buttons
    this.dom.prevVersionBtn?.addEventListener('click', () => this.goToVersion(this.currentIndex - 1));
    this.dom.nextVersionBtn?.addEventListener('click', () => this.goToVersion(this.currentIndex + 1));
    this.dom.restoreVersionBtn?.addEventListener('click', () => {
      const selected = this.versions[this.currentIndex];
      if (selected) {
        this.commitVersion(selected.content, `Khôi phục về v${selected.versionNumber}`);
      }
    });

    this.dom.versionMenuBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dom.versionDropdown?.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!this.dom.versionDropdown?.contains(e.target) && e.target !== this.dom.versionMenuBtn) {
        this.dom.versionDropdown?.classList.remove('open');
      }
    });

    this.dom.toggleDiffBtn?.addEventListener('click', () => this.toggleDiff());

    // Copy button with visual toast feedback
    this.dom.copyBtn?.addEventListener('click', () => {
      const content = this.getCurrentContent();
      navigator.clipboard.writeText(content).then(() => {
        const originalHtml = this.dom.copyBtn.innerHTML;
        this.dom.copyBtn.innerHTML = `<span>✔ Đã sao chép</span>`;
        this.dom.copyBtn.classList.add('btn-success');
        setTimeout(() => {
          this.dom.copyBtn.innerHTML = originalHtml;
          this.dom.copyBtn.classList.remove('btn-success');
        }, 2000);
      });
    });

    // Download / Export button
    this.dom.downloadBtn?.addEventListener('click', () => this.exportCurrentDocument());

    // Fullscreen toggle
    this.dom.fullscreenBtn?.addEventListener('click', () => {
      document.body.classList.toggle('canvas-fullscreen-mode');
      const isFull = document.body.classList.contains('canvas-fullscreen-mode');
      this.dom.fullscreenBtn.innerHTML = isFull ? `<span>🗗 Thu nhỏ</span>` : `<span>⛶ Toàn màn hình</span>`;
    });

    // Close button
    this.dom.closeBtn?.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        // On mobile, switch tab to chat
        window.switchMobileTab && window.switchMobileTab('chat');
      } else {
        document.body.classList.toggle('canvas-hidden');
      }
    });

    // Language dropdown in code mode
    this.dom.codeLangSelect?.addEventListener('change', () => {
      this.language = this.dom.codeLangSelect.value;
      this.updateCodeHighlighting();
    });

    // Run Code button
    this.dom.runCodeBtn?.addEventListener('click', () => this.executeCode());
  }

  bindEditorEvents() {
    // Document editing input
    this.dom.docEditor?.addEventListener('input', () => {
      // Debounce commit on manual typing
      clearTimeout(this._docDebounce);
      this._docDebounce = setTimeout(() => {
        this.commitVersion(this.dom.docEditor.innerText, 'Chỉnh sửa văn bản thủ công');
      }, 1200);
      this.updateStats();
    });

    // Code textarea input & line numbers
    this.dom.codeTextarea?.addEventListener('input', () => {
      clearTimeout(this._codeDebounce);
      this._codeDebounce = setTimeout(() => {
        this.commitVersion(this.dom.codeTextarea.value, 'Chỉnh sửa code thủ công');
      }, 1200);
      this.updateCodeHighlighting();
      this.updateStats();
    });

    this.dom.codeTextarea?.addEventListener('scroll', () => {
      this.dom.codeLineNumbers.scrollTop = this.dom.codeTextarea.scrollTop;
      this.dom.codeHighlightPre.scrollTop = this.dom.codeTextarea.scrollTop;
      this.dom.codeHighlightPre.scrollLeft = this.dom.codeTextarea.scrollLeft;
    });

    // Tab key support in Code Editor
    this.dom.codeTextarea?.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.dom.codeTextarea.selectionStart;
        const end = this.dom.codeTextarea.selectionEnd;
        const val = this.dom.codeTextarea.value;
        this.dom.codeTextarea.value = val.substring(0, start) + '  ' + val.substring(end);
        this.dom.codeTextarea.selectionStart = this.dom.codeTextarea.selectionEnd = start + 2;
        this.updateCodeHighlighting();
      }
    });

    // Floating selection toolbar for Document
    document.addEventListener('selectionchange', () => {
      if (this.mode !== 'document') return;
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !this.dom.docEditor.contains(selection.anchorNode)) {
        this.dom.floatingMenu.style.display = 'none';
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 2) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        this.dom.floatingMenu.style.display = 'flex';
        this.dom.floatingMenu.style.top = `${rect.top - 46 + window.scrollY}px`;
        this.dom.floatingMenu.style.left = `${Math.max(10, rect.left + rect.width / 2 - 120)}px`;
        this._currentSelectionText = text;
      }
    });

    // Floating AI Prompt input
    this.dom.selectionPromptSubmit?.addEventListener('click', () => {
      const prompt = this.dom.selectionPromptInput.value.trim();
      if (!prompt || !this._currentSelectionText) return;
      this.callAiAction('inline-ai', { prompt: prompt, selection: this._currentSelectionText });
      this.dom.floatingMenu.style.display = 'none';
      this.dom.selectionPromptInput.value = '';
    });
  }

  updateCodeHighlighting() {
    const code = this.dom.codeTextarea.value || '';
    const lines = code.split('\n');
    
    // Line Numbers
    let lineNumsHtml = '';
    for (let i = 1; i <= Math.max(1, lines.length); i++) {
      lineNumsHtml += `<span>${i}</span>`;
    }
    this.dom.codeLineNumbers.innerHTML = lineNumsHtml;

    // Fast Syntax Highlighting
    const highlighted = this.highlightCode(code, this.language);
    this.dom.codeHighlightPre.innerHTML = highlighted;
  }

  highlightCode(code, lang) {
    if (!code) return '';
    // Tokenize using a single master regex to prevent tag-collision
    const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:const|let|var|function|return|if|else|for|while|import|export|class|from|def|async|await|try|catch|new|this|typeof|public|private|static)\b)|(\b\d+(?:\.\d+)?\b)|(\b(?:true|false|null|undefined|None|True|False)\b)/g;

    let result = '';
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(code)) !== null) {
      result += DiffEngine.escapeHtml(code.substring(lastIndex, match.index));
      
      const [full, comment, strVal, keyword, number, boolVal] = match;
      const escaped = DiffEngine.escapeHtml(full);

      if (comment) {
        result += `<span class="tok-comment">${escaped}</span>`;
      } else if (strVal) {
        result += `<span class="tok-string">${escaped}</span>`;
      } else if (keyword) {
        result += `<span class="tok-keyword">${escaped}</span>`;
      } else if (number) {
        result += `<span class="tok-number">${escaped}</span>`;
      } else if (boolVal) {
        result += `<span class="tok-boolean">${escaped}</span>`;
      }
      lastIndex = tokenRegex.lastIndex;
    }
    result += DiffEngine.escapeHtml(code.substring(lastIndex));
    return result;
  }

  executeCode() {
    if (this.language !== 'javascript') {
      alert(`Trình thông dịch trực tiếp hiện hỗ trợ JavaScript. Ngôn ngữ ${this.language.toUpperCase()} sẽ được gửi tới AI kiểm thử.`);
      return;
    }

    this.dom.codeConsole.style.display = 'block';
    this.dom.consoleOutput.innerHTML = '<span class="console-info">▶ Đang thực thi mã JavaScript...</span><br/>';

    const code = this.dom.codeTextarea.value;
    const logs = [];
    const customConsole = {
      log: (...args) => logs.push({ type: 'log', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ') }),
      info: (...args) => logs.push({ type: 'info', text: args.join(' ') }),
      warn: (...args) => logs.push({ type: 'warn', text: args.join(' ') }),
      error: (...args) => logs.push({ type: 'error', text: args.join(' ') })
    };

    try {
      const runFn = new Function('console', code);
      const res = runFn(customConsole);
      
      let outHtml = '';
      logs.forEach(l => {
        outHtml += `<div class="console-line line-${l.type}">[${l.type.toUpperCase()}] ${DiffEngine.escapeHtml(l.text)}</div>`;
      });
      if (res !== undefined) {
        outHtml += `<div class="console-line line-result">➔ Kết quả trả về: ${DiffEngine.escapeHtml(JSON.stringify(res))}</div>`;
      }
      if (logs.length === 0 && res === undefined) {
        outHtml += `<div class="console-line line-success">✔ Mã đã thực thi thành công không có cảnh báo lỗi.</div>`;
      }
      this.dom.consoleOutput.innerHTML = outHtml;
    } catch (err) {
      this.dom.consoleOutput.innerHTML += `<div class="console-line line-error">❌ Lỗi Runtime: ${DiffEngine.escapeHtml(err.message)}</div>`;
    }
  }

  bindFloatingAiEvents() {
    // Open/Close AI Action Menu
    this.dom.floatingAiBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dom.aiActionMenu.classList.toggle('open');
      this.renderAiMenuOptions();
    });

    document.addEventListener('click', (e) => {
      if (!this.dom.aiActionMenu?.contains(e.target) && e.target !== this.dom.floatingAiBtn) {
        this.dom.aiActionMenu?.classList.remove('open');
      }
    });
  }

  renderAiMenuOptions() {
    if (!this.dom.aiActionMenu) return;

    if (this.mode === 'document') {
      this.dom.aiActionMenu.innerHTML = `
        <div class="ai-menu-title">Công cụ AI Soạn thảo (Canvas)</div>
        <button class="ai-action-item" data-action="suggest-edits">
          <span class="ai-action-icon">✍️</span>
          <div class="ai-action-text">
            <strong>Suggest edits</strong>
            <span>Đề xuất chỉnh sửa trực tiếp trên từng đoạn</span>
          </div>
        </button>
        <button class="ai-action-item" data-action="open-length-slider">
          <span class="ai-action-icon">📏</span>
          <div class="ai-action-text">
            <strong>Adjust the length</strong>
            <span>Điều chỉnh độ dài văn bản với thanh trượt 5 mức</span>
          </div>
        </button>
        <button class="ai-action-item" data-action="open-reading-level">
          <span class="ai-action-icon">🎓</span>
          <div class="ai-action-text">
            <strong>Reading level</strong>
            <span>Thay đổi cấp độ học vấn và văn phong phù hợp</span>
          </div>
        </button>
        <button class="ai-action-item" data-action="polish">
          <span class="ai-action-icon">✨</span>
          <div class="ai-action-text">
            <strong>Add final polish</strong>
            <span>Trau chuốt câu chữ, ngữ pháp và tính lưu loát</span>
          </div>
        </button>
        <button class="ai-action-item" data-action="emojis">
          <span class="ai-action-icon">😊</span>
          <div class="ai-action-text">
            <strong>Add emojis</strong>
            <span>Thêm biểu tượng cảm xúc sinh động chuẩn ngữ cảnh</span>
          </div>
        </button>
      `;
    } else if (this.mode === 'code') {
      this.dom.aiActionMenu.innerHTML = `
        <div class="ai-menu-title">Công cụ AI Lập trình (Canvas)</div>
        <button class="ai-action-item" data-action="code-review">
          <span class="ai-action-icon">🔍</span>
          <div class="ai-action-text">
            <strong>Code review</strong>
            <span>Đánh giá cấu trúc, hiệu năng và bảo mật</span>
          </div>
        </button>
        <button class="ai-action-item" data-action="fix-bugs">
          <span class="ai-action-icon">🐛</span>
          <div class="ai-action-text">
            <strong>Fix bugs</strong>
            <span>Tự động phát hiện lỗi và vá sửa kèm Diff</span>
          </div>
        </button>
        <button class="ai-action-item" data-action="open-port-lang">
          <span class="ai-action-icon">🌐</span>
          <div class="ai-action-text">
            <strong>Port to language</strong>
            <span>Chuyển đổi sang Python, JS, C++, Go, Rust...</span>
          </div>
        </button>
        <button class="ai-action-item" data-action="add-logs">
          <span class="ai-action-icon">📝</span>
          <div class="ai-action-text">
            <strong>Add logs</strong>
            <span>Tự động chèn câu lệnh log debug các hàm quan trọng</span>
          </div>
        </button>
        <button class="ai-action-item" data-action="add-comments">
          <span class="ai-action-icon">💬</span>
          <div class="ai-action-text">
            <strong>Add comments</strong>
            <span>Tự động tạo chú thích JSDoc / Docstring chi tiết</span>
          </div>
        </button>
      `;
    }

    // Attach listeners
    this.dom.aiActionMenu.querySelectorAll('.ai-action-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        this.dom.aiActionMenu.classList.remove('open');
        this.handleAiActionClick(action);
      });
    });
  }

  handleAiActionClick(action) {
    if (action === 'open-length-slider') {
      this.showLengthSliderModal();
    } else if (action === 'open-reading-level') {
      this.showReadingLevelModal();
    } else if (action === 'open-port-lang') {
      this.showPortLanguageModal();
    } else {
      this.callAiAction(action);
    }
  }

  showLengthSliderModal() {
    let modal = document.getElementById('lengthSliderModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'lengthSliderModal';
      modal.className = 'canvas-modal-bottom-sheet';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="sheet-header">
        <h3>📏 Điều chỉnh độ dài (Adjust length)</h3>
        <button class="sheet-close" onclick="document.getElementById('lengthSliderModal').classList.remove('open')">✕</button>
      </div>
      <div class="sheet-body">
        <p class="sheet-desc">Kéo thanh trượt để AI co giãn nội dung phù hợp mục tiêu:</p>
        <div class="slider-wrapper">
          <input type="range" id="lengthRange" min="1" max="5" value="3" step="1" />
          <div class="slider-labels">
            <span>Cực ngắn</span>
            <span>Ngắn hơn</span>
            <span>Nguyên bản</span>
            <span>Dài hơn</span>
            <span>Rất dài</span>
          </div>
        </div>
        <div class="slider-actions">
          <button class="btn-primary" id="applyLengthBtn">Áp dụng thay đổi</button>
        </div>
      </div>
    `;

    modal.classList.add('open');
    document.getElementById('applyLengthBtn').addEventListener('click', () => {
      const val = parseInt(document.getElementById('lengthRange').value);
      const levels = ['shortest', 'shorter', 'original', 'longer', 'longest'];
      const targetLevel = levels[val - 1];
      modal.classList.remove('open');
      this.callAiAction('adjust-length', { level: targetLevel });
    });
  }

  showReadingLevelModal() {
    let modal = document.getElementById('readingLevelModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'readingLevelModal';
      modal.className = 'canvas-modal-bottom-sheet';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="sheet-header">
        <h3>🎓 Cấp độ đọc (Reading Level)</h3>
        <button class="sheet-close" onclick="document.getElementById('readingLevelModal').classList.remove('open')">✕</button>
      </div>
      <div class="sheet-body">
        <p class="sheet-desc">Chọn phong cách và đối tượng tiếp nhận văn bản:</p>
        <div class="level-options">
          <label class="level-card"><input type="radio" name="rlevel" value="kindergarten" /> <div><strong>🎈 Mẫu giáo / Trẻ em</strong><span>Từ ngữ siêu đơn giản, hình ảnh sinh động</span></div></label>
          <label class="level-card"><input type="radio" name="rlevel" value="middle-school" /> <div><strong>🎒 Học sinh THCS</strong><span>Rõ ràng, dễ tiếp cận, bổ sung ví dụ minh họa</span></div></label>
          <label class="level-card"><input type="radio" name="rlevel" value="high-school" checked /> <div><strong>🏫 Phổ thông / Đại chúng</strong><span>Văn phong chuẩn mực, súc tích và dễ đọc</span></div></label>
          <label class="level-card"><input type="radio" name="rlevel" value="graduate" /> <div><strong>🏛️ Học thuật / Chuyên sâu</strong><span>Ngữ nghĩa hàn lâm, chặt chẽ và học thuật cao</span></div></label>
        </div>
        <div class="slider-actions">
          <button class="btn-primary" id="applyReadingLevelBtn">Cập nhật cấp độ</button>
        </div>
      </div>
    `;

    modal.classList.add('open');
    document.getElementById('applyReadingLevelBtn').addEventListener('click', () => {
      const selected = modal.querySelector('input[name="rlevel"]:checked')?.value || 'high-school';
      modal.classList.remove('open');
      this.callAiAction('reading-level', { level: selected });
    });
  }

  showPortLanguageModal() {
    const targetLang = prompt('Chọn ngôn ngữ muốn chuyển đổi sang (python, typescript, cpp, go, java, rust):', 'python');
    if (targetLang) {
      this.callAiAction('port-language', { targetLanguage: targetLang.toLowerCase() });
    }
  }

  async callAiAction(action, options = {}) {
    const current = this.getCurrentContent();
    this.showLoadingIndicator(`AI đang thực thi "${action}"...`);

    try {
      const res = await fetch('/api/canvas/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          type: this.mode,
          content: current,
          language: this.language,
          options: options,
          selection: options.selection
        })
      });

      const data = await res.json();
      this.hideLoadingIndicator();

      if (data.success) {
        if (data.newContent && data.newContent !== current) {
          this.commitVersion(data.newContent, data.summary || `AI: ${action}`);
          this.renderCurrentContent();
          // Flash updated notification
          this.showToast(`✔ ${data.summary || 'Đã cập nhật'}`);
        }

        if (data.annotations && data.annotations.length > 0) {
          this.annotations = data.annotations;
          this.renderDocAnnotations();
          this.showToast(`✔ Đã tạo ${data.annotations.length} đề xuất kiểm tra.`);
        }
      } else {
        alert('Lỗi xử lý AI: ' + (data.error || 'Vui lòng thử lại'));
      }
    } catch (err) {
      this.hideLoadingIndicator();
      console.error('Lỗi gọi API AI:', err);
      alert('Không thể kết nối đến máy chủ AI: ' + err.message);
    }
  }

  renderDocAnnotations() {
    if (!this.dom.annotationsContainer) return;
    if (this.annotations.length === 0) {
      this.dom.annotationsContainer.innerHTML = '';
      return;
    }

    let html = '<div class="annotations-sidebar">';
    this.annotations.forEach((item, idx) => {
      html += `
        <div class="annotation-card" id="annot_${idx}">
          <div class="annotation-badge">💡 Đề xuất #${idx + 1}</div>
          ${item.phrase ? `<div class="annot-orig">"${item.phrase}"</div>` : ''}
          ${item.suggestion ? `<div class="annot-suggest">➔ ${item.suggestion}</div>` : ''}
          ${item.comment ? `<div class="annot-comment">${item.comment}</div>` : ''}
          ${item.reason ? `<div class="annot-reason">${item.reason}</div>` : ''}
          <div class="annot-actions">
            <button class="annot-btn apply" onclick="window.canvasInstance.applyAnnotation(${idx})">Áp dụng ✔️</button>
            <button class="annot-btn dismiss" onclick="window.canvasInstance.dismissAnnotation(${idx})">Bỏ qua ✕</button>
          </div>
        </div>
      `;
    });
    html += '</div>';
    this.dom.annotationsContainer.innerHTML = html;
  }

  applyAnnotation(idx) {
    const item = this.annotations[idx];
    if (!item) return;
    if (item.phrase && item.suggestion) {
      const current = this.getCurrentContent();
      const replaced = current.replace(item.phrase, item.suggestion);
      this.commitVersion(replaced, `Áp dụng đề xuất: ${item.suggestion}`);
      this.renderCurrentContent();
    }
    this.dismissAnnotation(idx);
  }

  dismissAnnotation(idx) {
    this.annotations.splice(idx, 1);
    this.renderDocAnnotations();
  }

  updateStats() {
    const text = this.getCurrentContent();
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const readMin = Math.ceil(words / 200);

    if (this.dom.wordCountEl) this.dom.wordCountEl.textContent = `${words} từ`;
    if (this.dom.charCountEl) this.dom.charCountEl.textContent = `${chars} ký tự`;
    if (this.dom.readTimeEl) this.dom.readTimeEl.textContent = `~${readMin} phút đọc`;
  }

  exportCurrentDocument() {
    const content = this.getCurrentContent();
    let ext = '.txt';
    let mime = 'text/plain';

    if (this.mode === 'code') {
      const extMap = { javascript: '.js', python: '.py', html: '.html', css: '.css', cpp: '.cpp', json: '.json' };
      ext = extMap[this.language] || '.txt';
      mime = 'application/javascript';
    } else if (this.mode === 'whiteboard' && window.whiteboardInstance) {
      const dataUrl = window.whiteboardInstance.exportImage();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${this.title.replace(/\s+/g, '_')}.png`;
      a.click();
      return;
    } else {
      ext = '.md';
      mime = 'text/markdown';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.title.replace(/\s+/g, '_')}${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  showLoadingIndicator(msg) {
    let loader = document.getElementById('canvasAiLoader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'canvasAiLoader';
      loader.className = 'canvas-ai-loading-overlay';
      this.dom.container.appendChild(loader);
    }
    loader.innerHTML = `
      <div class="loader-spinner"></div>
      <div class="loader-msg">${msg || 'AI đang xử lý...'}</div>
    `;
    loader.style.display = 'flex';
  }

  hideLoadingIndicator() {
    const loader = document.getElementById('canvasAiLoader');
    if (loader) loader.style.display = 'none';
  }

  showToast(msg) {
    let toast = document.getElementById('canvasToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'canvasToast';
      toast.className = 'canvas-floating-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
}

window.CanvasManager = CanvasManager;
