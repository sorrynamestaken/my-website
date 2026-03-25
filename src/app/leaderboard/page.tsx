"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const POLL_INTERVAL = 10000;
const PLAYERS_PER_PAGE = 10;

interface Player {
  discord_username: string;
  minecraft_ign: string;
  elo: number;
  wins: number;
  losses: number;
}

interface Match {
  winner_ign: string;
  loser_ign: string;
  winner_elo_before: number;
  loser_elo_before: number;
  elo_change: number;
  played_at: number;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getRankTier(elo: number): { name: string; color: string } {
  if (elo >= 2000) return { name: "CHAMPION", color: "#8b0000" };
  if (elo >= 1600) return { name: "DIAMOND", color: "#60a5fa" };
  if (elo >= 1300) return { name: "GOLD", color: "#c5a55a" };
  if (elo >= 1100) return { name: "SILVER", color: "#94a3b8" };
  return { name: "UNRANKED", color: "#71717a" };
}

function PlayerRow({ player, rank }: { player: Player; rank: number }) {
  const tier = getRankTier(player.elo);
  const totalGames = player.wins + player.losses;
  const winRate = totalGames > 0 ? Math.round((player.wins / totalGames) * 100) : 0;
  const medals = ["🥇", "🥈", "🥉"];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 20px",
        background: hovered ? "rgba(197, 165, 90, 0.03)" : rank <= 3 ? "rgba(197, 165, 90, 0.02)" : "transparent",
        borderBottom: "1px solid var(--black-border)",
        transition: "all 0.3s ease",
        gap: "16px",
      }}
    >
      {/* Rank */}
      <div
        style={{
          width: "40px",
          fontSize: rank <= 3 ? "20px" : "14px",
          fontWeight: 700,
          color: rank <= 3 ? "var(--gold)" : "var(--white-muted)",
          fontFamily: "var(--font-body)",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        {rank <= 3 ? medals[rank - 1] : `#${rank}`}
      </div>

      {/* Minecraft Head */}
      <img
        src={`https://mc-heads.net/avatar/${player.minecraft_ign}/28`}
        alt=""
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "2px",
          imageRendering: "pixelated",
          border: `1px solid ${tier.color}33`,
          flexShrink: 0,
        }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />

      {/* Name + Tier */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--white)",
            fontFamily: "var(--font-body)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {player.minecraft_ign}
        </div>
        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "1.5px",
            color: tier.color,
            fontFamily: "var(--font-body)",
          }}
        >
          {tier.name}
        </div>
      </div>

      {/* Elo */}
      <div
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color: "var(--gold)",
          fontFamily: "var(--font-body)",
          minWidth: "60px",
          textAlign: "right",
        }}
      >
        {player.elo}
      </div>

      {/* W/L */}
      <div
        style={{
          fontSize: "12px",
          color: "var(--white-muted)",
          fontFamily: "var(--font-body)",
          minWidth: "80px",
          textAlign: "right",
        }}
      >
        <span style={{ color: "#4ade80" }}>{player.wins}W</span>
        {" / "}
        <span style={{ color: "#f87171" }}>{player.losses}L</span>
      </div>

      {/* Win Rate */}
      <div
        style={{
          fontSize: "12px",
          fontWeight: 500,
          color: winRate >= 50 ? "#4ade80" : "#f87171",
          fontFamily: "var(--font-body)",
          minWidth: "45px",
          textAlign: "right",
        }}
      >
        {winRate}%
      </div>
    </div>
  );
}

function MatchRow({ match }: { match: Match }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 16px",
        borderBottom: "1px solid var(--black-border)",
        fontSize: "12px",
        fontFamily: "var(--font-body)",
      }}
    >
      <img
        src={`https://mc-heads.net/avatar/${match.winner_ign}/18`}
        alt=""
        style={{ width: "18px", height: "18px", imageRendering: "pixelated", borderRadius: "1px" }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <span style={{ color: "#4ade80", fontWeight: 600 }}>{match.winner_ign}</span>
      <span style={{ color: "var(--white-muted)", fontSize: "10px" }}>beat</span>
      <img
        src={`https://mc-heads.net/avatar/${match.loser_ign}/18`}
        alt=""
        style={{ width: "18px", height: "18px", imageRendering: "pixelated", borderRadius: "1px" }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <span style={{ color: "#f87171" }}>{match.loser_ign}</span>
      <span style={{ color: "var(--gold)", marginLeft: "auto", fontWeight: 500 }}>±{match.elo_change}</span>
      <span style={{ color: "var(--white-muted)", fontSize: "10px", minWidth: "50px", textAlign: "right" }}>
        {timeAgo(match.played_at)}
      </span>
    </div>
  );
}

