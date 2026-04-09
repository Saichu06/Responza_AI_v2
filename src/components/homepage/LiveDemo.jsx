// src/components/LiveDemo.jsx
import { useState, useRef, useEffect } from "react";

const css = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.demo-video-container {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}
.demo-video {
  width: 100%;
  height: auto;
  display: block;
}
.play-button-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(0,255,136,0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}
.play-button-overlay:hover {
  transform: translate(-50%, -50%) scale(1.1);
  background: #00ff88;
  box-shadow: 0 0 30px rgba(0,255,136,0.5);
}
`;

export default function LiveDemo({ setPage }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  // ✅ REPLACE THIS URL WITH YOUR CLOUDINARY URL
  const DEMO_VIDEO_URL = "https://res.cloudinary.com/dur7ndvl2/video/upload/v1775762240/demo-video_tbzjmt.mp4";

  // Example Cloudinary URL format:
  // const DEMO_VIDEO_URL = "https://res.cloudinary.com/demo/video/upload/sample.mp4";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div style={{ 
      background: "#060d1a", 
      minHeight: "calc(100vh - 60px)",
      padding: "40px 60px"
    }}>
      <style>{css}</style>
      
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto",
        animation: "fadeIn 0.5s ease"
      }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "36px",
            fontWeight: "700",
            color: "#e8f0fe",
            marginBottom: "12px",
            letterSpacing: "-1px"
          }}>
            Live Demo
          </h1>
          <p style={{
            fontSize: "16px",
            color: "#4a6080",
            lineHeight: "1.6"
          }}>
            Watch RESPONZA AI in action — real-time disaster response intelligence
          </p>
        </div>

        <div className="demo-video-container" style={{ marginBottom: "32px" }}>
          {!isPlaying && !videoError && (
            <div className="play-button-overlay" onClick={handlePlayVideo}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="black">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
          <video
            ref={videoRef}
            className="demo-video"
            src={DEMO_VIDEO_URL}
            controls={isPlaying}
            onEnded={handleVideoEnd}
            onError={() => setVideoError(true)}
            style={{
              width: "100%",
              borderRadius: "16px",
              cursor: isPlaying ? "default" : "pointer"
            }}
          />
        </div>

        {videoError && (
          <div style={{
            background: "rgba(255,59,92,0.1)",
            border: "1px solid rgba(255,59,92,0.3)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
            marginBottom: "32px"
          }}>
            <span style={{ fontSize: "48px", display: "block", marginBottom: "12px" }}>🎬</span>
            <h3 style={{ color: "#ff3b5c", marginBottom: "8px" }}>Video Not Found</h3>
            <p style={{ color: "#4a6080" }}>
              Please check your Cloudinary URL. Current URL: <code style={{ background: "#1a2d4a", padding: "2px 6px", borderRadius: "4px", wordBreak: "break-all" }}>{DEMO_VIDEO_URL}</code>
            </p>
            <button
              onClick={() => setPage("home")}
              style={{
                marginTop: "16px",
                background: "#00ff88",
                border: "none",
                borderRadius: "8px",
                padding: "8px 20px",
                color: "#000",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Back to Home
            </button>
          </div>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          marginTop: "32px"
        }}>
          {[
            { icon: "🚨", title: "Real-Time Alerts", desc: "See how our system detects and classifies incidents in sub-second time" },
            { icon: "🧠", title: "AI Decision Engine", desc: "Watch AI analyze situations and recommend optimal response actions" },
            { icon: "📍", title: "Live Map Integration", desc: "Interactive map showing active incidents and resource allocation" }
          ].map((item, i) => (
            <div key={i} style={{
              background: "#0c1628",
              border: "1px solid #1a2d4a",
              borderRadius: "12px",
              padding: "20px",
              transition: "all 0.3s ease",
              animation: `fadeIn 0.5s ease ${0.1 * i}s both`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = "#00ff88";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "#1a2d4a";
            }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>{item.icon}</div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#e8f0fe", marginBottom: "8px" }}>{item.title}</h3>
              <p style={{ fontSize: "13px", color: "#4a6080", lineHeight: "1.5" }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "48px", textAlign: "center" }}>
          <button
            onClick={() => setPage("home")}
            style={{
              background: "transparent",
              border: "1px solid #1a2d4a",
              borderRadius: "10px",
              padding: "10px 24px",
              color: "#4a6080",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "'Space Grotesk', sans-serif"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#00ff88";
              e.currentTarget.style.color = "#00ff88";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#1a2d4a";
              e.currentTarget.style.color = "#4a6080";
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}