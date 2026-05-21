import { Link } from "@tanstack/react-router";
import { GlassWater, Instagram, Twitter, Facebook } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-onyx mt-32">
      <div className="container mx-auto px-6 lg:px-10 py-16">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <GlassWater className="h-6 w-6 text-primary" />
              <span className="font-display text-2xl font-semibold">
                Drinq<span className="text-gradient-gold">Ink</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Nigeria's universal drinks marketplace. Beer, soft drinks, water crates,
              spirits, cocktails, and rare vintages — delivered from vetted local vendors.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <FooterCol title="Discover" links={[
            { to: "/browse", label: "Browse" },
            { to: "/categories", label: "Categories" },
            { to: "/cellar", label: "The Cellar" },
            { to: "/flash-deals", label: "Flash Deals" },
          ]} />

          <FooterCol title="Company" links={[
            { to: "/about", label: "About" },
            { to: "/how-it-works", label: "How it works" },
            { to: "/how-it-works-vendors", label: "For vendors" },
            { to: "/blog", label: "Drink culture" },
          ]} />

          <FooterCol title="Support" links={[
            { to: "/contact", label: "Contact" },
            { to: "/faq", label: "FAQ" },
            { to: "/signup", label: "Become a vendor" },
          ]} />
        </div>

        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DrinqInk. Drink responsibly. 18+ only.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with grace in Lagos.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-display text-lg mb-4 text-primary">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
