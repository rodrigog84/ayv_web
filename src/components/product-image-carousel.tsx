"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  alt: string;
  className?: string;
  children?: ReactNode;
};

export function ProductImageCarousel({
  images,
  alt,
  className,
  children,
}: Props) {
  const urls = images.length > 0 ? images : [];
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const count = urls.length;
  const safeIndex = count === 0 ? 0 : Math.min(index, count - 1);
  const current = urls[safeIndex];

  const go = useCallback(
    (next: number) => {
      if (count <= 1) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  if (!current) {
    return (
      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted lg:aspect-square",
          className,
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-3", className)}
      role="region"
      aria-roledescription="carrusel"
      aria-label={`Fotos de ${alt}`}
    >
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted lg:aspect-square"
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          if (start == null || count <= 1) return;
          const end = e.changedTouches[0]?.clientX ?? start;
          const delta = end - start;
          if (Math.abs(delta) < 40) return;
          go(safeIndex + (delta < 0 ? 1 : -1));
        }}
      >
        <Image
          key={current}
          src={current}
          alt={`${alt}${count > 1 ? ` — foto ${safeIndex + 1} de ${count}` : ""}`}
          fill
          priority={safeIndex === 0}
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          unoptimized={current.startsWith("/")}
        />
        {children}

        {count > 1 ? (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky sm:left-3"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                go(safeIndex - 1);
              }}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Foto siguiente"
              className="absolute right-2 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky sm:right-3"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                go(safeIndex + 1);
              }}
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2.5 py-1.5">
              {urls.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Ir a foto ${i + 1}`}
                  aria-current={i === safeIndex}
                  className={cn(
                    "size-2.5 rounded-full transition",
                    i === safeIndex ? "bg-sky" : "bg-white/70 hover:bg-white",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIndex(i);
                  }}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              aria-label={`Miniatura ${i + 1}`}
              aria-current={i === safeIndex}
              className={cn(
                "relative size-14 shrink-0 overflow-hidden rounded-lg border-2 bg-muted transition sm:size-16",
                i === safeIndex
                  ? "border-sky ring-1 ring-sky/40"
                  : "border-transparent opacity-80 hover:opacity-100",
              )}
              onClick={() => setIndex(i)}
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
                unoptimized={url.startsWith("/")}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
