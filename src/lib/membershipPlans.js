// Walza+ membership tiers. Display only — the amount charged is resolved on the server
// from createCheckout's own catalog, so editing this list can never change a price.
export const MEMBERSHIP_PLANS = [
  {
    id: "plus",
    label: "Walza+",
    price: 4.99,
    blurb: "Everything unlocked",
    features: ["Every panel unlocked", "No ads anywhere", "Priority rides and delivery"],
  },
  {
    id: "pro",
    label: "Walza+ Pro",
    price: 19.99,
    blurb: "For daily creators",
    features: ["Everything in Walza+", "2× AI credits", "HD creator studio exports"],
  },
  {
    id: "studio",
    label: "Walza+ Studio",
    price: 49.99,
    blurb: "Music, video and docs",
    features: ["Everything in Pro", "Unlimited AI games and art", "4K video editor renders"],
  },
  {
    id: "business",
    label: "Walza+ Business",
    price: 99.99,
    blurb: "Small teams",
    features: ["Everything in Studio", "5 team seats", "Shared cloud storage"],
  },
  {
    id: "enterprise",
    label: "Walza+ Enterprise",
    price: 199.99,
    blurb: "Whole company",
    features: ["Everything in Business", "20 team seats", "Priority support line"],
  },
  {
    id: "ultimate",
    label: "Walza+ Ultimate",
    price: 499.99,
    blurb: "All in, one payment",
    features: ["Everything in Enterprise", "Unlimited seats", "Dedicated account manager"],
  },
];

export const planById = (id) => MEMBERSHIP_PLANS.find((p) => p.id === id) || MEMBERSHIP_PLANS[0];