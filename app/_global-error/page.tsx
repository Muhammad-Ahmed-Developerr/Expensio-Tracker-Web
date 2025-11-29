"use client";

export default function GlobalError() {
  return (
    <html>
      <body
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
        </div>
      </body>
    </html>
  );
}