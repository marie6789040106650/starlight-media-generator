# LibreOffice PDF转换服务完整部署指南

本文档详细介绍如何在服务器上部署和配置LibreOffice PDF转换服务。

## 📋 目录

- [系统要求](#系统要求)
- [快速安装](#快速安装)
- [手动安装](#手动安装)
- [Docker部署](#docker部署)
- [配置说明](#配置说明)
- [测试验证](#测试验证)
- [故障排除](#故障排除)
- [性能优化](#性能优化)

## 🔧 系统要求

### 最低要求
- **内存**: 512MB RAM (推荐 1GB+)
- **磁盘**: 500MB 可用空间
- **CPU**: 1核心 (推荐 2核心+)
- **操作系统**: 
  - Ubuntu 18.04+ / Debian 9+
  - CentOS 7+ / RHEL 7+
  - macOS 10.14+

### 软件依赖
- Node.js 16+
- LibreOffice 6.0+
- 字体包 (中文支持)

## 🚀 快速安装

### 1. 自动安装脚本

```bash
# 下载并运行安装脚本
curl -fsSL https://raw.githubusercontent.com/your-repo/scripts/install-libreoffice.sh | bash

# 或者如果已克隆仓库
./scripts/install-libreoffice.sh
```

### 2. 验证安装

```bash
# 快速测试
./scripts/quick-pdf-test.sh

# 详细测试
node scripts/test-pdf-conversion.js
```

## 🔨 手动安装

### Ubuntu/Debian

```bash
# 更新包列表
sudo apt-get update

# 安装LibreOffice核心组件
sudo apt-get install -y \
    libreoffice-core \
    libreoffice-writer \
    libreoffice-common \
    --no-install-recommends

# 安装字体支持
sudo apt-get install -y \
    fonts-liberation \
    fonts-dejavu-core \
    fonts-noto-cjk \
    fonts-wqy-microhei \
    fonts-wqy-zenhei

# 验证安装
libreoffice --version
libreoffice --headless --version
```

### CentOS/RHEL

```bash
# 安装EPEL仓库
sudo yum install -y epel-release

# 安装LibreOffice
sudo yum install -y \
    libreoffice-headless \
    libreoffice-writer \
    liberation-fonts \
    dejavu-fonts-common

# 验证安装
libreoffice --version
```

### macOS

```bash
# 使用Homebrew安装
brew install --cask libreoffice

# 验证安装
/Applications/LibreOffice.app/Contents/MacOS/soffice --version
```

## 🐳 Docker部署

### 1. 使用预构建镜像

```bash
# 构建镜像
docker build -f docker/libreoffice.Dockerfile -t starlight-pdf .

# 运行容器
docker run -d \
    --name starlight-pdf \
    -p 3000:3000 \
    -e NODE_ENV=production \
    -e LIBREOFFICE_HEADLESS=1 \
    starlight-pdf
```

### 2. 使用Docker Compose

```bash
# 启动完整服务栈
docker-compose -f docker/docker-compose.pdf.yml up -d

# 查看服务状态
docker-compose -f docker/docker-compose.pdf.yml ps

# 查看日志
docker-compose -f docker/docker-compose.pdf.yml logs -f app
```

### 3. Kubernetes部署

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: starlight-pdf
spec:
  replicas: 2
  selector:
    matchLabels:
      app: starlight-pdf
  template:
    metadata:
      labels:
        app: starlight-pdf
    spec:
      containers:
      - name: app
        image: starlight-pdf:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: LIBREOFFICE_HEADLESS
          value: "1"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/generate-pdf
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/generate-pdf
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: starlight-pdf-service
spec:
  selector:
    app: starlight-pdf
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## ⚙️ 配置说明

### 环境变量

```bash
# LibreOffice配置
export LIBREOFFICE_HEADLESS=1
export SAL_USE_VCLPLUGIN=svp

# PDF转换配置
export PDF_CONVERSION_TIMEOUT=45000
export PDF_MAX_RETRIES=3
export PDF_TEMP_DIR=/tmp/pdf-conversion

# 应用配置
export NODE_ENV=production
export PORT=3000
```

### 应用配置文件

```javascript
// config/pdf.js
module.exports = {
  conversion: {
    timeout: process.env.PDF_CONVERSION_TIMEOUT || 45000,
    maxRetries: process.env.PDF_MAX_RETRIES || 3,
    tempDir: process.env.PDF_TEMP_DIR || '/tmp/pdf-conversion'
  },
  libreoffice: {
    commands: [
      'libreoffice',
      '/usr/bin/libreoffice',
      '/opt/libreoffice/program/soffice',
      'soffice'
    ]
  }
}
```

## 🧪 测试验证

### 1. 健康检查

```bash
# 检查服务状态
curl http://localhost:3000/api/generate-pdf

# 预期响应
{
  "status": "ok",
  "message": "PDF生成服务正常",
  "converter": "LibreOffice",
  "version": "LibreOffice 7.x.x"
}
```

### 2. 功能测试

```bash
# 使用快速测试脚本
./scripts/quick-pdf-test.sh

# 使用详细测试脚本
node scripts/test-pdf-conversion.js

# 手动测试
curl -X POST http://localhost:3000/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# 测试文档\n\n这是一个测试。",
    "storeName": "测试店铺"
  }' \
  --output test.pdf
```

### 3. 性能测试

```bash
# 并发测试
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/generate-pdf \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"# 测试 $i\",\"storeName\":\"店铺$i\"}" \
    --output "test-$i.pdf" &
done
wait
```

## 🔍 故障排除

### 常见问题

#### 1. LibreOffice未找到

**错误**: `command not found: libreoffice`

**解决方案**:
```bash
# 检查安装
which libreoffice
ls -la /usr/bin/libreoffice

# 重新安装
sudo apt-get install --reinstall libreoffice-core
```

#### 2. 权限错误

**错误**: `Permission denied`

**解决方案**:
```bash
# 设置临时目录权限
sudo chmod 1777 /tmp

# 检查用户权限
whoami
groups

# 创建专用目录
sudo mkdir -p /var/lib/pdf-conversion
sudo chown $USER:$USER /var/lib/pdf-conversion
```

#### 3. 内存不足

**错误**: `Cannot allocate memory`

**解决方案**:
```bash
# 检查内存使用
free -h
ps aux --sort=-%mem | head

# 增加swap空间
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 4. 字体问题

**错误**: 中文字符显示为方块

**解决方案**:
```bash
# 安装中文字体
sudo apt-get install fonts-noto-cjk fonts-wqy-microhei

# 刷新字体缓存
sudo fc-cache -fv

# 验证字体
fc-list | grep -i chinese
```

#### 5. 转换超时

**错误**: `Conversion timeout`

**解决方案**:
```bash
# 增加超时时间
export PDF_CONVERSION_TIMEOUT=60000

# 检查系统负载
top
iostat 1 5

# 优化LibreOffice启动
export SAL_USE_VCLPLUGIN=svp
export LIBREOFFICE_HEADLESS=1
```

### 调试模式

```bash
# 启用详细日志
export DEBUG=pdf:*
export NODE_ENV=development

# 保留临时文件
export PDF_DEBUG_KEEP_TEMP=1

# 运行应用
npm run dev
```

### 日志分析

```bash
# 查看应用日志
tail -f logs/app.log | grep -i pdf

# 查看系统日志
sudo journalctl -u your-app-service -f

# 查看LibreOffice进程
ps aux | grep libreoffice
```

## 🚀 性能优化

### 1. 系统优化

```bash
# 调整文件描述符限制
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# 优化内存设置
echo "vm.swappiness=10" >> /etc/sysctl.conf
echo "vm.vfs_cache_pressure=50" >> /etc/sysctl.conf
sysctl -p
```

### 2. LibreOffice优化

```bash
# 预热LibreOffice
libreoffice --headless --invisible --nodefault --nolockcheck &
sleep 5
pkill -f libreoffice

# 使用内存文件系统
sudo mount -t tmpfs -o size=512M tmpfs /tmp/pdf-conversion
```

### 3. 应用优化

```javascript
// 连接池配置
const pool = {
  min: 2,
  max: 10,
  acquireTimeoutMillis: 30000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200
}

// 缓存配置
const cache = {
  ttl: 3600, // 1小时
  max: 100,  // 最大缓存数量
  updateAgeOnGet: true
}
```

### 4. 监控配置

```javascript
// 性能监控
const metrics = {
  conversionTime: new Histogram({
    name: 'pdf_conversion_duration_seconds',
    help: 'PDF conversion duration in seconds'
  }),
  conversionCount: new Counter({
    name: 'pdf_conversion_total',
    help: 'Total number of PDF conversions'
  }),
  errorCount: new Counter({
    name: 'pdf_conversion_errors_total',
    help: 'Total number of PDF conversion errors'
  })
}
```

## 📊 监控和维护

### 健康检查端点

```bash
# 基本健康检查
GET /api/generate-pdf

# 详细状态检查
GET /api/generate-pdf/status

# 性能指标
GET /api/generate-pdf/metrics
```

### 定期维护

```bash
# 清理临时文件
find /tmp -name "pdf-conversion-*" -mtime +1 -delete

# 重启LibreOffice服务
pkill -f libreoffice
systemctl restart your-app-service

# 检查磁盘空间
df -h
du -sh /tmp/*
```

## 🔗 相关链接

- [LibreOffice官方文档](https://help.libreoffice.org/)
- [Docker Hub - LibreOffice](https://hub.docker.com/r/libreoffice/online)
- [字体配置指南](https://wiki.archlinux.org/title/Fonts)
- [性能调优指南](https://wiki.documentfoundation.org/Performance)

## 📞 技术支持

如果遇到问题，请：

1. 查看本文档的故障排除部分
2. 运行测试脚本获取详细错误信息
3. 检查系统日志和应用日志
4. 提交Issue时请包含：
   - 操作系统版本
   - LibreOffice版本
   - 错误日志
   - 测试脚本输出

---

*最后更新: 2025-01-19*