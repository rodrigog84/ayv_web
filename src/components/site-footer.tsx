import Image from "next/image";
import Link from "next/link";
import { INSTAGRAM_URL, WHATSAPP_DISPLAY, whatsappUrl, generalWhatsAppMessage } from "@/lib/whatsapp";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-soft">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="A & V Outlet"
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
          />
          <div>
            <p className="font-heading text-base text-foreground">A & V Outlet</p>
            <p className="text-sm text-muted-foreground">Productos para el hogar</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-6">
          <a
            href={whatsappUrl(generalWhatsAppMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-sky"
          >
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-sky"
          >
            Instagram @ayvoutlet
          </a>
          <Link href="/admin" className="transition-colors hover:text-foreground">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
