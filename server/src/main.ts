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
      console.log(`Using PORT from environment: ${port}`);
      return port;
    }
  }
  
  // 默认端口
  console.log('Using default port: 3000');
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
  console.log('Current working directory:', process.cwd());
  console.log('__dirname:', __dirname);
  
  // 尝试多个可能的路径
  const possiblePaths = [
    join(process.cwd(), 'dist-web'),          // Railway 构建
    join(__dirname, '..', '..', 'dist-web'),  // 相对于 server/dist
    join(__dirname, '..', 'dist-web'),        // 相对于 server/dist
  ];
  
  let staticPath = '';
  for (const path of possiblePaths) {
    console.log(`Checking static path: ${path}, exists: ${fs.existsSync(path)}`);
    if (fs.existsSync(path)) {
      const files = fs.readdirSync(path);
      console.log(`Files in ${path}:`, files.slice(0, 10));
      staticPath = path;
      console.log(`✓ Found static files at: ${path}`);
      break;
    }
  }
  
  if (staticPath) {
    app.use(express.static(staticPath));
    console.log(`✓ Serving static files from: ${staticPath}`);
    
    // 处理 SPA 路由，所有非 API 请求返回 index.html
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (!req.path.startsWith('/api')) {
        const indexPath = join(staticPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
          return;
        }
      }
      next();
    });
  } else {
    console.warn('⚠️ Warning: Static files directory not found');
    
    // 兜底：返回提示页面
    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (!req.path.startsWith('/api')) {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>智界雷达 - 构建中</title>
            <style>
              body { 
                background: #000; 
                color: #fff; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
              }
              .container { text-align: center; }
              h1 { font-size: 32px; margin-bottom: 16px; }
              p { color: #888; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>智界雷达</h1>
              <p>应用正在部署中，请稍后刷新...</p>
              <p style="margin-top: 20px; font-size: 12px;">如果问题持续，请联系管理员</p>
            </div>
          </body>
          </html>
        `);
        return;
      }
      next();
    });
  }

  // 全局拦截器：统一将 POST 请求的 201 状态码改为 200
  app.useGlobalInterceptors(new HttpStatusInterceptor());
  
  // 开启优雅关闭
  app.enableShutdownHooks();

  // 获取端口并启动
  const port = getPort();
  await app.listen(port, '0.0.0.0');
  console.log(`✓ Server running on port ${port}`);
  console.log(`✓ Health check available at: http://localhost:${port}/api/health`);
}
bootstrap();
