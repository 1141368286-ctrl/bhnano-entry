# 北航智能微纳公共创新中心微信 H5 快捷入口

这个目录是一个静态 H5 入口页，适合部署到 HTTPS 域名后在微信里打开。

## 文件

- `index.html`：手机端入口页面
- `manifest.webmanifest`：类 App/PWA 配置
- `icon.svg`：入口图标

## 使用方式

1. 把整个 `bhnano-wechat-entry` 目录上传到一个 HTTPS 网站空间。
2. 在微信中发送部署后的 `index.html` 地址。
3. 用户点开后可通过“校内单点登录”“平台首页”“仪器展示”等入口跳转到原系统。

## 免费部署方案：GitHub Pages

GitHub Pages 可以免费托管静态网页，适合这个入口页。

1. 注册或登录 GitHub。
2. 新建一个公开仓库，例如 `bhnano-entry`。
3. 上传本目录里的全部文件：`index.html`、`manifest.webmanifest`、`icon.svg`、`README.md`。
4. 进入仓库的 `Settings`。
5. 左侧打开 `Pages`。
6. `Build and deployment` 选择 `Deploy from a branch`。
7. `Branch` 选择 `main`，目录选择 `/root`，保存。
8. 等待 1-3 分钟，GitHub 会给出一个地址，通常类似：

   `https://你的用户名.github.io/bhnano-entry/`

把这个地址发到微信即可长期使用。

注意：GitHub Pages 页面默认公开，不能放账号、密码、内部文件或敏感数据。本入口页只放公开跳转链接，适合部署。

## 其他免费方案

- Cloudflare Pages：免费、速度通常较好，也支持 GitHub 仓库自动部署。
- Netlify：可以直接拖拽整个文件夹部署，适合不会 Git 命令的用户。
- Vercel：也可部署静态网页，但对简单入口页来说功能偏多。

## 重要限制

原站响应头包含 `X-Frame-Options: SAMEORIGIN`，因此第三方页面不能把原系统直接嵌入 iframe。这个入口页采用跳转式方案，不会代理登录，也不会保存账号密码。

如果要做真正的微信小程序，需要：

- 申请或使用已有微信小程序账号与 `AppID`
- 在小程序后台配置合法业务域名
- 原系统支持小程序内 WebView 或提供可调用 API
- 按学校/平台要求完成登录与数据安全合规
