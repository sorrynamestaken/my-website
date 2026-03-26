"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

function DiscordIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  );
}

function SocialIcon({ icon, label, url }: { icon: React.ReactNode; label: string; url: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "6px",
        color: hovered ? "var(--gold)" : "var(--white-muted)",
        background: hovered ? "rgba(197, 165, 90, 0.1)" : "transparent",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
    >
      {icon}
      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginTop: "8px",
            padding: "6px 12px",
            background: "rgba(10, 10, 10, 0.95)",
            border: "1px solid var(--black-border)",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 500,
            color: "var(--white)",
            fontFamily: "var(--font-body)",
            whiteSpace: "nowrap",
            letterSpacing: "0.5px",
            pointerEvents: "none",
          }}
        >
          {label}
        </div>
      )}
    </a>
  );
}

export default function Navbar({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const links = [
    { href: "/tournaments", label: "Tournaments" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/link", label: "Link Account" },
  ];

  const socials = [
    { icon: <DiscordIcon />, label: "Purple Ranked Discord", url: "https://discord.gg/afcXYbuSb7" },
    { icon: <DiscordIcon />, label: "Johnn Discord", url: "https://discord.gg/zhfqSYM25G" },
    { icon: <DiscordIcon />, label: "Purple Prison Discord", url: "https://discord.gg/pp" },
    { icon: <GlobeIcon />, label: "Purple Prison Website", url: "https://www.purpleprison.co/" },
    { icon: <YouTubeIcon />, label: "B0XIN", url: "https://www.youtube.com/@b0xinn" },
    { icon: <YouTubeIcon />, label: "SorryNamesTaken", url: "https://www.youtube.com/@sorrynamestaken4247" },
  ];

  return (
    <nav
      style={{
        position: transparent ? "absolute" : "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: "90px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: transparent ? "transparent" : "rgba(10, 10, 10, 0.85)",
        backdropFilter: transparent ? "none" : "blur(20px)",
        borderBottom: transparent ? "none" : "1px solid var(--black-border)",
      }}
    >
      {/* Social Icons — Left side */}
      <div
        style={{
          position: "absolute",
          right: "calc(50% + 100px)",
          display: "flex",
          alignItems: "center",
          gap: "30px",
        }}
      >
        {socials.map((social) => (
          <SocialIcon key={social.url} icon={social.icon} label={social.label} url={social.url} />
        ))}

        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "28px",
            background: "rgba(197, 165, 90, 0.2)",
            marginLeft: "8px",
          }}
        />
      </div>

      {/* Logo — absolute center */}
      <Link
        href="/"
        style={{
          position: "absolute",
          left: "50%",
          transform: `translateX(-50%) ${hoveredLink ? "scale(0.98)" : "scale(1)"}`,
          display: "flex",
          alignItems: "center",
          transition: "transform 0.3s ease, opacity 0.3s ease",
          opacity: hoveredLink ? 0.7 : 1,
        }}
      >
        <img
          src="/logo.png"
          alt="Johnn Rise Up"
          style={{ height: "55px", width: "auto", objectFit: "contain" }}
        />
      </Link>

      {/* Nav Links — Right side */}
      <div
        style={{
          position: "absolute",
          left: "calc(50% + 100px)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "28px",
            background: "rgba(197, 165, 90, 0.2)",
            marginRight: "8px",
          }}
        />

        {links.map((link) => {
          const isActive = pathname === link.href;
          const isHovered = hoveredLink === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHoveredLink(link.href)}
              onMouseLeave={() => setHoveredLink(null)}
              style={{
                fontSize: "14px",
                fontWeight: 500,
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontFamily: "var(--font-body)",
                color: isActive
                  ? "var(--gold)"
                  : isHovered
                    ? "var(--white)"
                    : "var(--white-muted)",
                padding: "10px 24px",
                borderRadius: "2px",
                transition: "all 0.3s ease",
                position: "relative",
                background: isActive ? "var(--gold-dim)" : isHovered ? "rgba(255,255,255,0.03)" : "transparent",
                border: isActive ? "1px solid rgba(197, 165, 90, 0.2)" : "1px solid transparent",
                whiteSpace: "nowrap",
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}