#!/bin/bash

# 设置 PATH
export PATH=/opt/homebrew/share/google-cloud-sdk/bin:"$PATH"

echo "=========================================="
echo "GCP 数据库连接配置脚本"
echo "=========================================="
echo ""

# 步骤 1: 修复权限
echo "步骤 1: 修复权限..."
if [ ! -d ~/.config/gcloud ]; then
    echo "需要创建 ~/.config/gcloud 目录"
    echo "请运行: sudo mkdir -p ~/.config/gcloud && sudo chown -R \$(whoami) ~/.config/gcloud"
    echo "然后重新运行此脚本"
    exit 1
fi

# 步骤 2: 检查是否已登录
echo ""
echo "步骤 2: 检查 gcloud 登录状态..."
gcloud auth list

# 步骤 3: 登录（如果需要）
echo ""
echo "步骤 3: 如果需要登录，请运行:"
echo "  gcloud auth login"
echo ""

# 步骤 4: 设置项目
echo "步骤 4: 设置 GCP 项目..."
gcloud config set project db-002088658-472700

echo ""
echo "=========================================="
echo "配置完成！"
echo "=========================================="
echo ""
echo "现在请在新的终端窗口运行以下命令启动 Cloud SQL 代理："
echo ""
echo "  export PATH=/opt/homebrew/share/google-cloud-sdk/bin:\"\$PATH\""
echo "  gcloud sql connect neu-test-db --user=admin1"
echo ""
echo "代理启动后，刷新浏览器页面即可！"
echo ""

