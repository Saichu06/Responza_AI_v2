import { useState } from "react";

// Import your video files - MAKE SURE THESE PATHS ARE CORRECT
import earthquakeVideo from "/earthquake.mp4";
import floodVideo from "/tsunami.mp4";
import stormVideo from "/storm.mp4";

const VIDEOS = [
  {
    id: "earthquake",
    title: "Earthquake Response",
    description: "Seismic detection & AI-guided evacuation routing",
    videoSrc: earthquakeVideo,
    severity: "Critical",
    color: "#ef4444",
  },
  {
    id: "flood",
    title: "Flood Monitoring",
    description: "Water surge tracking & automated resource dispatch",
    videoSrc: floodVideo,
    severity: "High",
    color: "#f97316",
  },
  {
    id: "storm",
    title: "Storm Detection",
    description: "Real-time storm tracking & predictive path analysis",
    videoSrc: stormVideo,
    severity: "High",
    color: "#f97316",
  },
];

export default function VideoSection() {
  const [hovered, setHovered] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [videoErrors, setVideoErrors] = useState({});

  const handleVideoError = (videoId) => {
    setVideoErrors(prev => ({ ...prev, [videoId]: true }));
  };

  return (
    <section style={{ background: "#0b1220", padding: "80px 60px", position: "relative", overflow: "hidden" }}>
      {/* Shooting Flow Animation Line */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}>
        <div style={{
          width: "4px",
          height: "4px",
          background: "#22c55e",
          borderRadius: "50%",
          position: "absolute",
          top: "20%",
          left: "-10%",
          animation: "flowHorizontal 8s linear infinite",
          boxShadow: "0 0 10px #22c55e",
        }} />
        <div style={{
          width: "3px",
          height: "3px",
          background: "#3b82f6",
          borderRadius: "50%",
          position: "absolute",
          top: "60%",
          left: "-10%",
          animation: "flowHorizontal 12s linear infinite 2s",
          boxShadow: "0 0 8px #3b82f6",
        }} />
        <div style={{
          width: "5px",
          height: "5px",
          background: "#ef4444",
          borderRadius: "50%",
          position: "absolute",
          top: "40%",
          left: "-10%",
          animation: "flowHorizontal 10s linear infinite 4s",
          boxShadow: "0 0 12px #ef4444",
        }} />
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <div style={{
            display: "inline-block",
            background: "rgba(34,197,94,0.1)",
            color: "#22c55e",
            fontSize: "12px",
            fontWeight: "500",
            padding: "6px 12px",
            borderRadius: "6px",
            marginBottom: "16px",
            fontFamily: "'Inter', sans-serif",
          }}>
            CASE STUDIES
          </div>
          <h2 style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "32px",
            fontWeight: "700",
            letterSpacing: "-0.5px",
            color: "#e5e7eb",
            marginBottom: "12px",
          }}>
            Disaster Response in Action
          </h2>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            color: "#9ca3af",
            maxWidth: "480px",
            margin: "0 auto",
          }}>
            Real-time AI responses across multiple disaster scenarios
          </p>
        </div>
        
        {/* Video Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "32px",
        }}>
          {VIDEOS.map((video, index) => (
            <div
              key={video.id}
              onMouseEnter={() => setHovered(video.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: "#111827",
                border: `1px solid ${hovered === video.id ? video.color : "#1f2937"}`,
                borderRadius: "16px",
                overflow: "hidden",
                transition: "all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
                transform: hovered === video.id ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                boxShadow: hovered === video.id
                  ? `0 20px 40px -12px ${video.color}60, 0 0 0 1px ${video.color}30`
                  : "0 10px 30px rgba(0,0,0,0.3)",
                animation: `fadeUp 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards`,
                animationDelay: `${index * 0.15}s`,
                opacity: 0,
                cursor: "pointer",
              }}>
              {/* Video Player */}
              <div style={{
                position: "relative",
                aspectRatio: "16/9",
                background: "#000000",
                overflow: "hidden",
              }}>
                {!videoErrors[video.id] ? (
                  <video
                    src={video.videoSrc}
                    muted
                    loop
                    autoPlay
                    playsInline
                    onError={() => handleVideoError(video.id)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: hovered === video.id ? "brightness(1)" : "brightness(0.7)",
                      transform: hovered === video.id ? "scale(1.05)" : "scale(1)",
                      transition: "filter 0.4s ease, transform 0.6s ease",
                    }}
                  />
                ) : (
                  <div style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, #1f2937, #111827)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "12px",
                  }}>
                    <span style={{ fontSize: "48px" }}>
                      {video.id === "earthquake" && "🌋"}
                      {video.id === "flood" && "🌊"}
                      {video.id === "storm" && "⛈️"}
                    </span>
                    <span style={{ color: "#6b7280", fontSize: "12px", fontFamily: "'Inter', sans-serif" }}>
                      Preview coming soon
                    </span>
                  </div>
                )}
                
                {/* Play Button Overlay - Only shows on hover */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!videoErrors[video.id]) {
                      setPlayingVideo(playingVideo === video.id ? null : video.id);
                    }
                  }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "56px",
                    height: "56px",
                    background: hovered === video.id ? video.color : "rgba(0,0,0,0.6)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: !videoErrors[video.id] ? "pointer" : "default",
                    transition: "all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)",
                    opacity: hovered === video.id ? 1 : 0,
                    backdropFilter: "blur(4px)",
                  }}
                  onMouseEnter={(e) => {
                    if (!videoErrors[video.id]) {
                      e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.15)";
                      e.currentTarget.style.boxShadow = `0 0 20px ${video.color}`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}>
                  {playingVideo === video.id ? (
                    <span style={{ fontSize: "24px" }}>⏸</span>
                  ) : (
                    <div style={{
                      width: 0,
                      height: 0,
                      borderTop: "10px solid transparent",
                      borderLeft: "16px solid white",
                      borderBottom: "10px solid transparent",
                      marginLeft: "4px",
                    }} />
                  )}
                </div>

                {/* Severity Badge */}
                <div style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: video.color,
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: "600",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontFamily: "'Inter', sans-serif",
                  zIndex: 2,
                  boxShadow: `0 0 10px ${video.color}80`,
                }}>
                  {video.severity}
                </div>

                {/* Pulse Ring on Hover */}
                {hovered === video.id && !videoErrors[video.id] && (
                  <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "100%",
                    height: "100%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    animation: "pulse 1.5s infinite",
                    pointerEvents: "none",
                  }} />
                )}
              </div>
              
              {/* Content */}
              <div style={{ padding: "20px" }}>
                <h3 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: hovered === video.id ? video.color : "#e5e7eb",
                  marginBottom: "8px",
                  transition: "color 0.3s ease",
                }}>
                  {video.title}
                </h3>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  color: "#9ca3af",
                  lineHeight: "1.5",
                  marginBottom: "16px",
                }}>
                  {video.description}
                </p>
                <button 
                  onClick={() => {
                    if (!videoErrors[video.id]) {
                      setPlayingVideo(playingVideo === video.id ? null : video.id);
                    }
                  }}
                  disabled={videoErrors[video.id]}
                  style={{
                    background: "transparent",
                    color: video.color,
                    border: `1px solid ${video.color}`,
                    borderRadius: "8px",
                    padding: "8px 20px",
                    fontSize: "13px",
                    fontWeight: "500",
                    fontFamily: "'Inter', sans-serif",
                    cursor: !videoErrors[video.id] ? "pointer" : "not-allowed",
                    transition: "all 0.3s ease",
                    opacity: videoErrors[video.id] ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!videoErrors[video.id]) {
                      e.currentTarget.style.background = video.color;
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!videoErrors[video.id]) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = video.color;
                      e.currentTarget.style.transform = "translateY(0)";
                    }
                  }}>
                  {playingVideo === video.id ? "Pause Video" : "Watch Case Study"} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        
        @keyframes flowHorizontal {
          0% {
            transform: translateX(-100px) translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100vw + 100px)) translateY(20px);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}