import React, { useState, useEffect } from "react";
import "./AIChatApp.css";
import { SILICONFLOW_API_KEY, SILICONFLOW_API_URL } from "./config";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

interface AIChatAppProps {
  onBack: () => void;
}

let touchStartTime = 0;

const AIChatApp: React.FC<AIChatAppProps> = ({ onBack }) => {
  useEffect(() => {
    // 自动隐藏地址栏和工具栏
    window.scrollTo(0, 1);

    const handleResize = () => {
      window.scrollTo(0, 1);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const aiMessageId = (Date.now() + 1).toString();
      const initialAiMessage: Message = {
        id: aiMessageId,
        content: "",
        isUser: false,
      };

      setMessages((prev) => [...prev, initialAiMessage]);

      await fetchDeepSeekAPI(inputValue, (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          const aiMessageIndex = updated.findIndex(
            (msg) => msg.id === aiMessageId
          );
          if (aiMessageIndex !== -1) {
            updated[aiMessageIndex] = {
              ...updated[aiMessageIndex],
              content: updated[aiMessageIndex].content + chunk,
            };
          }
          return updated;
        });
      });
    } catch (error) {
      console.error("API请求失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeepSeekAPI = async (
    message: string,
    onChunk?: (chunk: string) => void
  ): Promise<void> => {
    let token = localStorage.getItem("deepseek_token") || "";
    if (!token) {
      token = SILICONFLOW_API_KEY || "";
      if (!token) {
        throw new Error("未设置DeepSeek API Token");
      }
    }
    console.log("token", token);

    try {
      const response = await fetch(`${SILICONFLOW_API_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: "deepseek-ai/DeepSeek-V3",
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          const message = line.replace(/^data: /, "");
          if (message === "[DONE]") {
            return;
          }

          try {
            const parsed = JSON.parse(message);
            if (parsed.choices[0].delta?.content && onChunk) {
              onChunk(parsed.choices[0].delta.content);
            }
          } catch (error) {
            console.error("解析流数据错误:", error);
          }
        }
      }
    } catch (error) {
      console.error("API请求错误:", error);
      throw error;
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <h2>AI聊天助手</h2>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.isUser ? "user" : "ai"}`}
            onContextMenu={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(msg.content);
            }}
            onTouchEnd={(e) => {
              if (e.timeStamp - touchStartTime > 500) {
                navigator.clipboard.writeText(msg.content);
              }
            }}
            onTouchStart={() => {
              touchStartTime = Date.now();
            }}
          >
            {msg.isUser ? (
              msg.content
            ) : (
              //   <TypewriterMessage content={msg.content} />
              <ReactMarkdown>
                {`${String(msg.content)}${
                  !msg.content.endsWith("\n") && isLoading ? "..." : ""
                }`}
              </ReactMarkdown>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="输入消息..."
        />
        <button onClick={handleSendMessage} disabled={isLoading}>
          发送
        </button>
      </div>
    </div>
  );
};

export default AIChatApp;
