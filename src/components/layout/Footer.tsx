import Link from "next/link";
import { RedWordmark } from "@/components/brand/Logo";
import { siteConfig } from "@/lib/config";
import { NewsletterForm } from "./NewsletterForm";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "Shop all" },
      { href: "/shop?tag=new", label: "New arrivals" },
      { href: "/shop?category=hoodies", label: "Hoodies" },
      { href: "/shop?category=oversized-tees", label: "Oversized tees" },
      { href: "/shop?category=accessories", label: "Accessories" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/contact", label: "Contact us" },
      { href: "/faq", label: "FAQ" },
      { href: "/shipping-returns", label: "Shipping & returns" },
      { href: "/size-guide", label: "Size guide" },
      { href: "/account/orders", label: "Track your order" },
    ],
  },
  {
    title: "Red Betta",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/privacy-policy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-coal">
      <div className="container-x grid grid-cols-1 gap-12 py-14 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-5">
          <p className="eyebrow">Join the school</p>
          <h2 className="display mt-3 text-3xl sm:text-4xl">
            First in line <span className="text-blood">for every drop.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
            Early access to limited releases, restocks and members-only offers. No spam, just the good stuff.
          </p>
          <NewsletterForm className="mt-6 max-w-md" />
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-bone/75 transition-colors hover:text-bone">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-3">
            <p className="eyebrow mb-3">Get in touch</p>
            <p className="text-sm text-bone/75">
              <a href={`mailto:${siteConfig.supportEmail}`} className="hover:text-bone">
                {siteConfig.supportEmail}
              </a>
              <span className="mx-2 text-ash">·</span>
              <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-bone">
                Instagram
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="container-x overflow-hidden" aria-hidden="true">
        <div className="flex items-end gap-[3vw] pb-6">
          <RedWordmark className="h-auto w-[55%] text-blood/95" />
          <span className="pb-[1.2vw] font-display text-[5.2vw] font-light leading-none tracking-[0.35em] text-bone/90">
            BETTA
          </span>
        </div>
        <p className="pb-8 font-display text-[0.7rem] uppercase tracking-[0.4em] text-mist sm:text-xs">
          {siteConfig.parentLine}
        </p>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-ash sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. {siteConfig.parentLine}. All rights reserved.
          </p>
          <p className="flex flex-wrap gap-x-3 gap-y-1">
            <span>UPI</span>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>RuPay</span>
            <span>Net Banking</span>
            <span>Cash on Delivery</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
