import type { SVGProps } from "react";

type Variant = "mark" | "horizontal" | "stacked";

type LogoProps = {
  variant?: Variant;
  className?: string;
  title?: string;
} & Omit<SVGProps<SVGSVGElement>, "viewBox" | "xmlns">;

export function Logo({
  variant = "mark",
  className,
  title = "NossaCarta",
  ...rest
}: LogoProps) {
  if (variant === "horizontal") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 600 160"
        role="img"
        aria-label={title}
        className={className}
        {...rest}
      >
        <defs>
          <linearGradient id="ncWaxH" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E5C796" />
            <stop offset="55%" stopColor="#D4AF7A" />
            <stop offset="100%" stopColor="#A8854F" />
          </linearGradient>
        </defs>
        <Envelope gradId="ncWaxH" />
        <g transform="translate(210,0)">
          <text
            x="0"
            y="100"
            fontFamily="var(--font-allura), 'Caveat', cursive"
            fontWeight="700"
            fontSize="76"
            fill="#2B1810"
          >
            NossaCarta
          </text>
          <text
            x="4"
            y="130"
            fontFamily="var(--font-inter), 'Inter', system-ui, sans-serif"
            fontWeight="500"
            fontSize="14"
            fill="#7B1E3A"
            letterSpacing="4"
          >
            A SUA HISTÓRIA, SELADA.
          </text>
        </g>
      </svg>
    );
  }

  if (variant === "stacked") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 320"
        role="img"
        aria-label={title}
        className={className}
        {...rest}
      >
        <defs>
          <linearGradient id="ncWaxS" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E5C796" />
            <stop offset="55%" stopColor="#D4AF7A" />
            <stop offset="100%" stopColor="#A8854F" />
          </linearGradient>
        </defs>
        <g transform="translate(100,20)">
          <Envelope gradId="ncWaxS" inline />
        </g>
        <text
          x="200"
          y="232"
          textAnchor="middle"
          fontFamily="var(--font-allura), 'Caveat', cursive"
          fontWeight="700"
          fontSize="48"
          fill="#2B1810"
        >
          NossaCarta
        </text>
        <text
          x="200"
          y="260"
          textAnchor="middle"
          fontFamily="var(--font-inter), 'Inter', system-ui, sans-serif"
          fontWeight="500"
          fontSize="10"
          fill="#7B1E3A"
          letterSpacing="4"
        >
          A SUA HISTÓRIA, SELADA.
        </text>
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 160"
      role="img"
      aria-label={title}
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="ncWaxM" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E5C796" />
          <stop offset="55%" stopColor="#D4AF7A" />
          <stop offset="100%" stopColor="#A8854F" />
        </linearGradient>
      </defs>
      <Envelope gradId="ncWaxM" inline />
    </svg>
  );
}

function Envelope({
  gradId,
  inline = false,
}: {
  gradId: string;
  inline?: boolean;
}) {
  return (
    <g transform={inline ? undefined : "translate(0,0)"}>
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
        d="M20 48 L100 100 L180 48"
        fill="none"
        stroke="#7B1E3A"
        strokeWidth="2"
        opacity="0.4"
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
        fill={`url(#${gradId})`}
        stroke="#7B1E3A"
        strokeWidth="1.5"
      />
      <circle
        cx="100"
        cy="100"
        r="17"
        fill="none"
        stroke="#7B1E3A"
        strokeWidth="0.8"
        opacity="0.55"
      />
      <text
        x="100"
        y="106"
        textAnchor="middle"
        fontFamily="var(--font-cormorant), 'Cormorant Garamond', Georgia, serif"
        fontWeight="700"
        fontSize="18"
        fill="#2B1810"
        letterSpacing="0.5"
      >
        NC
      </text>
    </g>
  );
}
