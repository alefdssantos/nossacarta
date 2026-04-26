import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#7B1E3A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="140"
          height="112"
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
        </svg>
      </div>
    ),
    { ...size }
  );
}
