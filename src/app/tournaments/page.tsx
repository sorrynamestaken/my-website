"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect, useCallback, useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const POLL_INTERVAL = 3000;

// --- TYPES ---
interface Match {
  team1: string;
  team2: string;
}

interface CompletedMatch {
  winner: string;
  loser: string;
  bracket: string;
  timestamp: string;
}

interface BracketState {
  active: boolean;
  timestamp: number;
  winnersMatches: Match[];
  winnersPending: string[];
  losersMatches: Match[];
  losersPending: string[];
  grandFinalsActive: boolean;
  grandFinalsWinnersSide: string | null;
  grandFinalsLosersSide: string | null;
  grandFinalsReset: boolean;
  tournamentWinner: string | null;
  completedMatches: CompletedMatch[];
}

interface TeamRosters {
  [teamName: string]: string[];
}

interface IGNLinks {
  [discordName: string]: string;
}

// --- HELPER: Get Minecraft head URL from team name ---
// Team names are like "PlayerName's Team", so we strip "'s Team" and look up the IGN
function getHeadUrl(teamName: string, ignLinks: IGNLinks): string | null {
  const cleanName = teamName.replace(/'s Team$/i, "").trim();
  
  // Check if cleanName is a key (Discord username)
  const ign = ignLinks[cleanName.toLowerCase()];
  if (ign) {
    return `https://mc-heads.net/avatar/${ign}/32`;
  }
  
  // Check if cleanName IS already an IGN (value in the links)
  const isIGN = Object.values(ignLinks).some(
    (v) => v.toLowerCase() === cleanName.toLowerCase()
  );
  if (isIGN) {
    return `https://mc-heads.net/avatar/${cleanName}/32`;
  }
  
  return null;
}

function getBodyUrl(ign: string): string {
  return `https://mc-heads.net/body/${ign}/120`;
}

// --- MINECRAFT HEAD COMPONENT ---
function McHead({ teamName, ignLinks, size = 24 }: { teamName: string; ignLinks: IGNLinks; size?: number }) {
  const url = getHeadUrl(teamName, ignLinks);
  const [errored, setErrored] = useState(false);

  if (!url || errored) {
    // Fallback diamond icon
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "2px",
          background: "var(--gold-dim)",
          border: "1px solid rgba(197, 165, 90, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: `${size * 0.35}px`,
            height: `${size * 0.35}px`,
            background: "var(--gold)",
            borderRadius: "1px",
            transform: "rotate(45deg)",
            opacity: 0.4,
          }}
        />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      onError={() => setErrored(true)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "2px",
        imageRendering: "pixelated",
        border: "1px solid rgba(197, 165, 90, 0.15)",
        flexShrink: 0,
      }}
    />
  );
}

