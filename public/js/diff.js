/**
 * Canvas Studio - Diff Algorithm & Visual Diff Renderer
 * Tính toán sai khác chi tiết từng dòng giữa 2 phiên bản (LCS / Myers Line Diff)
 */

const DiffEngine = {
  // Compute line-by-line diff
  computeLineDiff(oldText, newText) {
    const oldLines = (oldText || '').split('\n');
    const newLines = (newText || '').split('\n');
    
    const n = oldLines.length;
    const m = newLines.length;
    
    // DP Table for Longest Common Subsequence (LCS)
    const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (oldLines[i - 1] === newLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    // Backtrack to build diff
    const diff = [];
    let i = n;
    let j = m;
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
        diff.unshift({ type: 'unchanged', text: oldLines[i - 1], oldLine: i, newLine: j });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        diff.unshift({ type: 'added', text: newLines[j - 1], oldLine: null, newLine: j });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        diff.unshift({ type: 'removed', text: oldLines[i - 1], oldLine: i, newLine: null });
        i--;
      }
    }
    
    return diff;
  },

  // Render HTML for visual diff
  renderDiffHtml(diffArray) {
    let html = '<div class="diff-container">';
    html += '<div class="diff-header-bar">';
    html += '  <div class="diff-legend">';
    html += '    <span class="diff-tag tag-removed">− Đã lược bỏ</span>';
    html += '    <span class="diff-tag tag-added">+ Đã thêm mới</span>';
    html += '  </div>';
    html += '</div>';
    html += '<div class="diff-lines">';

    let addCount = 0;
    let remCount = 0;

    diffArray.forEach((item, index) => {
      let icon = ' ';
      let rowClass = 'diff-row unchanged';
      if (item.type === 'added') {
        icon = '+';
        rowClass = 'diff-row added';
        addCount++;
      } else if (item.type === 'removed') {
        icon = '−';
        rowClass = 'diff-row removed';
        remCount++;
      }

      const escapedText = DiffEngine.escapeHtml(item.text);
      const oldNum = item.oldLine !== null ? item.oldLine : '';
      const newNum = item.newLine !== null ? item.newLine : '';

      html += `<div class="${rowClass}">`;
      html += `  <span class="diff-gutter diff-old-num">${oldNum}</span>`;
      html += `  <span class="diff-gutter diff-new-num">${newNum}</span>`;
      html += `  <span class="diff-gutter diff-sign">${icon}</span>`;
      html += `  <span class="diff-content">${escapedText || '&nbsp;'}</span>`;
      html += `</div>`;
    });

    html += '</div></div>';
    return { html, addCount, remCount };
  },

  escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiffEngine;
}
