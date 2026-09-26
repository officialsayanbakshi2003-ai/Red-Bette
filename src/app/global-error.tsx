"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ background: "#0a0a0b", color: "#efede8", fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
          <div>
            <p style={{ color: "#e3141b", fontWeight: 900, fontStyle: "italic", fontSize: 40, margin: 0 }}>RED BETTA</p>
            <p style={{ marginTop: 16 }}>Something went wrong. Please refresh the page.</p>
            <button
              onClick={reset}
              style={{ marginTop: 24, background: "#e3141b", color: "#fff", border: 0, padding: "14px 28px", fontWeight: 700, cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
