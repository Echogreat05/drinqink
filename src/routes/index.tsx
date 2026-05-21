import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Truck, Shield, Star, Wine, Trophy, Users, Bot, Building, Beer, CupSoda } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
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
  return (
    <div className="min-h-screen font-sans">
      <SiteHeader />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Premium drinks selection on dark marble"
            className="h-full w-full object-cover opacity-35"
            width={1600}
            height={1200}
          />
          <div className="absolute inset-0 bg-[image:var(--gradient-overlay)]" />
          <div className="absolute inset-0 bg-onyx/30" />
        </div>

        <div className="relative z-10 container mx-auto px-6 lg:px-10 py-20">
          <div className="max-w-3xl space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs tracking-widest uppercase text-primary font-semibold">
                Nigeria's Universal Drinks Platform
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] font-light">
              Every drink,
              <br />
              <span className="text-gradient-gold italic">delivered cold & clear.</span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed">
              From everyday beer crates and chilled office sodas, to ready-to-pour cocktail packs, hydration water bulks, and rare vintage collector malts — Nigeria's vetted drink suppliers, in one unified marketplace.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/browse">
                  Explore Marketplace <ArrowRight className="ml-1" />
                </Link>
              </Button>
              <Button asChild variant="ghost-gold" size="xl">
                <Link to="/how-it-works-vendors">Sell on DrinqInk</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-8 pt-8 text-sm text-muted-foreground">
              <Stat n="500+" label="Vetted vendors" />
              <Stat n="36" label="States covered" />
              <Stat n="24/7" label="Instant & Slot delivery" />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs tracking-widest uppercase text-primary mb-3">By category</p>
              <h2 className="font-display text-4xl lg:text-5xl font-light max-w-xl">
                Fully stocked for <span className="italic text-gradient-gold">every event</span> tonight.
              </h2>
            </div>
            <Button asChild variant="link" className="text-primary hidden sm:inline-flex">
              <Link to="/categories">View all categories <ArrowRight /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.slug}
                to={cat.slug === "cellar" ? "/cellar" : "/categories/$slug"}
                params={cat.slug === "cellar" ? undefined : { slug: cat.slug }}
                className={`group relative overflow-hidden rounded-lg border border-border bg-card aspect-[4/3] ${cat.glow} transition-all duration-500`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="absolute inset-0 bg-[image:var(--gradient-radial-gold)] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-full p-5 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">{cat.count}</p>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl lg:text-3xl leading-tight">{cat.name}</h3>
                    <div className="mt-2 flex items-center gap-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Shop category <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DRINKS MARKETPLACE POWERHOUSES (Differentiators) */}
      <section className="py-24 lg:py-32 bg-onyx/40 border-y border-border/50">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <p className="text-xs tracking-widest uppercase text-primary font-semibold">Advanced Features</p>
            <h2 className="font-display text-4xl lg:text-6xl font-light">
              Not just delivery. <br />
              <span className="italic text-gradient-gold">Smart hospitality coordination.</span>
            </h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              We've engineered DrinqInk with robust features specifically built for hosts, event managers, corporate administrators, and social groups.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
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
            ].map((feature) => (
              <div key={feature.title} className="p-8 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors flex flex-col justify-between h-full group relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <feature.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-[9px] tracking-wider uppercase bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-semibold">{feature.badge}</span>
                  </div>
                  <h3 className="font-display text-2xl mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.body}</p>
                </div>
                <div className="mt-8 flex items-center gap-1.5 text-xs text-primary font-semibold group-hover:underline cursor-pointer">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE CELLAR PROMO */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden border border-primary/20 luxe-shadow">
              <img
                src={cellarImg}
                alt="Premium bottle collection"
                className="h-full w-full object-cover"
                loading="lazy"
                width={1200}
                height={800}
              />
              <div className="absolute inset-0 bg-[image:var(--gradient-overlay)]" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs tracking-widest uppercase text-primary mb-2">Collectible Vault</p>
                <p className="font-display text-3xl">The Cellar Vault</p>
              </div>
            </div>

            <div className="space-y-8">
              <p className="text-xs tracking-widest uppercase text-primary font-semibold">Limited Provenance</p>
              <h2 className="font-display text-4xl lg:text-6xl font-light leading-[1.05]">
                Rare bottles. <br />
                <span className="italic text-gradient-gold">Sommelier vetted.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                An isolated, highly specialized wing for collectors and high-profile hosts. Hand-selected single malts, aged champagnes, and limited-edition vintages sourced directly from verified importers.
              </p>
              <ul className="space-y-3">
                {[
                  "Vintage single-malts & rare spirits",
                  "Verified provenance & temperature logs",
                  "White-glove, insured white-glove transport",
                  "Sommelier consultation on demand",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                    <span className="text-foreground/80">{p}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="hero" size="lg">
                <Link to="/cellar">Enter the Cellar Vault <ArrowRight /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 lg:py-32 bg-onyx/40">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Order flow</p>
            <h2 className="font-display text-4xl lg:text-5xl font-light">
              Drinks delivery, <span className="italic text-gradient-gold">streamlined</span>.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { icon: CupSoda, title: "1. Discover Vetted Vendors", body: "Filter by coverage areas, LGA zones, price range, or categories. Compare side-by-side drink prices instantly." },
              { icon: Sparkles, title: "2. Build Your Event Crate", body: "Pick pre-made host packages, construct custom mixed drink bundles, or let our AI planner generate quantities." },
              { icon: Truck, title: "3. Safe Escrow Delivery", body: "Vendor logs delivery slots. Watch status updates and crate progress. Funds are released only upon your proof-of-delivery." },
            ].map((s, i) => (
              <div key={s.title} className="relative p-8 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors group">
                <div className="absolute -top-3 left-8 text-xs tracking-widest text-primary bg-background px-3">
                  0{i + 1}
                </div>
                <s.icon className="h-8 w-8 text-primary mb-6" />
                <h3 className="font-display text-2xl mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-24 border-y border-border/50">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-3 gap-12">
            <Trust icon={Shield} title="Escrow protected payments" body="Your money is held in escrow until delivery is verified via photo confirmation." />
            <Trust icon={Star} title="SipScore Ratings" body="Not just star ratings. Vendors are evaluated on packaging, communication, delivery, and value." />
            <Trust icon={Trophy} title="CAC & Health Verified" body="All drink suppliers are vetted with commercial licenses and premium quality badges." />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 lg:py-32">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs tracking-widest uppercase text-primary mb-3">Customer reviews</p>
            <h2 className="font-display text-4xl lg:text-5xl font-light">
              Trusted by hosts, hotels & <span className="italic text-gradient-gold">teams</span>.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="p-8 rounded-lg border border-border bg-card flex flex-col gap-6">
                <div className="flex gap-1 text-primary">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="font-display text-xl leading-snug">"{t.quote}"</blockquote>
                <figcaption className="text-sm mt-auto">
                  <div className="text-foreground">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-onyx/40">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-12 lg:p-20 text-center">
            <div className="absolute inset-0 bg-[image:var(--gradient-radial-gold)] opacity-40" />
            <div className="relative space-y-6 max-w-2xl mx-auto">
              <h2 className="font-display text-4xl lg:text-6xl font-light leading-tight">
                Your next event starts <br />
                <span className="italic text-gradient-gold">with a cold pour.</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Register as a customer for prompt hosting, or onboard as an approved drinks vendor in Nigeria today.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Button asChild variant="hero" size="xl">
                  <Link to="/signup">Create your account</Link>
                </Button>
                <Button asChild variant="ghost-gold" size="xl">
                  <Link to="/browse">Explore first</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
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
