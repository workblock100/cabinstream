"use client";

// Catches render-time errors that escape the root layout (error.tsx does not wrap
// its own segment's layout). Must declare its own <html>/<body>.
// Next 16's recovery prop is `unstable_retry`, not `reset`.
export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#07090d",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
          margin: 0,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Something went wrong</h1>
          <p style={{ opacity: 0.7, marginTop: 8 }}>CabinStream hit an unexpected error.</p>
          <button
            onClick={() => unstable_retry()}
            style={{
              marginTop: 20,
              padding: "12px 20px",
              borderRadius: 12,
              background: "#22d3ee",
              color: "#07090d",
              fontWeight: 600,
              border: 0,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
