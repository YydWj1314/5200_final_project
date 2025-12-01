#!/bin/bash

# 启动 Cloud SQL 代理
export PATH=/opt/homebrew/share/google-cloud-sdk/bin:"$PATH"

CONNECTION_NAME="db-002088658-472700:southamerica-west1:neu-test-db"
PROXY_DIR="$HOME/.cloud-sql-proxy"
PROXY_BIN="$PROXY_DIR/cloud-sql-proxy"

echo "正在设置 Cloud SQL Proxy..."

# 创建目录
mkdir -p "$PROXY_DIR"

# 检查是否已下载
if [ ! -f "$PROXY_BIN" ]; then
    echo "正在下载 Cloud SQL Proxy..."
    ARCH=$(uname -m)
    if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
        ARCH="darwin.arm64"
    else
        ARCH="darwin.amd64"
    fi
    
    curl -o "$PROXY_BIN" "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.${ARCH}"
    chmod +x "$PROXY_BIN"
    echo "下载完成！"
fi

echo ""
echo "正在启动 Cloud SQL Proxy..."
echo "连接名称: $CONNECTION_NAME"
echo "本地端口: 3307"
echo ""
echo "代理启动后，你的应用就可以通过 localhost:3307 连接数据库了"
echo "按 Ctrl+C 停止代理"
echo ""

# 启动代理
"$PROXY_BIN" "$CONNECTION_NAME" --port=3307
