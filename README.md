# 个人工具箱项目

## 项目概述

这是一个基于React的个人工具箱应用，包含AI聊天助手、三维物理沙盒、网站导航功能。项目使用Vite构建，提供了简洁的用户界面和良好的交互体验。

## 功能特点

- **AI聊天助手**：集成DeepSeek API的智能聊天功能，标题栏可选提供源：openrouter/siliconflow
- **三维物理沙盒**：简易3D物理模拟环境，可拖拽、生成物体
- **网站导航**：可导入JSON自定义导航内容
- 响应式设计：适配不同屏幕尺寸
- 简洁UI：直观易用的界面设计

## 技术栈

- React
- TypeScript
- Vite

## 配置说明

1. 创建 `.env.local` 文件用于存储敏感信息（如API密钥）
2. 请务必将此文件添加到 `.gitignore` 中（项目中已添加）
3. 示例配置内容：

```
# .env.local
VITE_SILICONFLOW_API_KEY=your_api_key_here
VITE_SILICONFLOW_API_URL=https://api.siliconflow.cn
VITE_SERVER_API_URL=https://server.020201.xyz
```

## 使用说明

1. 克隆项目
2. 安装依赖：`npm install`
3. 运行开发服务器：`npm run dev`
4. 在浏览器中访问 `http://localhost:5173`
