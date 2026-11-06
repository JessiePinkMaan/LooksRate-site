"use client";

import { errors } from "@/lib/content";

const copy = errors.error;

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#030303",
          color: "#e9e4da",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: "34rem", padding: "2rem" }}>
          <p
            style={{
              margin: 0,
              color: "#7f848e",
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
            }}
          >
            {copy.eyebrow}
          </p>
          <h1
            style={{
              margin: "1rem 0 0",
              fontSize: "clamp(2.2rem, 8vw, 4rem)",
              lineHeight: 0.95,
              textTransform: "uppercase",
            }}
          >
            {copy.title}
          </h1>
          <p style={{ marginTop: "1.2rem", color: "#7f848e", lineHeight: 1.6 }}>
            {copy.text}
          </p>
          <div style={{ display: "flex", gap: "0.8rem", marginTop: "2rem" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: "1px solid #c9a227",
                background: "rgba(201,162,39,0.12)",
                color: "#c9a227",
                padding: "0.8rem 1.2rem",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontSize: "0.65rem",
              }}
            >
              {copy.retry}
            </button>
            <a
              href="/"
              style={{
                border: "1px solid #1c1c20",
                color: "#7f848e",
                padding: "0.8rem 1.2rem",
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontSize: "0.65rem",
              }}
            >
              {copy.home}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
