# wuxia

一个基于 React + TypeScript + Vite 的浏览器武侠剧情 RPG 原型。

当前版本支持：
- 角色创建（出身 / 天赋）
- 配置驱动的多章节主线剧情
- 轻量回合制战斗（生命 / 气 / 势）
- 多结局分支与状态变量影响
- localStorage 本地自动存档

## 启动方法

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

启动后按终端提示打开本地地址，通常是：

```bash
http://localhost:5173
```

## 常用命令

### 运行测试

```bash
npm test
```

### 构建生产版本

```bash
npm run build
```

### 本地预览构建结果

```bash
npm run preview
```

## 让别人直接游玩

项目已经补好静态部署配置，最推荐直接发布成网页，让别人点链接就能玩。

### 方案一：GitHub Pages

仓库内已包含 GitHub Pages 工作流：

- `.github/workflows/deploy-pages.yml`
- `vite.config.ts` 中支持通过 `VITE_BASE_PATH` 切换部署路径

使用步骤：

1. 把代码推送到 GitHub 仓库默认分支 `main`
2. 打开仓库 **Settings → Pages**
3. Source 选择 **GitHub Actions**
4. 之后每次 push 到 `main` 都会自动执行测试、构建并发布

如果你的仓库地址是：

```text
https://github.com/Mr-Shuai/wuxia
```

那么最终可游玩地址通常会是：

```text
https://mr-shuai.github.io/wuxia/
```

### 方案二：Vercel

仓库内已包含：

- `vercel.json`

使用步骤：

1. 登录 Vercel
2. 导入该 GitHub 仓库
3. 保持默认设置直接部署

Vercel 会自动使用：

- Build Command: `npm run build`
- Output Directory: `dist`

### 本地模拟 GitHub Pages 构建

如果你想先在本地确认 GitHub Pages 的路径是否正确，可以运行：

```bash
VITE_BASE_PATH=/wuxia/ npm run build
```

普通本地或 Vercel 构建仍然使用：

```bash
npm run build
```
