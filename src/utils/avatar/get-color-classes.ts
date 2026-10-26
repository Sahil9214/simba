const PALETTES = [
  "bg-indigo-200 text-indigo-700 border-indigo-300",
  "bg-emerald-200 text-emerald-700 border-emerald-300",
  "bg-amber-200 text-amber-700 border-amber-300",
  "bg-sky-200 text-sky-700 border-sky-300",
  "bg-rose-200 text-rose-700 border-rose-300",
  "bg-violet-200 text-violet-700 border-violet-300",
  "bg-teal-200 text-teal-700 border-teal-300",
];

export function getColorClasses(seed = "U"): string {
  const code = seed.toUpperCase().charCodeAt(0) || 65;
  const idx = code % PALETTES.length;
  return PALETTES[idx];
}