function PageArrow({ direction, onClick, disabled }: { direction: "left" | "right"; onClick: () => void; disabled: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: disabled ? "transparent" : hovered ? "rgba(197, 165, 90, 0.1)" : "var(--black-card)",
        border: `1px solid ${disabled ? "var(--black-border)" : hovered ? "rgba(197, 165, 90, 0.3)" : "var(--black-border)"}`,
        color: disabled ? "var(--black-border)" : hovered ? "var(--gold)" : "var(--white-muted)",
        cursor: disabled ? "default" : "pointer",
        fontSize: "16px",
        fontFamily: "var(--font-body)",
        transition: "all 0.3s ease",
      }}
    >
      {direction === "left" ? "‹" : "›"}
    </button>
  );
}

export default function Leaderboard() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [connected, setConnected] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  const totalPages = Math.max(1, Math.ceil(allPlayers.length / PLAYERS_PER_PAGE));

  const fetchData = useCallback(async () => {
    try {
      const [lbRes, matchRes] = await Promise.all([
        fetch(`${API_URL}/api/leaderboard?limit=500`),
        fetch(`${API_URL}/api/matches/recent?limit=10`),
      ]);

      if (!lbRes.ok) throw new Error("API error");

      const lbData = await lbRes.json();
      const matchData = matchRes.ok ? await matchRes.json() : [];

      setAllPlayers(typeof lbData === "string" ? JSON.parse(lbData) : lbData);
      setMatches(typeof matchData === "string" ? JSON.parse(matchData) : matchData);
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Get current page of players
  const currentPlayers = allPlayers.slice(page * PLAYERS_PER_PAGE, (page + 1) * PLAYERS_PER_PAGE);

  // Search handler
  function handleSearch() {
    if (!search.trim()) {
      setSearchActive(false);
      setPage(0);
      return;
    }

    const index = allPlayers.findIndex(
      (p) => p.minecraft_ign.toLowerCase() === search.trim().toLowerCase()
    );

    if (index !== -1) {
      const targetPage = Math.floor(index / PLAYERS_PER_PAGE);
      setPage(targetPage);
      setSearchActive(true);
    } else {
      setSearchActive(true);
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  // Check if searched player is on current page
  const searchedIGN = searchActive ? search.trim().toLowerCase() : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      <div className="noise-overlay" />
      <Navbar />

      {/* Header */}
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
          Ranked Duels
        </p>

        <h1
          className="animate-fade-in-up delay-2"
          style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 300,
            fontFamily: "var(--font-display)",
            color: "var(--white)",
          }}
        >
          <span style={{ color: "var(--gold)", fontStyle: "italic", fontWeight: 600 }}>Leaderboard</span>
        </h1>

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
      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Search Bar */}
        <div className="animate-fade-in-up delay-3" style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              gap: "0",
              border: "1px solid var(--black-border)",
              background: "var(--black-card)",
              overflow: "hidden",
            }}
          >
            <input
              type="text"
              placeholder="Search by Minecraft IGN..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!e.target.value.trim()) {
                  setSearchActive(false);
                }
              }}
              onKeyDown={handleSearchKeyDown}
              style={{
                flex: 1,
                padding: "12px 16px",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
                color: "var(--white)",
                background: "transparent",
                border: "none",
                outline: "none",
                letterSpacing: "0.5px",
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: "12px 20px",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "var(--black)",
                background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                transition: "opacity 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Search
            </button>
          </div>
          {searchActive && search.trim() && (
            <div style={{ marginTop: "8px", fontSize: "12px", fontFamily: "var(--font-body)" }}>
              {allPlayers.some((p) => p.minecraft_ign.toLowerCase() === search.trim().toLowerCase()) ? (
                <span style={{ color: "var(--gold)" }}>
                  Found — showing page {page + 1}
                </span>
              ) : (
                <span style={{ color: "#f87171" }}>
                  Player &quot;{search.trim()}&quot; not found in rankings
                </span>
              )}
            </div>
          )}
        </div>

        {/* Rankings Header */}
        <div className="animate-fade-in-up delay-3" style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "12px", height: "1px", background: "var(--gold)" }} />
            <h2
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--gold)",
                margin: 0,
                fontFamily: "var(--font-body)",
              }}
            >
              Rankings
            </h2>
            <div style={{ flex: 1, height: "1px", background: "rgba(197, 165, 90, 0.1)" }} />
            <div
              style={{
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                color: connected ? "var(--gold)" : "#c45c5c",
                fontFamily: "var(--font-body)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: connected ? "var(--gold)" : "#c45c5c",
                  display: "inline-block",
                }}
              />
              {connected ? "LIVE" : "OFFLINE"}
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div
          className="animate-fade-in-up delay-4"
          style={{
            background: "var(--black-card)",
            border: "1px solid var(--black-border)",
            overflow: "hidden",
            marginBottom: "16px",
          }}
        >
          {/* Header Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 20px",
              borderBottom: "1px solid var(--black-border)",
              background: "rgba(197, 165, 90, 0.03)",
              gap: "16px",
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "var(--white-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            <div style={{ width: "40px", textAlign: "center" }}>#</div>
            <div style={{ width: "28px" }} />
            <div style={{ flex: 1 }}>Player</div>
            <div style={{ minWidth: "60px", textAlign: "right" }}>Elo</div>
            <div style={{ minWidth: "80px", textAlign: "right" }}>Record</div>
            <div style={{ minWidth: "45px", textAlign: "right" }}>WR</div>
          </div>

          {/* Player Rows */}
          {allPlayers.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "var(--white-muted)",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
              }}
            >
              No ranked players yet. Link your account and start dueling!
            </div>
          ) : (
            currentPlayers.map((player, i) => {
              const globalRank = page * PLAYERS_PER_PAGE + i + 1;
              const isSearched = searchedIGN === player.minecraft_ign.toLowerCase();
              return (
                <div
                  key={player.minecraft_ign}
                  style={{
                    background: isSearched ? "rgba(197, 165, 90, 0.08)" : undefined,
                    borderLeft: isSearched ? "3px solid var(--gold)" : "3px solid transparent",
                  }}
                >
                  <PlayerRow player={player} rank={globalRank} />
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {allPlayers.length > PLAYERS_PER_PAGE && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              marginBottom: "48px",
            }}
          >
            <PageArrow direction="left" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} />
            <span
              style={{
                fontSize: "12px",
                color: "var(--white-muted)",
                fontFamily: "var(--font-body)",
                letterSpacing: "0.5px",
              }}
            >
              Page <span style={{ color: "var(--gold)", fontWeight: 600 }}>{page + 1}</span> of {totalPages}
            </span>
            <PageArrow direction="right" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} />
          </div>
        )}

        {/* Rank Tiers */}
        <div className="animate-fade-in-up delay-5" style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: "12px", height: "1px", background: "var(--white-muted)" }} />
            <h2
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--white-muted)",
                margin: 0,
                fontFamily: "var(--font-body)",
              }}
            >
              Rank Tiers
            </h2>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
          </div>

          <div
            style={{
              background: "var(--black-card)",
              border: "1px solid var(--black-border)",
              display: "flex",
              justifyContent: "center",
              gap: "0",
              overflow: "hidden",
            }}
          >
            {[
              { name: "CHAMPION", elo: "2000+", color: "#8b0000" },
              { name: "DIAMOND", elo: "1600+", color: "#60a5fa" },
              { name: "GOLD", elo: "1300+", color: "#c5a55a" },
              { name: "SILVER", elo: "1100+", color: "#94a3b8" },
              { name: "UNRANKED", elo: "0+", color: "#71717a" },
            ].map((tier, i) => (
              <div
                key={tier.name}
                style={{
                  flex: 1,
                  padding: "20px 16px",
                  textAlign: "center",
                  borderRight: i < 4 ? "1px solid var(--black-border)" : "none",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "2px",
                    background: tier.color,
                    transform: "rotate(45deg)",
                    boxShadow: `0 0 8px ${tier.color}44`,
                    margin: "0 auto 10px",
                  }}
                />
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    color: tier.color,
                    fontFamily: "var(--font-body)",
                    marginBottom: "4px",
                  }}
                >
                  {tier.name}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--white-muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {tier.elo} Elo
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Matches */}
        <div className="animate-fade-in-up delay-5">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ width: "12px", height: "1px", background: "var(--white-muted)" }} />
            <h2
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "var(--white-muted)",
                margin: 0,
                fontFamily: "var(--font-body)",
              }}
            >
              Recent Matches
            </h2>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.05)" }} />
          </div>

          <div
            style={{
              background: "var(--black-card)",
              border: "1px solid var(--black-border)",
              overflow: "hidden",
            }}
          >
            {matches.length === 0 ? (
              <div
                style={{
                  padding: "24px 16px",
                  textAlign: "center",
                  color: "var(--white-muted)",
                  fontSize: "12px",
                  fontFamily: "var(--font-body)",
                }}
              >
                No matches played yet
              </div>
            ) : (
              matches.map((match, i) => <MatchRow key={i} match={match} />)
            )}
          </div>
        </div>
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