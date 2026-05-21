import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Sparkles,
  Truck,
  Shield,
  Star,
  Wine,
  Trophy,
  Users,
  Bot,
  Building,
  Beer,
  CupSoda,
  ChevronRight,
  Zap,
  Clock,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import heroImg from "@/assets/hero-bottles.jpg";
import cellarImg from "@/assets/cellar-collection.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DrinqInk — Nigeria's Universal Drinks Marketplace" },
      {
        name: "description",
        content:
          "From everyday beers, soft drinks, sodas, and water crates to premium cocktails and aged spirits — order from Nigeria's vetted drinks vendors.",
      },
      { property: "og:title", content: "DrinqInk — Nigeria's Universal Drinks Marketplace" },
      {
        property: "og:description",
        content: "Beers, soft drinks, cocktails, water, energy drinks, and premium spirits. Delivered cold and fast.",
      },
    ],
  }),
  component: Landing,
});

const CATEGORIES = [
  { name: "Beer & Cider", slug: "beer", count: "Cold crates & singles", glow: "hover-glow-beer" },
  { name: "Spirits & Liqueurs", slug: "spirits", count: "210+ top brands", glow: "hover-glow-beer" },
  { name: "Soft Drinks", slug: "soft-drinks", count: "Daily fizzy essentials", glow: "hover-glow-soda" },
  { name: "Water Crates", slug: "water", count: "Still & sparkling bulks", glow: "hover-glow-water" },
  { name: "Cocktail Packs", slug: "cocktail-packs", count: "Ready-to-pour mixers", glow: "hover-glow-cocktail" },
  { name: "Energy Drinks", slug: "energy-drinks", count: "Fierce focus & stamina", glow: "hover-glow-energy" },
  { name: "Juices & Nectars", slug: "juices", count: "100% natural picks", glow: "hover-glow-soda" },
  { name: "Custom Mixes", slug: "custom-mixes", count: "Build your dream crate", glow: "hover-glow-cocktail" },
  { name: "Wines & Champagnes", slug: "wine", count: "340+ vintage selections", glow: "hover-glow-wine" },
  { name: "The Cellar Vault", slug: "cellar", count: "Rare & collector editions", glow: "hover-glow-wine" },
];

const TESTIMONIALS = [
  {
    quote: "Managed drinks for our 200-guest beach party in under 10 minutes. The beer crates arrived ice-cold and on time. DrinqInk is a game-changer.",
    name: "Adaeze O.",
    role: "Event Planner, Lagos",
  },
  {
    quote: "We set up weekly automated water, soda, and beer deliveries for our tech hub. Saved hours of logistics and the team is always hydrated.",
    name: "Chuka E.",
    role: "Operations Lead, Yaba",
  },
  {
    quote: "Ordering wholesale inventory for our lounge used to require 5 different phone calls. Now it's one dashboard, split invoicing, and swift payouts.",
    name: "Lounge Manager",
    role: "Victoria Island",
  },
];

