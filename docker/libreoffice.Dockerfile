# LibreOffice PDF转换服务 Docker配置
# 基于Node.js运行时，集成LibreOffice用于PDF转换

FROM node:18-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖和LibreOffice
RUN apt-get update && apt-get install -y \
    # LibreOffice核心组件
    libreoffice-core \
    libreoffice-writer \
    libreoffice-common \
    # 字体支持
    fonts-liberation \
    fonts-dejavu-core \
    fonts-noto-cjk \
    fonts-wqy-microhei \
    fonts-wqy-zenhei \
    # 系统工具
    curl \
    wget \
    # 清理缓存
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /tmp/* \
    && rm -rf /var/tmp/*

# 设置LibreOffice环境变量
ENV LIBREOFFICE_HEADLESS=1
ENV SAL_USE_VCLPLUGIN=svp
ENV HOME=/tmp

# 创建非root用户
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 设置临时目录权限
RUN mkdir -p /tmp/libreoffice-conversion \
    && chmod 1777 /tmp \
    && chown -R appuser:appuser /tmp/libreoffice-conversion

# 复制应用文件
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# 构建应用
RUN npm run build

# 切换到非root用户
USER appuser

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/generate-pdf || exit 1

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]