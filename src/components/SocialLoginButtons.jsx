import React from "react";
import { signInWithProvider } from "@/lib/authMfaFlow";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/GoogleIcon";

export function MicrosoftIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3h8v8H3z" fill="#F25022" />
      <path d="M13 3h8v8h-8z" fill="#7FBA00" />
      <path d="M3 13h8v8H3z" fill="#00A4EF" />
      <path d="M13 13h8v8h-8z" fill="#FFB900" />
    </svg>
  );
}

export function AppleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M16.36 12.9c.02 2.04 1.79 2.72 1.81 2.73-.02.05-.28.97-.94 1.92-.57.82-1.16 1.63-2.09 1.65-.91.02-1.2-.54-2.25-.54-1.04 0-1.37.52-2.24.56-.9.03-1.58-.89-2.16-1.71-1.18-1.69-2.08-4.78-.87-6.87.6-1.04 1.68-1.7 2.84-1.72.88-.02 1.71.59 2.25.59.54 0 1.55-.73 2.61-.62.44.02 1.7.18 2.5 1.36-.06.04-1.49.87-1.47 2.6zM14.6 6.7c.47-.57.79-1.36.7-2.15-.68.03-1.5.45-1.99 1.02-.44.5-.82 1.31-.72 2.08.76.06 1.54-.39 2.01-.95z" />
    </svg>
  );
}

export default function SocialLoginButtons({ returnTo }) {
  const dest = returnTo || "/";
  const go = (provider) => () => signInWithProvider(provider, dest);
  return (
    <div className="space-y-2.5">
      <Button variant="outline" className="w-full h-12 text-sm font-medium" onClick={go("google")}>
        <GoogleIcon className="w-5 h-5 mr-2" /> Continue with Google
      </Button>
      <Button variant="outline" className="w-full h-12 text-sm font-medium" onClick={go("microsoft")}>
        <MicrosoftIcon className="w-5 h-5 mr-2" /> Continue with Microsoft
      </Button>
      <Button variant="outline" className="w-full h-12 text-sm font-medium bg-black text-white hover:bg-neutral-900 hover:text-white" onClick={go("apple")}>
        <AppleIcon className="w-5 h-5 mr-2" /> Continue with Apple
      </Button>
    </div>
  );
}