export function getInitials(firstName = "", lastName = "", email = ""): string {
  const f = firstName.trim().toUpperCase();
  const l = lastName.trim().toUpperCase();

  if (f && l) return f.charAt(0) + l.charAt(0);
  if (f) return f.charAt(0);
  if (l) return l.charAt(0);
  return (email?.charAt(0) || "U").toUpperCase();
}
