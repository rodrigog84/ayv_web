import { cn } from "@/lib/utils";

export function FlagToggle({
  active,
  label,
  onClick,
  tone,
  disabled,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  tone: "sky" | "charcoal";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-50",
        active && tone === "sky" && "border-sky bg-sky text-white",
        active &&
          tone === "charcoal" &&
          "border-charcoal bg-charcoal text-white",
        !active &&
          "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
