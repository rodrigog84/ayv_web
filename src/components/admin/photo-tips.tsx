import { cn } from "@/lib/utils";

type Variant = "product" | "announcement";

const TIPS: Record<
  Variant,
  { summary: string; items: string[] }
> = {
  product: {
    summary: "Consejos para las fotos",
    items: [
      "Formatos: JPEG, PNG, WebP o GIF · máx. ~4 MB c/u.",
      "Mejor en cuadrado (~1:1) o vertical 4:5. Lado corto al menos ~1000–1500 px.",
      "Fondo simple y buena luz. Varias tomas (frente, detalle, ángulo).",
      "La primera foto es la portada del catálogo.",
    ],
  },
  announcement: {
    summary: "Consejos para la imagen",
    items: [
      "JPEG, PNG, WebP o GIF · máx. ~4 MB.",
      "Buena luz y fondo simple. Ideal ~1000 px de lado o más.",
    ],
  },
};

type Props = {
  variant?: Variant;
  className?: string;
};

export function PhotoTips({ variant = "product", className }: Props) {
  const tip = TIPS[variant];

  return (
    <details
      className={cn(
        "rounded-lg border border-border bg-muted/40 text-sm open:bg-muted/50",
        className,
      )}
    >
      <summary className="cursor-pointer select-none px-3 py-2 font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block size-1.5 shrink-0 rounded-full bg-sky"
          />
          {tip.summary}
        </span>
      </summary>
      <ul className="space-y-1.5 border-t border-border/60 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
        {tip.items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
