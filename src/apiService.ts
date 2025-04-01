import axios from "axios";
import {
  SILICONFLOW_API_KEY,
  SILICONFLOW_API_URL,
  SERVER_API_URL,
} from "./config";

const MAX_CONTEXT_LENGTH = 10;
const conversationContext: Array<{ role: string; content: string }> = [];

export const fetchDeepSeekAPI = async (
  message: string,
  onChunk?: (chunk: string) => void
): Promise<void> => {
  let token = localStorage.getItem("deepseek_token") || SILICONFLOW_API_KEY;
  if (!token) throw new Error("未设置DeepSeek API Token");

  let answer = "";

  try {
    // 更新上下文消息
    conversationContext.push({ role: "user", content: message });

    // 只保留最近的MAX_CONTEXT_LENGTH条消息
    while (conversationContext.length > MAX_CONTEXT_LENGTH) {
      conversationContext.shift();
    }

    const response = await fetch(`${SILICONFLOW_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3",
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

    await saveMessageToServer(message, answer);
  } catch (error) {
    console.error("API请求错误:", error);
    throw error;
  }
};

const saveMessageToServer = async (question: string, answer: string) => {
  try {
    await axios.post(`${SERVER_API_URL}/messages`, {
      question,
      answer,
      model: "deepseek-ai/DeepSeek-V3",
    });
  } catch (error) {
    console.error("保存消息到服务器失败:", error);
  }
};
