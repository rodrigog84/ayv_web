import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Announcement } from "@/lib/types";
import { cn } from "@/lib/utils";

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function AnnouncementCard({
  announcement,
  className,
}: {
  announcement: Announcement;
  className?: string;
}) {
  const hasCta = Boolean(announcement.ctaLabel && announcement.ctaUrl);
  const ctaUrl = announcement.ctaUrl || "";
  const external = isExternalUrl(ctaUrl);

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/80 bg-background shadow-none",
        announcement.pinned && "border-sky/50 ring-1 ring-sky/25",
        className,
      )}
    >
      {announcement.imageUrl ? (
        <div className="relative aspect-[4/3] w-full bg-muted">
          <Image
            src={announcement.imageUrl}
            alt={announcement.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : null}
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {announcement.pinned ? (
            <Badge className="bg-sky text-white hover:bg-sky">Destacado</Badge>
          ) : null}
          {announcement.eventDateTime ? (
            <span className="text-xs font-medium uppercase tracking-wide text-sky">
              {announcement.eventDateTime}
            </span>
          ) : null}
        </div>
        <CardTitle className="font-heading text-xl leading-snug">
          {announcement.title}
        </CardTitle>
        {announcement.body ? (
          <CardDescription className="text-sm leading-relaxed text-charcoal">
            {announcement.body}
          </CardDescription>
        ) : null}
      </CardHeader>
      {hasCta ? (
        <CardFooter>
          <Button
            asChild
            className="bg-sky text-white hover:bg-sky/90"
            size="sm"
          >
            {external ? (
              <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                {announcement.ctaLabel}
              </a>
            ) : (
              <Link href={ctaUrl}>{announcement.ctaLabel}</Link>
            )}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
