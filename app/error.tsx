"use client";

export default function ErrorPage({ error }: { error: Error }) {
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
          <h1 style={{ fontSize: "32px", marginBottom: "10px", color: "#00E6FF" }}>
            Something went wrong
          </h1>
          <p style={{ opacity: 0.7 }}>
            {error?.message || "Unknown error occurred."}
          </p>
        </div>
      </body>
    </html>
  );
}
