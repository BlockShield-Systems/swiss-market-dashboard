import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/constants";

export const runtime = "edge";

export const alt = `${SITE_CONFIG.name} preview image`;
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #020617 0%, #0f172a 45%, #1e3a8a 100%)",
          color: "#f8fafc",
          padding: "64px",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)",
                boxShadow: "0 20px 60px rgba(37, 99, 235, 0.45)",
              }}
            />
            <span>{SITE_CONFIG.shortName}</span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              fontSize: "22px",
              color: "#bfdbfe",
            }}
          >
            <span>Next.js</span>
            <span>·</span>
            <span>Postgres</span>
            <span>·</span>
            <span>Redis</span>
            <span>·</span>
            <span>AI-ready</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div
            style={{
              display: "flex",
              width: "fit-content",
              borderRadius: "999px",
              border: "1px solid rgba(147, 197, 253, 0.45)",
              background: "rgba(15, 23, 42, 0.75)",
              padding: "12px 22px",
              fontSize: "24px",
              color: "#bfdbfe",
            }}
          >
            Production-oriented Intelligence Dashboard
          </div>

          <h1
            style={{
              margin: 0,
              maxWidth: "980px",
              fontSize: "76px",
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: "-0.055em",
            }}
          >
            Swiss Market Dashboard
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "1000px",
              fontSize: "34px",
              lineHeight: 1.35,
              color: "#dbeafe",
            }}
          >
            Crypto market data, Swiss weather intelligence, persistent insights,
            Redis caching, rate limiting and AI-ready platform infrastructure.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "24px",
            color: "#bfdbfe",
          }}
        >
          <span>dashboard.ai-techart.com</span>
          <span>by {SITE_CONFIG.author}</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
