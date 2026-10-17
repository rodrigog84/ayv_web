import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  generalWhatsAppMessage,
  whatsappUrl,
} from "@/lib/whatsapp";

export default function HomePage() {
  return (
    <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="animate-drift absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#f7fafc]/95 via-[#eef7fc]/88 to-[#33c3ff]/35" />
        <div className="animate-glow absolute -right-24 top-10 size-[28rem] rounded-full bg-sky/30 blur-3xl" />
        <div className="absolute -left-16 bottom-0 size-[22rem] rounded-full bg-white/50 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #4a5560 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
        <div className="animate-fade-up flex items-center gap-4">
          <Image
            src="/logo.jpg"
            alt="A & V Outlet"
            width={88}
            height={88}
            className="size-20 rounded-full object-cover shadow-[0_10px_40px_-12px_rgba(51,195,255,0.7)] ring-2 ring-white/80 sm:size-24"
            priority
          />
          <p className="font-heading text-4xl tracking-tight text-foreground sm:text-5xl md:text-6xl">
            A & V Outlet
          </p>
        </div>

        <h1 className="animate-fade-up-delay mt-8 max-w-2xl font-heading text-3xl leading-tight text-foreground sm:text-4xl md:text-5xl">
          Todo para tu hogar, sin rodeos
        </h1>
        <p className="animate-fade-up-delay-2 mt-4 max-w-xl text-base text-charcoal sm:text-lg">
          Catálogo seleccionado de productos para el hogar. Consulta por WhatsApp
          y te ayudamos a elegir.
        </p>

        <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="h-11 bg-sky px-5 text-base text-white hover:bg-sky/90"
          >
            <Link href="/catalogo">Ver catálogo</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 border-charcoal/25 bg-white/70 px-5 text-base backdrop-blur hover:bg-white"
          >
            <a
              href={whatsappUrl(generalWhatsAppMessage())}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
