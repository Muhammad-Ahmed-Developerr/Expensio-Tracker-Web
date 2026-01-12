"use client";

import { useEffect, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [x, setX] = useState(-20);

  useEffect(() => {
    const id = setInterval(() => {
      setX((p) => (p > 100 ? -20 : p + 0.7));
    }, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="container">
      <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes glow {
          0% { text-shadow: 0 0 12px #ff5cff; }
          50% { text-shadow: 0 0 40px #7c7cff; }
          100% { text-shadow: 0 0 12px #ff5cff; }
        }

        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }

        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            #070b1f,
            #120a2f,
            #1a043a
          );
          background-size: 300% 300%;
          animation: gradientFlow 16s ease infinite;
          color: white;
          font-family: Inter, system-ui, sans-serif;
          text-align: center;
          padding: 24px;
        }

        .card {
          max-width: 560px;
        }

        .icon {
          font-size: 46px;
          margin-bottom: 10px;
        }

        .title {
          font-size: 56px;
          font-weight: 900;
          color: #ff5cff;
          animation: glow 3s ease-in-out infinite;
          margin-bottom: 10px;
        }

        .subtitle {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 14px;
        }

        .message {
          opacity: 0.75;
          margin-bottom: 30px;
        }

        .robot-wrap {
          width: 140px;
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
          padding: 14px 38px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #ff5cff, #7c7cff);
          color: #020617;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 14px 40px rgba(255, 92, 255, 0.45);
        }

        .button:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 26px 70px rgba(124, 124, 255, 0.7);
        }

        .digest {
          margin-top: 16px;
          font-size: 12px;
          opacity: 0.4;
        }
      `}</style>

      <div className="card">
        <div className="icon">⚠️</div>
        <div className="title">SYSTEM ERROR</div>
        <div className="subtitle">Something went seriously wrong</div>

        <p className="message">
          {error?.message ||
            "A critical error occurred. Please try again or reload the app."}
        </p>

        <div className="robot-wrap">
          <img
            src="https://github.githubassets.com/images/error/robots.svg"
            alt="robot"
            className="robot"
            style={{ left: `${x}%` }}
          />
        </div>

        <button className="button" onClick={reset}>
          🔄 Retry Application
        </button>

        {error?.digest && (
          <div className="digest">Error ID: {error.digest}</div>
        )}
      </div>
    </div>
  );
}
