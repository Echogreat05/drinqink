import { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export function PageShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-40 pb-20">
        <div className="container mx-auto px-6 lg:px-10 max-w-5xl">
          {eyebrow && (
            <p className="text-xs tracking-widest uppercase text-primary mb-4">{eyebrow}</p>
          )}
          <h1 className="font-display text-5xl lg:text-7xl font-light leading-[1.05]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-12">{children}</div>}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
