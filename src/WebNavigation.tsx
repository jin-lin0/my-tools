import React, { useRef, useState, useEffect } from "react";
import "./WebNavigation.css";
import defaultWebsitesData from "./WebNavigation.json";
import websitesDataExample from "./WebNavigationManual.json";
import BackButton from "./components/BackButton";
import Modal from "./components/Modal";

interface Website {
  id: string | number;
  name: string;
  url: string;
  description: string;
  category: string;
  icon: string;
}

interface WebNavigationProps {
  onBack: () => void;
}

// 导入说明内容组件的Props接口
interface ImportInstructionsProps {
  onCopyJson: () => void;
  onDownloadJson: () => void;
}

// 导入说明内容组件
const ImportInstructions: React.FC<ImportInstructionsProps> = ({
  onCopyJson,
  onDownloadJson,
}) => {
  return (
    <>
      <h2>使用说明</h2>
      <ol>
        <li>点击网站导航页面上的「导入导航」按钮</li>
        <li>选择符合格式要求的JSON文件</li>
        <li>导入成功后，页面将显示您的自定义导航</li>
        <li>您的自定义导航将保存在浏览器的localStorage中</li>
        <li>下次访问网站时将自动加载您的自定义导航</li>
        <li>如需恢复默认导航，点击「重置默认」按钮</li>
      </ol>

      <h2>JSON格式要求</h2>
      <p>导入的JSON文件必须是一个数组，每个元素包含以下字段：</p>
      <ul>
        <li>
          <code>id</code>: 唯一标识符（数字或字符串）
        </li>
        <li>
          <code>name</code>: 网站名称
        </li>
        <li>
          <code>url</code>: 网站链接
        </li>
        <li>
          <code>category</code>: 分类名称
        </li>
        <li>
          <code>description</code>: 网站描述
        </li>
        <li>
          <code>icon</code>: 图标（可以是emoji）
        </li>
      </ul>

      <h2>示例JSON</h2>
      <pre id="example-json">
        {JSON.stringify(websitesDataExample, null, 2)}
      </pre>

      <div className="modal-buttons">
        <button className="btn" onClick={onCopyJson}>
          复制示例JSON
        </button>
        <button className="btn" onClick={onDownloadJson}>
          下载示例JSON
        </button>
      </div>
    </>
  );
};

const WebNavigation: React.FC<WebNavigationProps> = ({ onBack }) => {
  const [isNavVisible, setIsNavVisible] = useState(
    localStorage.getItem("isNavVisible") === "true"
  );

  // 模态框状态
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 使用localStorage中的数据或默认数据
  const [websites, setWebsites] = useState<Website[]>([]);
  const [importError, setImportError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 从localStorage加载数据或使用默认数据
  useEffect(() => {
    const savedData = localStorage.getItem("customWebNavigation");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setWebsites(parsedData);
      } catch (error) {
        console.error("无法解析保存的导航数据", error);
        setWebsites(defaultWebsitesData);
      }
    } else {
      setWebsites(defaultWebsitesData);
    }
  }, []);

  const categories = [...new Set(websites.map((site) => site.category))];

  const scrollToCategory = (category: string) => {
    categoryRefs.current[category]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="web-navigation-container">
      <BackButton position="top-right" onBack={onBack} />
      <div className={`category-nav ${isNavVisible ? "" : "collapsed"}`}>
        <button
          key={`nav-toggle`}
          className="category-nav-item nav-toggle-button"
          onClick={() => {
            const newValue = !isNavVisible;
            setIsNavVisible(newValue);
            localStorage.setItem("isNavVisible", String(newValue));
          }}
        >
          {isNavVisible ? "←" : "☰"}
        </button>
        <button
          key={`nav-import-manual`}
          className="category-nav-item nav-highlight-button"
          onClick={() => setIsModalOpen(true)}
        >
          导入说明
        </button>
        {categories.map((category) => (
          <button
            key={`nav-${category}`}
            onClick={() => scrollToCategory(category)}
            className="category-nav-item"
          >
            {category}
          </button>
        ))}
      </div>
      <div
        className={`web-navigation ${
          isNavVisible ? "web-navigation-expanded" : "web-navigation-collapsed"
        }`}
      >
        <div className="web-navigation-header">
          <h1>网站导航</h1>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const jsonData = JSON.parse(event.target?.result as string);
                    // 验证JSON格式是否正确
                    if (
                      Array.isArray(jsonData) &&
                      jsonData.length > 0 &&
                      jsonData[0].name &&
                      jsonData[0].url &&
                      jsonData[0].category
                    ) {
                      setWebsites(jsonData);
                      localStorage.setItem(
                        "customWebNavigation",
                        JSON.stringify(jsonData)
                      );
                      setImportError("");
                    } else {
                      setImportError(
                        "JSON格式不正确，请确保包含name、url和category字段"
                      );
                    }
                  } catch (error) {
                    console.error("导入JSON出错", error);
                    setImportError("导入失败，请检查JSON格式");
                  }
                };
                reader.readAsText(file);
              }
            }}
          />
          <button
            className="import-button"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
                fileInputRef.current.click();
              }
            }}
          >
            导入导航
          </button>
          <button
            className="reset-button"
            onClick={() => {
              if (confirm("确定要重置为默认导航吗？")) {
                localStorage.removeItem("customWebNavigation");
                setWebsites(defaultWebsitesData);
                setImportError("");
              }
            }}
          >
            重置默认
          </button>
        </div>
        {importError && <div className="import-error">{importError}</div>}
        {categories.map((category) => (
          <div
            key={category}
            className="category-section"
            ref={(el: HTMLDivElement | null) => {
              if (el) {
                categoryRefs.current[category] = el;
              }
            }}
          >
            <h2>{category}</h2>
            <div className="websites-grid">
              {websites
                .filter((site) => site.category === category)
                .map((site) => (
                  <a
                    key={site.id}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="website-card"
                  >
                    <div className="website-icon">{site.icon}</div>
                    <div className="website-info">
                      <h3>{site.name}</h3>
                      <p>{site.description}</p>
                    </div>
                  </a>
                ))}
            </div>
          </div>
        ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="网站导航 - 自定义导入功能"
      >
        <ImportInstructions
          onCopyJson={() => {
            const exampleJson =
              document.getElementById("example-json")?.textContent;
            if (exampleJson) {
              navigator.clipboard
                .writeText(exampleJson)
                .then(() => alert("示例JSON已复制到剪贴板"))
                .catch((err) => console.error("复制失败:", err));
            }
          }}
          onDownloadJson={() => {
            const exampleJson =
              document.getElementById("example-json")?.textContent;
            if (exampleJson) {
              const blob = new Blob([exampleJson], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "example-navigation.json";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default WebNavigation;
