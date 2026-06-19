const AVATAR_GRADIENTS = [
  "from-teal-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-cyan-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-indigo-600",
  "from-lime-500 to-emerald-600",
] as const;

export function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}

const CITY_EMOJI: Record<string, string> = {
  casablanca: "🏙️",
  rabat: "🏛️",
  marrakech: "🌴",
  tanger: "⚓",
  fes: "🕌",
  agadir: "🏖️",
  meknes: "🏰",
  oujda: "🌅",
  kenitra: "🚢",
  tetouan: "🎨",
};

export function getCityEmoji(slug: string): string {
  return CITY_EMOJI[slug] || "📍";
}
