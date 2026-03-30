# Railway Dockerfile - 完全控制构建过程

FROM node:20-slim

RUN npm install -g pnpm@9

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY server/package.json ./server/

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm build:server
RUN pnpm build:web

RUN echo "=== Build Output ===" && ls -la dist-web/ && ls -la server/dist/

EXPOSE 3000

CMD ["node", "server/dist/main.js"]
