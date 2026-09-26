import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/ContentPage";
import { commerce, siteConfig } from "@/lib/config";
import { formatINR } from "@/lib/money";

export const metadata: Metadata = { title: "FAQ", description: "Answers to common questions about Red Betta orders, sizing, shipping and returns." };

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "How do Red Betta pieces fit?",
    a: (
      <>
        Our hoodies and tees are cut oversized with dropped shoulders. Take your usual size for the intended relaxed
        look, or size down once for a closer fit. Every product has a size guide, and there&apos;s a full chart on our{" "}
        <Link href="/size-guide">size guide page</Link>.
      </>
    ),
  },
  {
    q: "How long does delivery take?",
    a: "Orders ship within 24 to 48 hours. Metro cities usually receive them in 3 to 5 working days, and the rest of India in 5 to 7 working days. You will get tracking details by email as soon as your order ships.",
  },
  {
    q: "How much is shipping?",
    a: `Shipping is free on orders over ${formatINR(commerce.freeShippingThreshold)}. Below that, a flat ${formatINR(commerce.shippingFee)} applies anywhere in India.`,
  },
  {
    q: "Do you offer cash on delivery?",
    a: `Yes, on orders up to ${formatINR(commerce.codMaxOrderValue)}. A small ${formatINR(commerce.codFee)} handling fee applies to COD orders.`,
  },
  {
    q: "Which payment methods do you accept?",
    a: "UPI (GPay, PhonePe, Paytm and others), all major debit and credit cards, net banking and popular wallets, processed securely by Razorpay. We never see or store your card details.",
  },
  {
    q: "Can I return or exchange something?",
    a: (
      <>
        Yes. You can return or exchange unworn items with tags within {commerce.returnWindowDays} days of delivery. See our{" "}
        <Link href="/shipping-returns">shipping and returns policy</Link> for the details.
      </>
    ),
  },
  {
    q: "How do I care for my hoodie?",
    a: "Turn it inside out, machine wash cold with similar colours and let it dry flat or on a hanger. Don't tumble dry or iron directly on the print. That keeps the print sharp for years.",
  },
  {
    q: "Will you restock sold-out designs?",
    a: "Some essentials come back, but limited pieces usually don't. Join our list at the bottom of the page to hear about restocks and new drops first.",
  },
  {
    q: "I need help with my order.",
    a: (
      <>
        Email <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a> with your order number (it starts
        with RB) or use our <Link href="/contact">contact form</Link>. We reply within 24 hours on working days.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <ContentPage eyebrow="Help" title="Frequently" accent="asked" intro="Everything you need to know before, during and after your order.">
      <div className="divide-y divide-line border-y border-line">
        {FAQS.map((f) => (
          <details key={f.q} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-base font-semibold tracking-wide [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="size-4 shrink-0 text-mist transition-transform group-open:rotate-180" />
            </summary>
            <div className="pb-6 text-sm leading-relaxed text-mist [&_a]:text-bone [&_a]:underline [&_a]:underline-offset-4">{f.a}</div>
          </details>
        ))}
      </div>
    </ContentPage>
  );
}
