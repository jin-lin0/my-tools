import "./Loading.css";

export default function Loading() {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
      <div className="loading-text">加载中...</div>
    </div>
  );
}
