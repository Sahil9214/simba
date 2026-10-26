"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console (replace with error reporting service if needed)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            maxWidth: "480px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(239,68,68,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "2rem",
            }}
          >
            ⚠️
          </div>
          <h1
            style={{
              color: "#f1f5f9",
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            Something went wrong!
          </h1>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.95rem",
              marginBottom: "2rem",
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred in the application. Please try again,
            or contact support if the issue persists.
          </p>
          {error?.digest && (
            <p
              style={{
                color: "#475569",
                fontSize: "0.75rem",
                marginBottom: "1.5rem",
                fontFamily: "monospace",
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 2rem",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) =>
              ((e.target as HTMLButtonElement).style.opacity = "0.85")
            }
            onMouseOut={(e) =>
              ((e.target as HTMLButtonElement).style.opacity = "1")
            }
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
