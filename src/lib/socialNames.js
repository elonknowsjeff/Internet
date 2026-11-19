export const handleOf = (u) => u?.username || (u?.email ? u.email.split("@")[0] : "user");
export const nameOf = (u) => u?.display_name || u?.full_name || (u?.email ? u.email.split("@")[0] : "User");
export const digitsOnly = (s) => (s || "").replace(/\D/g, "");