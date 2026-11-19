export function BrandAvatar({
  studioName,
  logoUrl,
  size = "md",
}: {
  studioName: string;
  logoUrl: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const initials = studioName
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  const dims =
    size === "sm"
      ? "h-9 w-9 text-xs"
      : size === "lg"
        ? "h-14 w-14 text-lg"
        : "h-11 w-11 text-sm";

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${studioName} logo`}
        className={`${dims} rounded-full border border-[var(--border-hairline)] object-cover bg-white`}
      />
    );
  }

  return (
    <div
      className={`${dims} inline-flex items-center justify-center rounded-full font-editorial font-semibold tracking-wider shrink-0`}
      style={{
        backgroundColor: "var(--brand-accent)",
        color: "var(--brand-accent-fg)",
      }}
    >
      {initials || "CP"}
    </div>
  );
}
