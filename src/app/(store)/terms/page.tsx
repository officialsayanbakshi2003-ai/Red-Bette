import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, Prose } from "@/components/ContentPage";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <ContentPage eyebrow="Legal" title="Terms of" accent="service" intro="Last updated: September 2026.">
      <Prose>
        <p>
          These terms apply to your use of the {siteConfig.name} online store, operated by {siteConfig.parentBrand}. By
          placing an order you agree to them.
        </p>
        <h2>Orders & pricing</h2>
        <ul>
          <li>All prices are in Indian Rupees and include applicable taxes.</li>
          <li>An order is confirmed once payment succeeds, or once a cash on delivery order is placed.</li>
          <li>We may cancel an order if an item is unavailable, a price is clearly wrong, or we suspect fraud. If you have paid, you&apos;ll receive a full refund.</li>
          <li>Coupons can&apos;t be combined unless stated, have no cash value, and may carry minimum order values or expiry dates.</li>
        </ul>
        <h2>Products</h2>
        <p>
          We work hard to show colours and prints accurately, but screens vary. Small variations in print placement are a
          natural part of screen printing and are not defects.
        </p>
        <h2>Shipping, returns & refunds</h2>
        <p>
          See our <Link href="/shipping-returns">shipping and returns policy</Link>.
        </p>
        <h2>Intellectual property</h2>
        <p>
          The {siteConfig.name} name, logo, artwork and site content belong to {siteConfig.parentBrand} and may not be
          copied or used without written permission.
        </p>
        <h2>Accounts</h2>
        <p>
          Keep your password safe. You&apos;re responsible for activity on your account. Tell us straight away if you think
          someone else has accessed it.
        </p>
        <h2>Governing law</h2>
        <p>These terms are governed by the laws of India, and courts in Kolkata, West Bengal have jurisdiction.</p>
        <h2>Contact</h2>
        <p>
          Questions? Email <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
        </p>
      </Prose>
    </ContentPage>
  );
}