// --- BRACKET LINE CONNECTOR ---
function BracketConnector({ fromId, toId, color }: { fromId: string; toId: string; color: string }) {
  const [path, setPath] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const updatePath = () => {
      const fromEl = document.getElementById(fromId);
      const toEl = document.getElementById(toId);
      const svg = svgRef.current;
      if (!fromEl || !toEl || !svg) return;

      const svgRect = svg.getBoundingClientRect();
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      const x1 = fromRect.right - svgRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - svgRect.top;
      const x2 = toRect.left - svgRect.left;
      const y2 = toRect.top + toRect.height / 2 - svgRect.top;

      const midX = (x1 + x2) / 2;
      setPath(`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`);
    };

    updatePath();
    window.addEventListener("resize", updatePath);
    const timeout = setTimeout(updatePath, 100);
    return () => {
      window.removeEventListener("resize", updatePath);
      clearTimeout(timeout);
    };
  }, [fromId, toId]);

  return (
    <svg
      ref={svgRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="6 4"
        opacity="0.4"
      >
        <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.5s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

// --- MATCH CARD ---
function MatchCard({
  id,
  team1,
  team2,
  bracket,
  ignLinks,
  isGrandFinals = false,
  isReset = false,
}: {
  id: string;
  team1: string;
  team2: string;
  bracket: "winners" | "losers" | "grand_finals";
  ignLinks: IGNLinks;
  isGrandFinals?: boolean;
  isReset?: boolean;
}) {
  const colors = {
    winners: "var(--gold)",
    losers: "#c45c5c",
    grand_finals: "var(--gold-light)",
  };
  const accentColor = colors[bracket];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      id={id}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? "rgba(197, 165, 90, 0.3)" : "var(--black-border)"}`,
        borderLeft: `3px solid ${accentColor}`,
        background: hovered ? "rgba(197, 165, 90, 0.03)" : "var(--black-card)",
        padding: "0",
        overflow: "hidden",
        minWidth: "260px",
        maxWidth: "300px",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.4)" : "none",
        position: "relative",
        zIndex: 1,
      }}
    >
      {(isGrandFinals || isReset) && (
        <div
          style={{
            background: "linear-gradient(90deg, rgba(197, 165, 90, 0.1), transparent)",
            padding: "5px 14px",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "var(--gold)",
            borderBottom: "1px solid var(--black-border)",
            fontFamily: "var(--font-body)",
          }}
        >
          {isReset ? "⚡ RESET MATCH" : "🏆 GRAND FINALS"}
        </div>
      )}
      <div style={{ padding: "2px 0" }}>
        <TeamRow name={team1} color={accentColor} ignLinks={ignLinks} tag={isGrandFinals ? "W" : undefined} />
        <div style={{ height: "1px", background: "var(--black-border)", margin: "0 14px" }} />
        <TeamRow name={team2} color={accentColor} ignLinks={ignLinks} tag={isGrandFinals ? "L" : undefined} />
      </div>
    </div>
  );
}

function TeamRow({ name, color, ignLinks, tag }: { name: string; color: string; ignLinks: IGNLinks; tag?: string }) {
  const cleanName = name.replace(/'s Team$/i, "").trim();
    let ign = ignLinks[cleanName.toLowerCase()] || null;
  if (!ign) {
    const isIGN = Object.values(ignLinks).some(
      (v) => v.toLowerCase() === cleanName.toLowerCase()
    );
    if (isIGN) ign = cleanName;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 14px",
        fontSize: "13px",
        fontWeight: 500,
        color: "var(--white)",
        fontFamily: "var(--font-body)",
      }}
    >
      <McHead teamName={name} ignLinks={ignLinks} size={26} />
      <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </div>
        {ign && (
          <div
            style={{
              fontSize: "10px",
              color: "var(--gold)",
              opacity: 0.6,
              letterSpacing: "0.5px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {ign}
          </div>
        )}
      </div>
      {tag && (
        <span
          style={{
            fontSize: "9px",
            fontWeight: 700,
            color: "var(--gold)",
            background: "var(--gold-dim)",
            padding: "2px 6px",
            letterSpacing: "1px",
            fontFamily: "var(--font-body)",
          }}
        >
          {tag}
        </span>
      )}
    </div>
  );
}

function PendingTeam({ name, id, ignLinks }: { name: string; id: string; ignLinks: IGNLinks }) {
  return (
    <div
      id={id}
      style={{
        border: "1px dashed rgba(197, 165, 90, 0.15)",
        padding: "10px 14px",
        fontSize: "13px",
        fontWeight: 400,
        color: "var(--white-muted)",
        fontFamily: "var(--font-body)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        minWidth: "260px",
        maxWidth: "300px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <McHead teamName={name} ignLinks={ignLinks} size={26} />
      {name}
      <span
        style={{
          fontSize: "9px",
          letterSpacing: "1px",
          textTransform: "uppercase" as const,
          opacity: 0.4,
          marginLeft: "auto",
          fontFamily: "var(--font-body)",
        }}
      >
        waiting
      </span>
    </div>
  );
}

function SectionHeader({ title, color, subtitle }: { title: string; color: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "12px", height: "1px", background: color }} />
        <h2
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: color,
            margin: 0,
            fontFamily: "var(--font-body)",
          }}
        >
          {title}
        </h2>
        <div style={{ flex: 1, height: "1px", background: `${color}22` }} />
      </div>
      {subtitle && (
        <p style={{ fontSize: "12px", color: "var(--white-muted)", marginTop: "6px", marginLeft: "24px", fontFamily: "var(--font-body)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function CompletedMatchRow({ match, ignLinks }: { match: CompletedMatch; ignLinks: IGNLinks }) {
  const labels: Record<string, string> = {
    winners: "Winners",
    losers: "Losers",
    grand_finals: "Grand Finals",
    grand_finals_reset: "GF Reset",
  };
  const label = labels[match.bracket] || match.bracket;
  const isGF = match.bracket.includes("grand");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 0",
        fontSize: "12px",
        fontFamily: "var(--font-body)",
        color: "var(--white-muted)",
        borderBottom: "1px solid var(--black-border)",
      }}
    >
      <span
        style={{
          fontSize: "9px",
          fontWeight: 600,
          color: isGF ? "var(--gold)" : "var(--white-muted)",
          background: isGF ? "var(--gold-dim)" : "rgba(255,255,255,0.03)",
          padding: "3px 8px",
          letterSpacing: "1px",
          minWidth: "80px",
          textAlign: "center",
          fontFamily: "var(--font-body)",
          textTransform: "uppercase" as const,
        }}
      >
        {label}
      </span>
      <McHead teamName={match.winner} ignLinks={ignLinks} size={20} />
      <span style={{ color: "var(--gold)", fontWeight: 600 }}>{match.winner}</span>
      <span style={{ color: "var(--white-muted)", fontSize: "10px", fontStyle: "italic" }}>def.</span>
      <McHead teamName={match.loser} ignLinks={ignLinks} size={20} />
      <span style={{ color: "var(--white-muted)" }}>{match.loser}</span>
    </div>
  );
}

function WinnerBanner({ winner, rosters, ignLinks }: { winner: string; rosters: TeamRosters; ignLinks: IGNLinks }) {
  const roster = rosters[winner] || [];
  const cleanName = winner.replace(/'s Team$/i, "").trim();
  const ign = ignLinks[cleanName.toLowerCase()];

  return (
    <div
      className="animate-fade-in-up delay-1"
      style={{
        textAlign: "center",
        padding: "60px 24px",
        background: "radial-gradient(ellipse at center, rgba(197, 165, 90, 0.06) 0%, transparent 70%)",
        border: "1px solid rgba(197, 165, 90, 0.1)",
        marginBottom: "48px",
        position: "relative",
      }}
    >
      {/* Decorative corners */}
      {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => (
        <div
          key={pos}
          style={{
            position: "absolute",
            width: "20px",
            height: "20px",
            [pos.includes("top") ? "top" : "bottom"]: "-1px",
            [pos.includes("left") ? "left" : "right"]: "-1px",
            borderTop: pos.includes("top") ? "2px solid var(--gold)" : "none",
            borderBottom: pos.includes("bottom") ? "2px solid var(--gold)" : "none",
            borderLeft: pos.includes("left") ? "2px solid var(--gold)" : "none",
            borderRight: pos.includes("right") ? "2px solid var(--gold)" : "none",
          }}
        />
      ))}

      {/* Show winner's Minecraft body render if linked */}
      {ign ? (
        <img
          src={getBodyUrl(ign)}
          alt={winner}
          style={{
            height: "120px",
            width: "auto",
            imageRendering: "pixelated",
            marginBottom: "16px",
            filter: "drop-shadow(0 0 20px rgba(197, 165, 90, 0.3))",
          }}
        />
      ) : (
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏆</div>
      )}

      <div
        style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "4px",
          textTransform: "uppercase",
          color: "var(--gold)",
          marginBottom: "16px",
          fontFamily: "var(--font-body)",
        }}
      >
        Tournament Champions
      </div>
      <div
        style={{
          fontSize: "clamp(24px, 4vw, 36px)",
          fontWeight: 300,
          color: "var(--white)",
          marginBottom: "24px",
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
        }}
      >
        {winner}
      </div>
      {roster.length > 0 && (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
          {roster.map((player, i) => {
            let playerIGN = ignLinks[player.toLowerCase()];
                    if (!playerIGN) {
                      const isIGN = Object.values(ignLinks).some(
                        (v) => v.toLowerCase() === player.toLowerCase()
                      );
                      if (isIGN) playerIGN = player;
                    }
            return (
              <span
                key={i}
                style={{
                  fontSize: "11px",
                  color: "var(--white-dim)",
                  background: "var(--gold-dim)",
                  border: "1px solid rgba(197, 165, 90, 0.15)",
                  padding: "5px 12px",
                  fontFamily: "var(--font-body)",
                  letterSpacing: "0.5px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {playerIGN && (
                  <img
                    src={`https://mc-heads.net/avatar/${playerIGN}/16`}
                    alt=""
                    style={{ width: "16px", height: "16px", imageRendering: "pixelated", borderRadius: "1px" }}
                  />
                )}
                {player}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusIndicator({ connected }: { connected: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "2px",
        textTransform: "uppercase",
        color: connected ? "var(--gold)" : "#c45c5c",
        fontFamily: "var(--font-body)",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: connected ? "var(--gold)" : "#c45c5c",
          boxShadow: connected ? "0 0 8px var(--gold-glow)" : "none",
          animation: connected ? "pulse-gold 2s ease-in-out infinite" : "none",
        }}
      />
      {connected ? "LIVE" : "OFFLINE"}
    </div>
  );
}

