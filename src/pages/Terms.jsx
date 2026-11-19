import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Agreement",
    body: "These Terms of Service govern your use of Super Internet, a social and services platform. By creating an account or using any part of the platform, you agree to these terms. If you do not agree, please do not use the service.",
  },
  {
    title: "2. Your account",
    body: "You are responsible for the accuracy of your profile information and for keeping your sign-in credentials secure. You must be at least 13 years old to use Super Internet. One person, one account: accounts may not be sold, shared, or transferred.",
  },
  {
    title: "3. Your content",
    body: "You keep ownership of the text, photos, and videos you post. By posting, you grant Super Internet a non-exclusive, worldwide licence to host, display, and distribute that content inside the platform so the service can operate. Only upload media you own or are permitted to share.",
  },
  {
    title: "4. Community standards",
    body: "Harassment, hate speech, threats, impersonation, spam, and the sharing of illegal or sexually exploitative material are prohibited. Content that infringes copyright or reveals another person's private information will be removed. Accounts that repeatedly break these rules may be suspended.",
  },
  {
    title: "5. Messaging and calling",
    body: "Direct messages, voice calls, and video calls are for genuine communication between members. Do not record or publish another member's conversation without their consent, and do not use these features to send unsolicited bulk messages.",
  },
  {
    title: "6. Purchases and subscriptions",
    body: "Paid memberships and marketplace purchases are processed securely by our payment provider. Prices are shown before you confirm a purchase. Subscriptions renew until cancelled, and cancellations take effect at the end of the current billing period.",
  },
  {
    title: "7. Acceptable use",
    body: "Do not attempt to break, overload, or reverse engineer the platform, scrape member data, bypass security or privacy controls, or use the service to distribute malware. Automated access is permitted only through the documented API.",
  },
  {
    title: "8. Moderation and removal",
    body: "We may remove content or restrict access when these terms are broken or when required by law. Where possible we tell you what was removed and why, and you may request a review of the decision.",
  },
  {
    title: "9. Termination",
    body: "You can stop using Super Internet at any time. We may suspend or close an account that violates these terms. On closure, your posts and media are removed from public view in line with our retention practices.",
  },
  {
    title: "10. Disclaimers",
    body: "The platform is provided on an as-available basis. Third-party services connected through Super Internet, such as rides, deliveries, and travel bookings, are fulfilled by those providers and subject to their own terms.",
  },
  {
    title: "11. Changes to these terms",
    body: "We may update these terms as the platform evolves. Material changes are announced in the app before they take effect, and continued use after that date constitutes acceptance.",
  },
];

export default function Terms() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <div className="max-w-3xl mx-auto pb-28 px-4 py-4">
      <header className="flex items-center gap-3 mb-4">
        <Link to="/settings" className="w-9 h-9 rounded-full hover:bg-white/10 grid place-items-center shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold font-display flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-300" /> Terms of Service
          </h1>
          <p className="text-xs text-white/45">Last updated 3 November 2026</p>
        </div>
      </header>

      <section className="rounded-2xl bg-white/[0.06] border border-white/10 p-5 mb-4">
        <p className="text-sm text-white/75 leading-relaxed">
          Welcome to Super Internet. This page explains the rules that keep the platform useful and safe for everyone,
          covering your account, the photos and videos you share, messaging, and paid services.
        </p>
      </section>

      <div className="space-y-3">
        {SECTIONS.map((s) => (
          <section key={s.title} className="rounded-2xl bg-white/[0.04] border border-white/10 p-5">
            <h2 className="text-sm font-bold text-white mb-1.5">{s.title}</h2>
            <p className="text-sm text-white/60 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>

      <section className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 mt-3">
        <h2 className="text-sm font-bold mb-1.5">Contact</h2>
        <p className="text-sm text-white/60 leading-relaxed">
          Questions about these terms, content removal, or data requests can be raised from the Settings page of your
          account. We aim to respond within five business days.
        </p>
      </section>

      <p className="text-center text-xs text-white/30 mt-6">Super Internet · professional social and services platform</p>
    </div>
  );
}