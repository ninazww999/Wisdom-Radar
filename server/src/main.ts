import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import * as express from 'express';
import { HttpStatusInterceptor } from '@/interceptors/http-status.interceptor';
import { join } from 'path';
import * as fs from 'fs';

function getPort(): number {
  // Railway 会设置 PORT 环境变量
  const envPort = process.env.PORT;
  if (envPort) {
    const port = parseInt(envPort, 10);
    if (!isNaN(port) && port > 0 && port < 65536) {
      return port;
    }
  }
  
  // 默认端口
  return 3000;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 服务前端静态文件（H5 小程序）
  // 尝试多个可能的路径
  const possiblePaths = [
    join(__dirname, '..', '..', 'dist-web'),  // Railway 构建
    join(__dirname, '..', 'dist-web'),        // 相对于 server/dist
    join(process.cwd(), 'dist-web'),          // 当前工作目录
  ];
  
  let staticPath = '';
  for (const path of possiblePaths) {
    console.log(`Checking static path: ${path}`);
    if (fs.existsSync(path)) {
      staticPath = path;
      console.log(`Found static files at: ${path}`);
      break;
    }
  }
  
  if (staticPath) {
    app.use(express.static(staticPath));
    console.log(`Serving static files from: ${staticPath}`);
  } else {
    console.warn('Warning: Static files directory not found');
  }

  // 全局拦截器：统一将 POST 请求的 201 状态码改为 200
  app.useGlobalInterceptors(new HttpStatusInterceptor());
  
  // 开启优雅关闭
  app.enableShutdownHooks();

  // 获取端口并启动
  const port = getPort();
  await app.listen(port, '0.0.0.0');
  console.log(`Server running on port ${port}`);
  console.log(`Health check available at: http://localhost:${port}/api/health`);
}
bootstrap();
