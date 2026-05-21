import { Link } from "@tanstack/react-router";
import {
  GlassWater,
  Instagram,
  Twitter,
  Facebook,
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-onyx mt-20 sm:mt-32 relative overflow-hidden">
      <motion.div
        animate={{ x: [0, 100, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 relative z-10">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-4 sm:space-y-6"
          >
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <GlassWater className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </motion.div>
              <span className="font-display text-xl sm:text-2xl font-semibold tracking-tight">
                Drinq<span className="text-gradient-gold">Ink</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Nigeria's universal drinks marketplace. Beer, soft drinks, water crates, spirits,
              cocktails, and rare vintages — delivered from vetted local vendors.
            </p>
            <div className="flex gap-3 pt-2">
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </motion.a>
            </div>
            <div className="space-y-2 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>hello@drinqink.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+234 XXX XXX XXXX</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <FooterCol
              title="Discover"
              links={[
                { to: "/browse", label: "Browse" },
                { to: "/categories", label: "Categories" },
                { to: "/cellar", label: "The Cellar" },
                { to: "/flash-deals", label: "Flash Deals" },
              ]}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <FooterCol
              title="Company"
              links={[
                { to: "/about", label: "About" },
                { to: "/how-it-works", label: "How it works" },
                { to: "/how-it-works-vendors", label: "For vendors" },
                { to: "/blog", label: "Drink culture" },
              ]}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <FooterCol
              title="Support"
              links={[
                { to: "/contact", label: "Contact" },
                { to: "/faq", label: "FAQ" },
                { to: "/signup", label: "Become a vendor" },
              ]}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 sm:mt-16 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DrinqInk. Drink responsibly. 18+ only.
          </p>
          <p className="text-xs text-muted-foreground">Made with grace in Lagos.</p>
        </motion.div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-display text-base sm:text-lg mb-4 sm:mb-6 text-primary">{title}</h4>
      <ul className="space-y-2.5 sm:space-y-3">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-sm text-muted-foreground hover:text-primary transition-colors relative group inline-block"
            >
              {l.label}
              <motion.span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
