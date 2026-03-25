"use client";

import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <div className="noise-overlay" />

      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.3) 50%, rgba(10,10,10,0.7) 100%)",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          boxShadow: "inset 0 0 200px rgba(10, 10, 10, 0.8)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 10 }}>
        <Navbar transparent />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, var(--gold-dark), transparent)",
          zIndex: 10,
        }}
      />
    </div>
  );
}