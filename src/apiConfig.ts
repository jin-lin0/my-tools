import {
  SILICONFLOW_API_KEY,
  SILICONFLOW_API_URL,
  OPENROUTER_API_KEY,
  OPENROUTER_API_URL,
} from "./config";

export interface ApiProviderConfig {
  name: string;
  apiUrl: string;
  apiKey: string;
  defaultModel: string;
}

export const apiProviders: Record<string, ApiProviderConfig> = {
  openrouter: {
    name: "OPENROUTER",
    apiUrl: OPENROUTER_API_URL,
    apiKey: OPENROUTER_API_KEY,
    defaultModel: "deepseek/deepseek-chat-v3-0324:free",
  },
  siliconflow: {
    name: "SILICONFLOW",
    apiUrl: SILICONFLOW_API_URL,
    apiKey: SILICONFLOW_API_KEY,
    defaultModel: "deepseek-ai/DeepSeek-V3",
  },
};

export const DEFAULT_PROVIDER = "openrouter";
