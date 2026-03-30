# Railway 部署指南

本文档说明如何将「智界雷达」小程序后端部署到 Railway 平台。

## 前提条件

1. **Railway 账号**：在 [railway.com](https://railway.com) 注册账号（支持 GitHub 登录）
2. **GitHub 仓库**：将代码推送到 GitHub 仓库
3. **Coze API 凭证**：确保有有效的 Coze API 配置

---

## 部署步骤

### 1. 推送代码到 GitHub

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: 初始化智界雷达项目"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/你的仓库.git

# 推送
git push -u origin main
```

### 2. 在 Railway 创建项目

1. 登录 [Railway Dashboard](https://railway.com/dashboard)
2. 点击 **New Project**
3. 选择 **Deploy from GitHub repo**
4. 授权 GitHub 并选择你的仓库
5. Railway 会自动检测项目配置

### 3. 配置环境变量

在 Railway 项目设置中添加以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `COZE_API_BASE` | Coze API 地址 | `https://api.coze.cn` |
| `COZE_ACCESS_TOKEN` | Coze 访问令牌 | 你的 token |
| `COZE_BOT_ID` | Coze 机器人 ID | 你的 bot id |
| `PROJECT_DOMAIN` | 项目域名（可选） | `https://你的应用.railway.app` |

**添加环境变量的步骤**：
1. 进入项目 → 点击 Service
2. 点击 **Variables** 标签
3. 点击 **Add Variable**
4. 输入变量名和值
5. 点击 **Add** 保存

### 4. 触发部署

配置完成后，Railway 会自动开始部署。你也可以：
- 在 **Deployments** 标签手动触发重新部署
- 推送新代码到 GitHub 自动触发部署

### 5. 获取应用 URL

部署成功后：
1. 进入 Service → **Settings**
2. 找到 **Domains** 部分
3. Railway 会自动生成一个 `.railway.app` 域名
4. 也可以绑定自定义域名

---

## 本地测试部署配置

在推送前，可以本地测试构建：

```bash
# 安装依赖
pnpm install

# 构建后端
pnpm build:server

# 测试启动
cd server && node dist/main.js
```

---

## 验证部署

部署成功后，访问以下 URL 验证：

- 健康检查：`https://你的域名.railway.app/api`
- 资讯列表：`https://你的域名.railway.app/api/news/list`

---

## 常见问题

### Q: 构建失败怎么办？
A: 查看 Railway 的 **Deployments** 日志，通常会显示具体的错误信息。

### Q: 如何查看运行日志？
A: 进入 Service → **Logs** 标签，可以实时查看应用日志。

### Q: 如何更新部署？
A: 推送新代码到 GitHub，Railway 会自动触发重新部署。

### Q: 如何配置自定义域名？
A: 在 Service → **Settings** → **Domains** 中添加自定义域名，然后按提示配置 DNS。

---

## 费用说明

Railway 提供免费额度：
- 每月 $5 免费额度
- 足够开发和小规模使用

超出后按使用量计费，详见 [Railway Pricing](https://railway.com/pricing)。
