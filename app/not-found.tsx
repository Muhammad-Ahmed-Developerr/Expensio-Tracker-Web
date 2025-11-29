"use client";

export default function NotFound() {
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
          <h1 style={{ fontSize: "40px", marginBottom: "10px", color: "#00E6FF" }}>
            404 — Page Not Found
          </h1>
          <p style={{ opacity: 0.7 }}>The page you’re looking for doesn’t exist.</p>
        </div>
      </body>
    </html>
  );
}