function Landing() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden">
      <SiteHeader />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="absolute inset-0">
          <img
            src={heroImg}
            alt="Premium drinks selection on dark marble"
            className="h-full w-full object-cover scale-105"
            width={1600}
            height={1200}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-onyx/60 to-onyx/90" />
          <div className="absolute inset-0 bg-[image:var(--gradient-radial-gold)] opacity-30" />
        </motion.div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card backdrop-blur-xl"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
              </motion.div>
              <span className="text-xs tracking-[0.2em] uppercase text-primary font-semibold">
                Nigeria's Universal Drinks Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] font-light tracking-tight"
            >
              Every drink,
              <br />
              <motion.span
                className="text-gradient-gold italic inline-block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                delivered cold & clear.
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed font-light"
            >
              From everyday beer crates and chilled office sodas, to ready-to-pour cocktail packs, hydration water bulks, and rare vintage collector malts — Nigeria's vetted drink suppliers, in one unified marketplace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 pt-6"
            >
              <Button asChild variant="hero" size="xl" className="group relative overflow-hidden">
                <Link to="/browse" className="relative z-10">
                  <span className="relative z-10">Explore Marketplace</span>
                  <ArrowRight className="ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                </Link>
              </Button>
              <Button asChild variant="ghost-gold" size="xl" className="group">
                <Link to="/how-it-works-vendors">
                  Sell on DrinqInk
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="grid grid-cols-3 gap-6 sm:gap-12 pt-10"
            >
              <PremiumStat n="500+" label="Vetted vendors" icon={Shield} />
              <PremiumStat n="36" label="States covered" icon={Award} />
              <PremiumStat n="24/7" label="Instant delivery" icon={Clock} />
            </motion.div>
          </motion.div>
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-10 w-20 h-20 rounded-full bg-primary/20 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 left-10 w-32 h-32 rounded-full bg-burgundy/20 blur-3xl"
        />
      </section>

      {/* CATEGORIES */}
      <section className="py-20 sm:py-24 lg:py-32 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
          >
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3 font-semibold">
                By category
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light max-w-xl leading-tight">
                Fully stocked for <span className="italic text-gradient-gold">every event</span> tonight.
              </h2>
            </div>
            <Button asChild variant="link" className="text-primary hidden sm:inline-flex group">
              <Link to="/categories">
                View all categories
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6"
          >
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link
                  to={cat.slug === "cellar" ? "/cellar" : "/categories/$slug"}
                  params={cat.slug === "cellar" ? undefined : { slug: cat.slug }}
                  className={`group relative overflow-hidden rounded-xl border border-border/50 bg-card aspect-[4/3] ${cat.glow} transition-all duration-500 hover:border-primary/50`}
                >
                  <motion.div className="absolute inset-0 bg-[image:var(--gradient-radial-gold)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative h-full p-4 sm:p-5 flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] sm:text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-semibold">
                        {cat.count}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-xl sm:text-2xl lg:text-3xl leading-tight">
                        {cat.name}
                      </h3>
                      <motion.div
                        className="mt-2 flex items-center gap-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={{ x: -10 }}
                        whileInView={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        Shop category <ArrowRight className="h-3 w-3" />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* DRINKS MARKETPLACE POWERHOUSES (Differentiators) */}
      <section className="py-20 sm:py-24 lg:py-32 bg-onyx/40 border-y border-border/50 relative overflow-hidden">
        <motion.div
          animate={{ x: [0, 100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-primary font-semibold">Advanced Features</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl font-light leading-tight">
              Not just delivery. <br />
              <span className="italic text-gradient-gold">Smart hospitality coordination.</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              We've engineered DrinqInk with robust features specifically built for hosts, event managers, corporate administrators, and social groups.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {[
              {
                icon: Bot,
                title: "DrinkBoard (AI Event Planner)",
                body: "Input your guest count, budget, and beverage split (alcoholic/non-alcoholic). Our AI algorithm instantly calculates exact crate counts, mixers, ice quantities, and matches you with vendors.",
                badge: "Revolutionary"
              },
              {
                icon: Users,
                title: "Group Order Event Pooling",
                body: "Planning a party? Launch a unified order link, send it to your guests, and let everyone add their favorite cold drinks. Settle the payment together or split the invoice seamlessly.",
                badge: "Lagos Favorite"
              },
              {
                icon: Building,
                title: "Corporate Team Portals",
                body: "Automate recurring beer crates, soft drink packs, and mineral water deliveries for your offices, hotels, or lounges. Set monthly spending controls, manager approvals, and invoice streams.",
                badge: "B2B Scale"
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 sm:p-8 rounded-xl border border-border/50 bg-card hover:border-primary/40 transition-all duration-300 flex flex-col justify-between h-full group relative overflow-hidden"
              >
                <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <feature.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-[9px] tracking-[0.15em] uppercase bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-semibold">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.body}</p>
                </div>
                <div className="relative z-10 mt-8 flex items-center gap-1.5 text-xs text-primary font-semibold group-hover:underline cursor-pointer">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* THE CELLAR PROMO */}
      <section className="py-20 sm:py-24 lg:py-32 relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/10 rounded-full blur-3xl"
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-primary/20 luxe-shadow group"
            >
              <img
                src={cellarImg}
                alt="Premium bottle collection"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                width={1200}
                height={800}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2 font-semibold">Collectible Vault</p>
                <p className="font-display text-2xl sm:text-3xl">The Cellar Vault</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6 sm:space-y-8"
            >
              <p className="text-xs tracking-[0.2em] uppercase text-primary font-semibold">Limited Provenance</p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl font-light leading-[1.05]">
                Rare bottles. <br />
                <span className="italic text-gradient-gold">Sommelier vetted.</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                An isolated, highly specialized wing for collectors and high-profile hosts. Hand-selected single malts, aged champagnes, and limited-edition vintages sourced directly from verified importers.
              </p>
              <ul className="space-y-3 sm:space-y-4">
                {[
                  "Vintage single-malts & rare spirits",
                  "Verified provenance & temperature logs",
                  "White-glove, insured white-glove transport",
                  "Sommelier consultation on demand",
                ].map((p, i) => (
                  <li key={p}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                      className="flex items-start gap-3 text-sm sm:text-base"
                    >
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span className="text-foreground/80">{p}</span>
                    </motion.div>
                  </li>
                ))}
              </ul>
              <Button asChild variant="hero" size="lg" className="group">
                <Link to="/cellar">
                  Enter the Cellar Vault
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 sm:py-24 lg:py-32 bg-onyx/40 relative overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 w-40 h-40 border border-primary/10 rounded-full"
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3 font-semibold">
              Order flow
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light">
              Drinks delivery, <span className="italic text-gradient-gold">streamlined</span>.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {[
              { icon: CupSoda, title: "1. Discover Vetted Vendors", body: "Filter by coverage areas, LGA zones, price range, or categories. Compare side-by-side drink prices instantly." },
              { icon: Sparkles, title: "2. Build Your Event Crate", body: "Pick pre-made host packages, construct custom mixed drink bundles, or let our AI planner generate quantities." },
              { icon: Truck, title: "3. Safe Escrow Delivery", body: "Vendor logs delivery slots. Watch status updates and crate progress. Funds are released only upon your proof-of-delivery." },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative p-6 sm:p-8 rounded-xl border border-border/50 bg-card hover:border-primary/40 transition-all duration-300 group"
              >
                <div className="absolute -top-3 left-6 sm:left-8 text-xs tracking-[0.15em] text-primary bg-background px-3 py-1 rounded-full border border-primary/20">
                  0{i + 1}
                </div>
                <s.icon className="h-8 w-8 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-display text-xl sm:text-2xl mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-16 sm:py-20 lg:py-24 border-y border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12"
          >
            {[
              {
                icon: Shield,
                title: "Escrow protected payments",
                body: "Your money is held in escrow until delivery is verified via photo confirmation.",
              },
              {
                icon: Star,
                title: "SipScore Ratings",
                body: "Not just star ratings. Vendors are evaluated on packaging, communication, delivery, and value.",
              },
              {
                icon: Trophy,
                title: "CAC & Health Verified",
                body: "All drink suppliers are vetted with commercial licenses and premium quality badges.",
              },
            ].map((trust, i) => (
              <motion.div
                key={trust.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-6 sm:p-8 rounded-xl border border-border/50 bg-card hover:border-primary/40 transition-all duration-300 group"
              >
                <trust.icon className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-display text-lg sm:text-xl mb-2">{trust.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{trust.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 sm:py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
          >
            <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3 font-semibold">
              Customer reviews
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-light">
              Trusted by hosts, hotels & <span className="italic text-gradient-gold">teams</span>.
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {TESTIMONIALS.map((t, i) => (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 sm:p-8 rounded-xl border border-border/50 bg-card hover:border-primary/40 transition-all duration-300 flex flex-col gap-6 group"
              >
                <div className="flex gap-1 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-current group-hover:scale-110 transition-transform duration-300"
                    />
                  ))}
                </div>
                <blockquote className="font-display text-lg sm:text-xl leading-snug text-foreground/90">
                  "{t.quote}"
                </blockquote>
                <figcaption className="text-sm mt-auto">
                  <div className="text-foreground font-semibold">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.role}</div>
                </figcaption>
              </motion.figure>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 lg:py-32 bg-onyx/40 relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-burgundy/10"
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-8 sm:p-12 lg:p-20 text-center"
          >
            <div className="absolute inset-0 bg-[image:var(--gradient-radial-gold)] opacity-40" />
            <div className="relative space-y-6 sm:space-y-8 max-w-2xl mx-auto">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-6xl font-light leading-tight">
                Your next event starts <br />
                <span className="italic text-gradient-gold">with a cold pour.</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Register as a customer for prompt hosting, or onboard as an approved drinks vendor in Nigeria today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild variant="hero" size="xl" className="group">
                  <Link to="/signup">
                    Create your account
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild variant="ghost-gold" size="xl" className="group">
                  <Link to="/browse">
                    Explore first
                    <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
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

function PremiumStat({ n, label, icon: Icon }: { n: string; label: string; icon: typeof Shield }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} className="text-center">
      <div className="relative inline-block mb-2">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        <Icon className="h-6 w-6 text-primary relative z-10 mx-auto" />
      </div>
      <div className="font-display text-2xl sm:text-3xl text-gradient-gold font-semibold">{n}</div>
      <div className="text-xs tracking-[0.15em] uppercase text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl text-primary">{n}</div>
      <div className="text-xs tracking-widest uppercase">{label}</div>
    </div>
  );
}

function Trust({ icon: Icon, title, body }: { icon: typeof Shield; title: string; body: string }) {
  return (
    <div className="flex items-start gap-4">
      <Icon className="h-7 w-7 text-primary shrink-0 mt-1" />
      <div>
        <h3 className="font-display text-xl mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
