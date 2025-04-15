import axios from "axios";
import {
  SERVER_API_URL,
  OPENROUTER_API_URL,
  OPENROUTER_API_KEY,
} from "./config";
import { ApiProviderConfig } from "./apiConfig";

const MAX_CONTEXT_LENGTH = 30;
const conversationContext: Array<{ role: string; content: string }> = [];

export const fetchDeepSeekAPI = async (
  message: string,
  onChunk?: (chunk: string) => void,
  {
    apiUrl = OPENROUTER_API_URL,
    apiKey = OPENROUTER_API_KEY,
    defaultModel: model = "deepseek/deepseek-chat-v3-0324:free",
  }: Partial<ApiProviderConfig> = {}
): Promise<void> => {
  let token = localStorage.getItem("apiKey_token") || apiKey;
  if (!token) throw new Error("未设置API Token");

  let answer = "";

  try {
    // 更新上下文消息
    conversationContext.push({ role: "user", content: message });

    // 只保留最近的MAX_CONTEXT_LENGTH条消息
    while (conversationContext.length > MAX_CONTEXT_LENGTH) {
      conversationContext.shift();
    }

    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: model,
        messages: conversationContext,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.body) throw new Error("服务器未返回流数据");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        if (line.startsWith("data:")) {
          const jsonStr = line.replace("data: ", "").trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content || "";
            if (content && onChunk) {
              answer += content;
              onChunk(content);
            }
          } catch (error) {
            console.error("解析流数据错误:", error);
          }
        }
      }
    }

    // 添加AI回复到上下文
    conversationContext.push({ role: "assistant", content: answer });

    await saveMessageToServer(message, answer, model);
  } catch (error) {
    console.error("API请求错误:", error);
    throw error;
  }
};

const saveMessageToServer = async (
  question: string,
  answer: string,
  model: string
) => {
  try {
    await axios.post(`${SERVER_API_URL}/messages`, {
      question,
      answer,
      model: model,
    });
  } catch (error) {
    console.error("保存消息到服务器失败:", error);
  }
};