// --- MAIN PAGE ---
export default function Tournaments() {
  const [bracket, setBracket] = useState<BracketState | null>(null);
  const [rosters, setRosters] = useState<TeamRosters>({});
  const [ignLinks, setIgnLinks] = useState<IGNLinks>({});
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [bracketRes, teamsRes, linksRes] = await Promise.all([
        fetch(`${API_URL}/api/bracket`),
        fetch(`${API_URL}/api/teams`),
        fetch(`${API_URL}/api/link/all`),
      ]);
      if (!bracketRes.ok || !teamsRes.ok) throw new Error("API error");
      const bracketData = await bracketRes.json();
      const teamsData = await teamsRes.json();
      const linksData = linksRes.ok ? await linksRes.json() : {};
      setBracket(bracketData);
      setRosters(teamsData);
      setIgnLinks(typeof linksData === "string" ? JSON.parse(linksData) : linksData);
      setConnected(true);
      setError(null);
    } catch {
      setConnected(false);
      setError("Cannot connect to tournament server");
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      <div className="noise-overlay" />
      <Navbar />

      {/* Page Header */}
      <section style={{ padding: "60px 24px 40px", textAlign: "center", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "300px",
            background: "radial-gradient(ellipse, rgba(197, 165, 90, 0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "16px" }}>
          <h1
            className="animate-fade-in-up delay-1"
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 300,
              fontFamily: "var(--font-display)",
              color: "var(--white)",
            }}
          >
            <span style={{ color: "var(--gold)", fontStyle: "italic", fontWeight: 600 }}>Live</span> Tournaments
          </h1>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
          <StatusIndicator connected={connected} />
        </div>

        <div
          className="animate-fade-in delay-3"
          style={{
            width: "60px",
            height: "1px",
            background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
            margin: "24px auto 0",
          }}
        />
      </section>

      {/* Content */}
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px 80px", position: "relative" }}>
        {error && !bracket && (
          <div
            className="animate-fade-in-up delay-2"
            style={{
              textAlign: "center",
              padding: "80px 20px",
              color: "var(--white-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "16px", opacity: 0.5 }}>📡</div>
            <p style={{ fontSize: "14px" }}>{error}</p>
            <p style={{ fontSize: "12px", marginTop: "8px", opacity: 0.5 }}>
              Make sure the bot is running with the API server
            </p>
          </div>
        )}

        {bracket && !bracket.active && !bracket.tournamentWinner && (
          <div
            className="animate-fade-in-up delay-2"
            style={{
              textAlign: "center",
              padding: "80px 20px",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "16px", opacity: 0.4 }}>⚔️</div>
            <p style={{ fontSize: "14px", color: "var(--white-muted)", fontFamily: "var(--font-body)" }}>
              No active tournament
            </p>
            <p style={{ fontSize: "12px", color: "var(--white-muted)", opacity: 0.5, marginTop: "8px", fontFamily: "var(--font-body)" }}>
              Use{" "}
              <code
                style={{
                  color: "var(--gold)",
                  background: "var(--gold-dim)",
                  padding: "2px 8px",
                  fontSize: "11px",
                }}
              >
                !startbracket
              </code>{" "}
              in Discord to begin
            </p>
          </div>
        )}

        {bracket?.tournamentWinner && <WinnerBanner winner={bracket.tournamentWinner} rosters={rosters} ignLinks={ignLinks} />}

        {bracket?.active && (
          <div style={{ position: "relative" }}>
            {/* Grand Finals */}
            {bracket.grandFinalsActive && bracket.grandFinalsWinnersSide && bracket.grandFinalsLosersSide && (
              <div className="animate-fade-in-up delay-1" style={{ marginBottom: "48px" }}>
                <SectionHeader title="Grand Finals" color="var(--gold-light)" />
                <MatchCard
                  id="gf-match"
                  team1={bracket.grandFinalsWinnersSide}
                  team2={bracket.grandFinalsLosersSide}
                  bracket="grand_finals"
                  ignLinks={ignLinks}
                  isGrandFinals={!bracket.grandFinalsReset}
                  isReset={bracket.grandFinalsReset}
                />
              </div>
            )}

            {/* Winners Bracket */}
            <div className="animate-fade-in-up delay-2" style={{ marginBottom: "48px" }}>
              <SectionHeader title="Winners Bracket" color="var(--gold)" subtitle="Win to advance, lose to drop" />
              {bracket.winnersMatches.length === 0 && bracket.winnersPending.length === 0 ? (
                <p style={{ color: "var(--white-muted)", fontSize: "12px", fontFamily: "var(--font-body)", fontStyle: "italic", marginLeft: "24px" }}>
                  Complete
                </p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", position: "relative" }}>
                  {bracket.winnersMatches.map((m, i) => (
                    <MatchCard key={`w-${i}`} id={`w-match-${i}`} team1={m.team1} team2={m.team2} bracket="winners" ignLinks={ignLinks} />
                  ))}
                  {bracket.winnersPending.map((t, i) => (
                    <PendingTeam key={`wp-${i}`} id={`wp-${i}`} name={t} ignLinks={ignLinks} />
                  ))}
                </div>
              )}
            </div>

            {/* Losers Bracket */}
            <div className="animate-fade-in-up delay-3" style={{ marginBottom: "48px" }}>
              <SectionHeader title="Losers Bracket" color="#c45c5c" subtitle="Last chance — lose and you're out" />
              {bracket.losersMatches.length === 0 && bracket.losersPending.length === 0 ? (
                <p style={{ color: "var(--white-muted)", fontSize: "12px", fontFamily: "var(--font-body)", fontStyle: "italic", marginLeft: "24px" }}>
                  {bracket.winnersMatches.length > 0 ? "Waiting for results..." : "Complete"}
                </p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", position: "relative" }}>
                  {bracket.losersMatches.map((m, i) => (
                    <MatchCard key={`l-${i}`} id={`l-match-${i}`} team1={m.team1} team2={m.team2} bracket="losers" ignLinks={ignLinks} />
                  ))}
                  {bracket.losersPending.map((t, i) => (
                    <PendingTeam key={`lp-${i}`} id={`lp-${i}`} name={t} ignLinks={ignLinks} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Match History */}
        {bracket?.completedMatches && bracket.completedMatches.length > 0 && (
          <div className="animate-fade-in-up delay-4" style={{ marginTop: "16px" }}>
            <SectionHeader title="Match History" color="var(--white-muted)" />
            <div
              style={{
                background: "var(--black-card)",
                border: "1px solid var(--black-border)",
                padding: "16px 20px",
              }}
            >
              {bracket.completedMatches
                .slice()
                .reverse()
                .map((m, i) => (
                  <CompletedMatchRow key={i} match={m} ignLinks={ignLinks} />
                ))}
            </div>
          </div>
        )}

        {/* Team Rosters */}
        {Object.keys(rosters).length > 0 && (
          <div className="animate-fade-in-up delay-5" style={{ marginTop: "48px" }}>
            <SectionHeader title="Team Rosters" color="var(--white-muted)" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
              {Object.entries(rosters).map(([team, players]) => (
                <div
                  key={team}
                  style={{
                    background: "var(--black-card)",
                    border: "1px solid var(--black-border)",
                    padding: "16px 20px",
                    transition: "border-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(197, 165, 90, 0.15)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--black-border)")}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--gold)",
                      marginBottom: "10px",
                      fontFamily: "var(--font-body)",
                      letterSpacing: "0.5px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <McHead teamName={team} ignLinks={ignLinks} size={22} />
                    {team}
                  </div>
                  {players.map((p, i) => {
                    let playerIGN = ignLinks[p.toLowerCase()];
                    if (!playerIGN) {
                      const isIGN = Object.values(ignLinks).some(
                        (v) => v.toLowerCase() === p.toLowerCase()
                      );
                      if (isIGN) playerIGN = p;
                    }
                    return (
                      <div
                        key={i}
                        style={{
                          fontSize: "12px",
                          color: "var(--white-muted)",
                          padding: "3px 0",
                          fontFamily: "var(--font-body)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {playerIGN && (
                          <img
                            src={`https://mc-heads.net/avatar/${playerIGN}/16`}
                            alt=""
                            style={{ width: "16px", height: "16px", imageRendering: "pixelated", borderRadius: "1px" }}
                          />
                        )}
                        {p}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

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