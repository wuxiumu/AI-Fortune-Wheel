#!/usr/bin/env bash
# 轻量冒烟：文件齐全 + 引擎单测 + PHP 起站探测（无需 Redis / API Key）
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

fail() { echo "✗ $1" >&2; exit 1; }
ok() { echo "✓ $1"; }

command -v php >/dev/null || fail "需要 PHP ≥ 7.4"
command -v node >/dev/null || fail "需要 Node（跑引擎单测）"

[[ -f server.php ]] || fail "缺少 server.php"
[[ -f index.html ]] || fail "缺少 index.html"
[[ -f api/index.php ]] || fail "缺少 api/index.php"
[[ -f api/data/east.json ]] || fail "缺少 api/data/east.json"
[[ -f js/engine.js ]] || fail "缺少 js/engine.js"
ok "核心文件齐全"

node tests/engine.test.js >/dev/null
ok "engines 单测通过"

PORT="${SMOKE_PORT:-18080}"
php -S "127.0.0.1:${PORT}" server.php >/tmp/ai-fortune-wheel-smoke.log 2>&1 &
PID=$!
cleanup() { kill "$PID" 2>/dev/null || true; }
trap cleanup EXIT

# 等端口就绪
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then break; fi
  sleep 0.2
done

curl -sf "http://127.0.0.1:${PORT}/" | grep -qi 'html' || fail "首页无响应"
ok "首页 200"

curl -sf "http://127.0.0.1:${PORT}/api/data/east.json" | grep -q '{' || fail "east.json 不可读"
ok "api/data/east.json 可读"

echo ""
echo "smoke: ok"
