# 北航智能微纳公共创新中心微信 H5 快捷入口

这是一个适合放在 GitHub Pages、Cloudflare Pages 或国内 HTTPS 静态托管上的 H5 入口页。页面面向手机和微信使用，重点优化设备预约前的浏览、搜索、状态查看和跳转流程。

## 当前功能

- 微信/手机友好的入口界面。
- 校内 SSO 登录入口，并尝试让登录后回到本 H5 控制台。
- 本机登录时间记录，仅保存在当前浏览器 `localStorage`，不含账号、密码或 Cookie。
- 160 台公开设备的 H5 设备中心。
- 设备搜索、分类筛选、图片卡片、负责人、联系人、地点、详情抽屉。
- 设备当前状态快照：空闲、使用中、未知/暂停。
- 手动“刷新状态”按钮和“自动刷新”开关。
- 每台设备的机时预约、送样预约、原站公开详情入口。

## 状态刷新说明

GitHub Pages 上的 H5 页面不能直接实时请求原站状态接口，因为原站没有开放跨域访问。因此页面读取同目录的 `equipment-status.json` 状态快照。

仓库中可以配合 GitHub Actions 定时更新这个 JSON。普通用户点击“刷新状态”或打开“自动刷新”时，会读取最新已发布的快照；它不保存账号密码，也不会代登录或代提交预约。

如果以后接入阿里云或其他后端，可以把同一个按钮改为请求自己的后端接口，从而做到接近实时的设备状态刷新。

## 重要边界

原系统登录、实时号源、最终预约提交、账号密码仍由原系统处理。本入口页只负责设备浏览、状态快照、预约前选择和跳转，不代理登录，不保存密码，不提交预约表单。

原站响应头包含 `X-Frame-Options: SAMEORIGIN`，第三方页面不能直接 iframe 嵌入原系统。因此目前采用“优化 H5 前端 + 跳转原系统具体业务页”的方案。

## 文件

- `index.html`：手机端入口页，内置设备中心和设备数据。
- `equipment-status.json`：公开设备当前状态快照，不包含用户名、用户 ID、Cookie 或账号数据。
- `manifest.webmanifest`：类 App/PWA 配置。
- `icon.svg`：入口图标。
- `.nojekyll`：让 GitHub Pages 按普通静态文件发布。

## GitHub Pages 部署

1. 把本目录文件上传到仓库，例如 `bhnano-entry/bhnano-wechat-entry/`。
2. 在仓库 `Settings` 打开 `Pages`。
3. `Build and deployment` 选择 `Deploy from a branch`。
4. `Branch` 选择 `main`，目录选择 `/root`。
5. 保存后等待 1-3 分钟。
6. 访问：
   `https://你的用户名.github.io/bhnano-entry/bhnano-wechat-entry/`

## 发布提醒

GitHub Pages 默认公开。设备数据来自原系统公开页面，其中可能包含联系人、手机号和地点。仓库公开前，应确认这些公开信息允许同步展示到 GitHub Pages。
