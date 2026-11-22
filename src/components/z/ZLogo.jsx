import React from "react";

// Minimalist geometric double-lined white "Z" — blackboard-bold style.
export default function ZLogo({ size = 28, className = "" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-label="Z"
    >
      {/* outer Z */}
      <path
        d="M7 6.5h18M7 6.5l18 19M7 25.5h18"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* inner double line */}
      <path
        d="M10.5 9.7h11M10.5 9.7l11 12.6M10.5 22.3h11"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  );
}