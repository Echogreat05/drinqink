import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Crown, ShieldCheck, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import cellarImg from "@/assets/cellar-collection.jpg";

export const Route = createFileRoute("/cellar")({
  head: () => ({
    meta: [
      { title: "The Cellar Vault — Rare & Premium | DrinqInk" },
      {
        name: "description",
        content:
          "Hand-picked rare bottles, vintages, and limited releases for the discerning collector.",
      },
      { property: "og:title", content: "The Cellar Vault — DrinqInk" },
      { property: "og:description", content: "Hand-picked rare bottles and vintages." },
    ],
  }),
  component: CellarPage,
});

function CellarPage() {
  return (
    <div className="min-h-screen font-editorial bg-gradient-to-b from-background via-accent/5 to-background text-[#fbfaf7]">
      <SiteHeader />

      {/* HERO SECTION - HIGH LUXURY EDITORIAL */}
      <section className="pt-24 relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 h-[85vh]"
        >
          <img
            src={cellarImg}
            alt="Noble bottles aging gracefully"
            className="h-full w-full object-cover opacity-30 select-none scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-onyx/40 via-background/70 to-background" />
        </motion.div>

        <div className="relative container mx-auto px-6 lg:px-10 py-28 lg:py-48">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md"
            >
              <Crown className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-primary font-sans font-semibold">
                By Invitation & Allocation
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-6xl sm:text-7xl lg:text-9xl font-light leading-[0.9] tracking-tight"
            >
              The <span className="italic text-gradient-gold">Cellar</span> Room.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl lg:text-3xl text-muted-foreground max-w-2xl leading-relaxed font-light italic text-cream/90"
            >
              A dedicated wing for curators, connoisseurs, and high-profile hosts. Hand-selected single malts, prestige champagnes, and limited-edition vintages — stored in
              perfect dark provenance and delivered with white-glove ceremony.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap gap-4 pt-4 font-sans"
            >
              <Button asChild variant="hero" size="xl" className="group">
                <Link to="/browse">
                  Request Allocation{" "}
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CURATOR'S ACCREDITATION */}
      <section className="py-24 lg:py-36 border-t border-border/30 bg-onyx/30">
        <div className="container mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mb-20 space-y-4"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-primary font-sans font-bold">
              Provenance Guard
            </p>
            <h2 className="text-4xl lg:text-5xl font-light">
              Undisputed origin.{" "}
              <span className="italic text-gradient-gold">Uncompromised travel.</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed font-sans">
              Unlike everyday drinks, collector bottles require meticulous temperature controls, professional validation, and absolute security from source to goblet.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Crown,
                title: "Sommelier Vetted Profiles",
                body: "Every single malt and prestige champagne undergoes physical seal verification by a certified specialist before placement.",
              },
              {
                icon: ShieldCheck,
                title: "Guaranteed Temperature Logs",
                body: "Our high-end logistics partners utilize transit cases with continuous temperature recorders to guarantee structural purity.",
              },
              {
                icon: Sparkles,
                title: "Exclusive Private Portfolios",
                body: "Gain early access to seasonal importer releases, custom case packings, and personal advisory consultations for hosting gala functions.",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-10 rounded-lg border border-primary/20 bg-card/60 backdrop-blur-sm shadow-card hover:border-primary/45 transition-colors duration-500 group"
              >
                <f.icon className="h-8 w-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl mb-3 font-normal">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-sans font-light">
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LUXURY EDITORIAL CALLOUT */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-2xl border border-primary/20 bg-card/40 p-12 lg:p-24 max-w-5xl mx-auto text-center space-y-8 glass-card luxe-shadow"
          >
            <div className="absolute inset-0 bg-[image:var(--gradient-radial-gold)] opacity-35" />
            <div className="relative space-y-6">
              <span className="text-[10px] tracking-[0.2em] uppercase text-primary font-sans font-semibold">
                Specialist Vetting
              </span>
              <h2 className="text-4xl lg:text-6xl font-light italic leading-tight">
                "Wine and spirits are the liquid ink <br />
                of human culture."
              </h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto font-sans leading-relaxed font-light">
                Discover select single barrels of Scotch, rare Cognac reserves, and vintage champagne labels directly shipped and held in escrow for your security.
              </p>
              <div className="pt-6 font-sans">
                <Button asChild variant="ghost-gold" size="lg">
                  <Link to="/browse">Explore Vault Catalogue</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
