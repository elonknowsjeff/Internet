import React from "react";
import { Link } from "react-router-dom";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function AuthModeToggle({ active }) {
  const returnTo = safeReturnTo();
  const suffix = returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "";
  const item = "flex-1 py-2 rounded-lg text-sm font-medium text-center transition-colors";

  return (
    <div className="flex gap-1 p-1 rounded-xl bg-muted mb-6">
      <Link
        to={"/login" + suffix}
        className={`${item} ${active === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      >
        Sign in
      </Link>
      <Link
        to={"/register" + suffix}
        className={`${item} ${active === "register" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      >
        Sign up
      </Link>
    </div>
  );
}