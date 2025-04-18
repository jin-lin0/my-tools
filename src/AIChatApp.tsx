import React, { useState, useEffect } from "react";
import "./AIChatApp.css";
import { fetchDeepSeekAPI } from "./apiService";
import { apiProviders, DEFAULT_PROVIDER } from "./apiConfig";
import ReactMarkdown from "react-markdown";
import BackButton from "./components/BackButton";
import DrapDown from "./components/DrapDown";

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
  const [selectedProvider, setSelectedProvider] = useState(DEFAULT_PROVIDER);

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

      const provider = apiProviders[selectedProvider];
      await fetchDeepSeekAPI(
        inputValue,
        (chunk) => {
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
        },
        provider
      );
    } catch (error) {
      console.error("API请求失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <BackButton onBack={onBack} />
        <h2>AI聊天助手</h2>
        <DrapDown
          options={Object.keys(apiProviders)}
          placeholder="选择API"
          onChange={setSelectedProvider}
          defaultValue="openrouter"
        />
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
          onKeyDown={(e) =>
            !e.nativeEvent.isComposing &&
            e.key === "Enter" &&
            handleSendMessage()
          }
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
