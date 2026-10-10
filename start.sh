#!/usr/bin/env bash
# 吃瓜命理盘 · 一键启动脚本
# 使用 PHP 内置服务器同时服务前端和后端

set -e

# 加载同目录 .env（若存在；不覆盖已导出的变量）
SCRIPT_DIR_EARLY="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [[ -f "${SCRIPT_DIR_EARLY}/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${SCRIPT_DIR_EARLY}/.env"
  set +a
fi

HOST="${APP_HOST:-0.0.0.0}"
PORT="${APP_PORT:-8000}"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}🍉 吃瓜命理盘 · 启动中...${NC}"
echo ""

# 检查 PHP
if ! command -v php &> /dev/null; then
    echo -e "${YELLOW}❌ 未检测到 PHP，请先安装${NC}"
    echo "  macOS:   brew install php"
    echo "  Ubuntu:  sudo apt install php"
    echo "  Windows: https://windows.php.net/download/"
    exit 1
fi

PHP_VERSION=$(php -v | head -n 1)
echo -e "${GREEN}✓ PHP: ${PHP_VERSION}${NC}"

# 检查 Redis（可选，给出提示）
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓ Redis: 已连接${NC}"
    else
        echo -e "${YELLOW}⚠ Redis: 未运行（将自动降级到文件存储）${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Redis: 未安装（将使用文件存储）${NC}"
fi

echo ""
echo -e "${CYAN}🚀 服务启动：${NC}"
echo -e "   ${GREEN}本地访问: ${NC}http://localhost:${PORT}"
echo -e "   ${GREEN}局域网:   ${NC}http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo '127.0.0.1'):${PORT}"
echo -e "   ${GREEN}API:      ${NC}http://localhost:${PORT}/api/"
echo ""
echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
echo ""

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 启动（使用完整路径）
exec php -S "${HOST}:${PORT}" "${SCRIPT_DIR}/server.php"
