import { ImageResponse } from "next/og";

export const alt = "NossaCarta — Uma carta eterna pra vocês";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAF6F0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          padding: "60px",
        }}
      >
        <svg
          width="280"
          height="224"
          viewBox="0 0 200 160"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="20"
            y="48"
            width="160"
            height="96"
            rx="4"
            fill="#FAF6F0"
            stroke="#7B1E3A"
            strokeWidth="3"
          />
          <path
            d="M20 144 L100 96 L180 144"
            fill="none"
            stroke="#7B1E3A"
            strokeWidth="2"
            opacity="0.55"
          />
          <path
            d="M20 48 L100 110 L180 48 Z"
            fill="#FAF6F0"
            stroke="#7B1E3A"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle
            cx="100"
            cy="100"
            r="22"
            fill="#D4AF7A"
            stroke="#7B1E3A"
            strokeWidth="1.5"
          />
          <text
            x="100"
            y="107"
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontWeight="700"
            fontSize="20"
            fill="#2B1810"
          >
            NC
          </text>
        </svg>

        <div
          style={{
            fontSize: 132,
            color: "#2B1810",
            marginTop: 30,
            fontStyle: "italic",
            fontWeight: 600,
            letterSpacing: -2,
          }}
        >
          NossaCarta
        </div>

        <div
          style={{
            fontSize: 26,
            color: "#7B1E3A",
            letterSpacing: 12,
            marginTop: 8,
            textTransform: "uppercase",
          }}
        >
          A sua história, selada
        </div>
      </div>
    ),
    { ...size }
  );
}
