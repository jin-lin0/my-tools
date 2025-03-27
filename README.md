# 个人工具箱项目

## 项目概述
这是一个基于React的个人工具箱应用，目前主要包含AI聊天助手功能。项目使用Vite构建，提供了简洁的用户界面和良好的交互体验。

## 功能特点
- **AI聊天应用**：集成DeepSeek API的智能聊天功能
- 响应式设计：适配不同屏幕尺寸
- 简洁UI：直观易用的界面设计

## 技术栈
- React
- TypeScript
- Vite
- CSS Modules

## 配置说明
1. 创建 `config.ts` 文件用于存储敏感信息（如API密钥）
2. 请务必将此文件添加到 `.gitignore` 中
3. 示例配置内容：

```typescript
// config.ts
// 请将此文件添加到.gitignore中

export const SILICONFLOW_API_KEY = "your_api_key_here";
export const SILICONFLOW_API_URL = "https://api.siliconflow.cn";
```

## 使用说明
1. 克隆项目
2. 安装依赖：`npm install`
3. 运行开发服务器：`npm run dev`