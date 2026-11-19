import React from "react";

export default function RayField() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_4%,rgba(139,92,246,0.18),transparent_62%),radial-gradient(circle_at_8%_92%,rgba(56,189,248,0.08),transparent_58%)]" />
    </div>
  );
}