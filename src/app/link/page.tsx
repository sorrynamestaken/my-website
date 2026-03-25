"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function LinkAccount() {
  const [step, setStep] = useState<"form" | "verify" | "done">("form");
  const [discordUsername, setDiscordUsername] = useState("");
  const [minecraftIGN, setMinecraftIGN] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkedIGN, setLinkedIGN] = useState("");

  const skinPreviewUrl = minecraftIGN
    ? `https://crafatar.com/renders/body/${encodeURIComponent(minecraftIGN)}?overlay&scale=6`
    : null;

  const headPreviewUrl = linkedIGN
    ? `https://crafatar.com/avatars/${encodeURIComponent(linkedIGN)}?overlay&size=80`
    : null;

  async function handleRequestCode() {
    if (!discordUsername.trim() || !minecraftIGN.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/link/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordUsername: discordUsername.trim(), minecraftIGN: minecraftIGN.trim() }),
      });

      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;

      if (parsed.status === "success") {
        setMessage(parsed.message);
        setStep("verify");
      } else {
        setError(parsed.message || "Something went wrong.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/link/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discordUsername: discordUsername.trim(), code: code.trim() }),
      });

      const data = await res.json();
      const parsed = typeof data === "string" ? JSON.parse(data) : data;

      if (parsed.status === "success") {
        setMessage(parsed.message);
        setLinkedIGN(parsed.minecraftIGN || minecraftIGN);
        setStep("done");
      } else {
        setError(parsed.message || "Verification failed.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    fontSize: "14px",
    fontFamily: "var(--font-body)",
    color: "var(--white)",
    background: "var(--black-card)",
    border: "1px solid var(--black-border)",
    outline: "none",
    transition: "border-color 0.3s ease",
    letterSpacing: "0.5px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    color: "var(--gold)",
    marginBottom: "8px",
    display: "block",
    fontFamily: "var(--font-body)",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    color: "var(--black)",
    background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
    border: "none",
    cursor: loading ? "wait" : "pointer",
    fontFamily: "var(--font-body)",
    transition: "all 0.3s ease",
    opacity: loading ? 0.6 : 1,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      <div className="noise-overlay" />
      <Navbar />

      <section style={{ padding: "80px 24px", maxWidth: "460px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p
            className="animate-fade-in-up delay-1"
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: "16px",
              fontFamily: "var(--font-body)",
            }}
          >
            Account Link
          </p>
          <h1
            className="animate-fade-in-up delay-2"
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 300,
              fontFamily: "var(--font-display)",
              color: "var(--white)",
              marginBottom: "16px",
            }}
          >
            Link your <span style={{ color: "var(--gold)", fontStyle: "italic", fontWeight: 600 }}>Minecraft</span>
          </h1>
          <div
            className="animate-fade-in delay-3"
            style={{
              width: "60px",
              height: "1px",
              background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
              margin: "0 auto 16px",
            }}
          />
          <p
            className="animate-fade-in-up delay-4"
            style={{
              fontSize: "13px",
              color: "var(--white-muted)",
              fontFamily: "var(--font-body)",
              lineHeight: 1.6,
            }}
          >
            Connect your Discord and Minecraft accounts to show your skin on tournament brackets. You must be online on Purple Prison to receive the verification code.
          </p>
        </div>

        {/* Form Card */}
        <div
          className="animate-fade-in-up delay-5"
          style={{
            background: "var(--black-card)",
            border: "1px solid var(--black-border)",
            padding: "32px",
            position: "relative",
          }}
        >
          {/* Decorative corners */}
          {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => (
            <div
              key={pos}
              style={{
                position: "absolute",
                width: "16px",
                height: "16px",
                [pos.includes("top") ? "top" : "bottom"]: "-1px",
                [pos.includes("left") ? "left" : "right"]: "-1px",
                borderTop: pos.includes("top") ? "2px solid var(--gold)" : "none",
                borderBottom: pos.includes("bottom") ? "2px solid var(--gold)" : "none",
                borderLeft: pos.includes("left") ? "2px solid var(--gold)" : "none",
                borderRight: pos.includes("right") ? "2px solid var(--gold)" : "none",
              }}
            />
          ))}

          {step === "form" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Discord Username</label>
                <input
                  type="text"
                  placeholder="e.g. johnn"
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(197, 165, 90, 0.4)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--black-border)")}
                />
              </div>

              <div>
                <label style={labelStyle}>Minecraft IGN</label>
                <input
                  type="text"
                  placeholder="e.g. Notch"
                  value={minecraftIGN}
                  onChange={(e) => setMinecraftIGN(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(197, 165, 90, 0.4)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--black-border)")}
                />
              </div>

              <button onClick={handleRequestCode} disabled={loading} style={buttonStyle}>
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </div>
          )}

          {step === "verify" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                style={{
                  padding: "12px 16px",
                  background: "rgba(197, 165, 90, 0.06)",
                  border: "1px solid rgba(197, 165, 90, 0.15)",
                  fontSize: "12px",
                  color: "var(--white-dim)",
                  fontFamily: "var(--font-body)",
                  lineHeight: 1.6,
                }}
              >
                Check your Minecraft chat on Purple Prison for a whisper with your 6-digit code.
              </div>

              <div>
                <label style={labelStyle}>Verification Code</label>
                <input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  style={{
                    ...inputStyle,
                    textAlign: "center",
                    fontSize: "24px",
                    letterSpacing: "8px",
                    fontWeight: 600,
                    fontFamily: "var(--font-body)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(197, 165, 90, 0.4)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--black-border)")}
                />
              </div>

              <button onClick={handleVerifyCode} disabled={loading} style={buttonStyle}>
                {loading ? "Verifying..." : "Verify & Link"}
              </button>

              <button
                onClick={() => { setStep("form"); setCode(""); setError(""); setMessage(""); }}
                style={{
                  ...buttonStyle,
                  background: "transparent",
                  color: "var(--white-muted)",
                  border: "1px solid var(--black-border)",
                  fontSize: "11px",
                }}
              >
                Back
              </button>
            </div>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>✅</div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 300,
                  fontFamily: "var(--font-display)",
                  color: "var(--white)",
                  marginBottom: "16px",
                }}
              >
                Account <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Linked</span>
              </h3>

              {headPreviewUrl && (
                <div style={{ marginBottom: "16px" }}>
                  <img
                    src={headPreviewUrl}
                    alt={linkedIGN}
                    style={{
                      borderRadius: "4px",
                      border: "2px solid rgba(197, 165, 90, 0.2)",
                      imageRendering: "pixelated",
                    }}
                  />
                </div>
              )}

              <p style={{ fontSize: "13px", color: "var(--white-dim)", fontFamily: "var(--font-body)", marginBottom: "8px" }}>
                <span style={{ color: "var(--white-muted)" }}>{discordUsername}</span>
                {" → "}
                <span style={{ color: "var(--gold)", fontWeight: 600 }}>{linkedIGN}</span>
              </p>

              <p style={{ fontSize: "11px", color: "var(--white-muted)", fontFamily: "var(--font-body)" }}>
                Your Minecraft skin will now appear on tournament brackets.
              </p>

              <button
                onClick={() => { setStep("form"); setDiscordUsername(""); setMinecraftIGN(""); setCode(""); setLinkedIGN(""); setMessage(""); setError(""); }}
                style={{ ...buttonStyle, marginTop: "24px" }}
              >
                Link Another Account
              </button>
            </div>
          )}

          {/* Error / Success messages */}
          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "10px 14px",
                background: "rgba(196, 92, 92, 0.08)",
                border: "1px solid rgba(196, 92, 92, 0.2)",
                fontSize: "12px",
                color: "#c45c5c",
                fontFamily: "var(--font-body)",
              }}
            >
              {error}
            </div>
          )}
          {message && step === "verify" && (
            <div
              style={{
                marginTop: "16px",
                padding: "10px 14px",
                background: "rgba(197, 165, 90, 0.06)",
                border: "1px solid rgba(197, 165, 90, 0.15)",
                fontSize: "12px",
                color: "var(--gold)",
                fontFamily: "var(--font-body)",
              }}
            >
              {message}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "40px 24px",
          textAlign: "center",
          borderTop: "1px solid var(--black-border)",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            color: "var(--white-muted)",
            letterSpacing: "1px",
            fontFamily: "var(--font-body)",
          }}
        >
          JOHNN &copy; {new Date().getFullYear()} &mdash; Purple Prison Minecraft Tournaments
        </p>
      </footer>
    </div>
  );
}