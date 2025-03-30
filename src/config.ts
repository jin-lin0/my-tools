// 配置文件，用于存储API密钥等敏感信息
// 请将此文件添加到.gitignore中

export const SILICONFLOW_API_KEY =
  import.meta.env.VITE_SILICONFLOW_API_KEY || "";
export const SILICONFLOW_API_URL =
  import.meta.env.VITE_SILICONFLOW_API_URL || "https://api.siliconflow.cn";
export const SERVER_API_URL =
  import.meta.env.VITE_SERVER_API_URL || "https://server.020201.xyz";
