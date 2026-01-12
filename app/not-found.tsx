"use client";

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <style>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }

          @keyframes glow {
            0% { text-shadow: 0 0 10px #00f5ff; }
            50% { text-shadow: 0 0 30px #00f5ff, 0 0 60px #7c7cff; }
            100% { text-shadow: 0 0 10px #00f5ff; }
          }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .container {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(
              135deg,
              #050b1e,
              #0a1a3a,
              #140c2c
            );
            background-size: 300% 300%;
            animation: gradientShift 12s ease infinite;
            color: white;
            font-family: "Inter", "Segoe UI", system-ui, sans-serif;
            text-align: center;
            padding: 24px;
          }

          .card {
            max-width: 520px;
          }

          .title {
            font-size: 120px;
            font-weight: 900;
            color: #00f5ff;
            animation: float 4s ease-in-out infinite, glow 3s ease-in-out infinite;
            margin-bottom: 10px;
          }

          .subtitle {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 12px;
          }

          .text {
            opacity: 0.75;
            margin-bottom: 28px;
          }

          .button {
            display: inline-block;
            padding: 14px 34px;
            border-radius: 999px;
            background: linear-gradient(135deg, #00f5ff, #7c7cff);
            color: #020617;
            font-weight: 700;
            text-decoration: none;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            box-shadow: 0 10px 30px rgba(0, 245, 255, 0.4);
          }

          .button:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 20px 50px rgba(124, 124, 255, 0.6);
          }
        `}</style>

        <div className="container">
          <div className="card">
            <div className="title">404</div>
            <div className="subtitle">Page Not Found</div>
            <p className="text">
              Oops! The page you’re looking for drifted into another dimension.
            </p>
            <a href="/" className="button">
              🚀 Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
