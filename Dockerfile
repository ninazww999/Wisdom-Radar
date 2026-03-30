# Railway Dockerfile - 完全控制构建过程

# 基础镜像
FROM node:20-slim

# 安装依赖
RUN npm install -g pnpm@9

WORKDIR /app

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./
COPY server/package.json ./server/
COPY server/pnpm-lock.yaml ./server/ 2>/dev/null || true

# 安装依赖
RUN pnpm install --no-frozen-lockfile

# 复制源代码
COPY . .

# 构建后端和前端
RUN pnpm build:server
RUN pnpm build:web

# 验证构建输出
RUN echo "=== Build Output ===" && ls -la dist-web/ && ls -la server/dist/

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server/dist/main.js"]
