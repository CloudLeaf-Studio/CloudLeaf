<div align="center">

<img src="assets/icon.png" alt="CloudLeaf" width="128" height="128">

# CloudLeaf

**浏览器书签云同步扩展**

[![Chrome 网上应用商店](https://img.shields.io/chrome-web-store/v/knpkebnhpcbklnknkcpgkiochlimhcoi?label=Chrome)](https://chrome.google.com/webstore/detail/knpkebnhpcbklnknkcpgkiochlimhcoi)
[![Edge 附加组件](https://img.shields.io/badge/Edge-%E5%B7%B2%E6%94%AF%E6%8C%81-blue.svg)](https://microsoftedge.microsoft.com/addons/detail/knpkebnhpcbklnknkcpgkiochlimhcoi)
[![Firefox 附加组件](https://img.shields.io/amo/v/cloudleaf?label=Firefox)](https://addons.mozilla.org/zh-CN/firefox/addon/cloudleaf/)
![Chrome Web Store Size](https://img.shields.io/chrome-web-store/size/knpkebnhpcbklnknkcpgkiochlimhcoi)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[![Plasmo](https://img.shields.io/badge/Built%20with-Plasmo-blue)](https://docs.plasmo.com/)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/ccf2c7a6d3c44c16b90100c80e8f7ba7)](https://app.codacy.com/gh/CloudLeaf-Studio/CloudLeaf/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

[English](README.md) | [中文](README_zh.md)

</div>

---

## 功能特性

- **多浏览器支持** - 全面支持 Chrome、Edge 和 Firefox
- **上传到 GitHub Gist** - 将书签同步到私有 Gist
- **通过 WebDAV 上传** - 同步书签到任何支持 WebDAV 的云盘（坚果云等）
- **导出到本地文件** - 将书签下载为 JSON 文件
- **从云端/本地导入** - 从 Gist、WebDAV 或本地文件恢复书签
- **自动书签同步** - 手动上传或下载成功后启用自动同步，后续自动同步书签变更；发生冲突时需要手动处理（[使用指南](https://cloudleaf.yingluan.cc/zh-cn/guides/usage)）
- **冲突检测** - 云端较新时阻止意外覆盖
- **预览模式** - 导入前查看云端书签

## 快速开始

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev          # Chrome
npm run dev:edge     # Microsoft Edge
npm run dev:firefox  # Firefox

# 构建生产版本
npm run build          # Chrome
npm run build:edge     # Microsoft Edge
npm run build:firefox  # Firefox

# 打包发布文件
npm run package          # Chrome
npm run package:edge     # Microsoft Edge
npm run package:firefox  # Firefox
```

## 支持的云服务

| 服务商        | 协议     | 状态   |
| ------------- | -------- | ------ |
| GitHub Gist   | REST API | 已支持 |
| 坚果云        | WebDAV   | 已支持 |
| 自定义 WebDAV | WebDAV   | 已支持 |

## 配置说明

### GitHub Gist 配置

1. 创建 GitHub [个人访问令牌](https://github.com/settings/tokens)，勾选 `gist` 权限
2. 创建一个新的 Gist（可以是私有的）
3. 在扩展设置中输入令牌和 Gist ID

### 坚果云 WebDAV 配置

1. 进入坚果云 → 账户信息 → 安全选项 → 第三方应用管理
2. 添加应用获取**应用密码**（不是登录密码）
3. 在扩展设置中输入邮箱和应用密码
