"use client";

import { useEffect, useState } from "react";

export default function ErrorPage({ error }: { error: Error }) {
  const [x, setX] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setX((p) => (p > 100 ? -20 : p + 0.6));
    }, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="container">
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes glow {
          0% { text-shadow: 0 0 12px #00f5ff; }
          50% { text-shadow: 0 0 40px #7c7cff; }
          100% { text-shadow: 0 0 12px #00f5ff; }
        }

        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0); }
        }

        .container {
          min-height: 100vh;
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
          animation: gradientMove 14s ease infinite;
          color: white;
          font-family: Inter, system-ui, sans-serif;
          padding: 24px;
          text-align: center;
        }

        .card {
          max-width: 520px;
        }

        .code {
          font-size: 110px;
          font-weight: 900;
          color: #00f5ff;
          animation: glow 3s ease-in-out infinite;
          margin-bottom: 10px;
        }

        .title {
          font-size: 26px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .message {
          opacity: 0.7;
          margin-bottom: 30px;
        }

        .robot-wrap {
          width: 120px;
          height: 90px;
          margin: 0 auto 30px;
          position: relative;
          overflow: hidden;
        }

        .robot {
          position: absolute;
          top: 10px;
          width: 70px;
          animation: float 3s ease-in-out infinite;
        }

        .button {
          display: inline-block;
          padding: 14px 36px;
          border-radius: 999px;
          background: linear-gradient(135deg, #00f5ff, #7c7cff);
          color: #020617;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 12px 30px rgba(0, 245, 255, 0.4);
        }

        .button:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 24px 60px rgba(124, 124, 255, 0.6);
        }
      `}</style>

      <div className="card">
        <div className="code">Error</div>
        <div className="title">Something Went Wrong</div>

        <p className="message">
          {error?.message ||
            "An unexpected error occurred. Please try again later."}
        </p>
        
        <div className="robot-wrap">
          <img
            src="https://github.githubassets.com/images/error/robots.svg"
            alt="robot"
            className="robot"
            style={{ left: `${x}%` }}
          />
        </div>

        <a href="/" className="button">
          🏠 Back to Home
        </a>
      </div>
    </div>
  );
}
