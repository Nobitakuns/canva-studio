#!/bin/bash
# Script khởi chạy Canva Pro Design Studio trên macOS
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
if [ -d "$DIR/canvas" ]; then
  cd "$DIR/canvas"
else
  cd "$DIR"
fi

echo "=================================================="
echo "🎨 Đang khởi động Canva Pro Design Studio..."
echo "👉 Địa chỉ: http://localhost:3030"
echo "=================================================="

export PATH="/Users/masterdzj/.nvm/versions/node/v22.23.3/bin:$PATH"

# Tự động mở trình duyệt sau 1 giây
(sleep 1.2 && open "http://localhost:3030/") &

node server.js
