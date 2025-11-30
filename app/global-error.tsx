"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          style={{
            background: "linear-gradient(135deg, #021B32, #0A2740)",
            color: "white",
            fontFamily: "sans-serif",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "34px", marginBottom: "10px", color: "#00E6FF" }}>
              Global Error
            </h1>
            <p style={{ opacity: 0.7 }}>
              An unexpected error occurred. The team has been notified.
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                backgroundColor: "#00E6FF",
                border: "none",
                borderRadius: "5px",
                color: "#021B32",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}