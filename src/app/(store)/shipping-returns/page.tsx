import type { Metadata } from "next";
import { ContentPage, Prose } from "@/components/ContentPage";
import { commerce, siteConfig } from "@/lib/config";
import { formatINR } from "@/lib/money";

export const metadata: Metadata = { title: "Shipping & returns", description: "Red Betta shipping times, charges, returns and exchanges." };

export default function ShippingReturnsPage() {
  return (
    <ContentPage eyebrow="Policies" title="Shipping &" accent="returns">
      <Prose>
        <h2>Shipping</h2>
        <ul>
          <li>We ship across India. Orders are packed and dispatched within 24 to 48 hours (excluding Sundays and public holidays).</li>
          <li>Delivery takes 3 to 5 working days for metro cities and 5 to 7 working days elsewhere.</li>
          <li>
            Shipping is <strong>free</strong> on orders over {formatINR(commerce.freeShippingThreshold)}. Otherwise a flat{" "}
            {formatINR(commerce.shippingFee)} applies.
          </li>
          <li>
            Cash on delivery is available on orders up to {formatINR(commerce.codMaxOrderValue)}, with a {formatINR(commerce.codFee)} handling fee.
          </li>
          <li>You&apos;ll receive a tracking number by email once your order ships. You can also see it in your account.</li>
        </ul>

        <h2>Returns & exchanges</h2>
        <ul>
          <li>
            You can request a return or size exchange within <strong>{commerce.returnWindowDays} days</strong> of delivery.
          </li>
          <li>Items must be unworn, unwashed and have their original tags and packaging.</li>
          <li>Limited-edition pieces and items bought on final sale can be exchanged for size but not returned.</li>
          <li>
            To start a return, email <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a> with your
            order number and the item you&apos;d like to return. We&apos;ll arrange a reverse pickup where available.
          </li>
        </ul>

        <h2>Refunds</h2>
        <ul>
          <li>Once we receive and check your return, refunds are issued within 2 working days.</li>
          <li>Online payments are refunded to the original payment method and usually reflect in 5 to 7 working days.</li>
          <li>COD orders are refunded by bank transfer or UPI to details you share with us.</li>
          <li>Shipping and COD fees are non-refundable unless the item arrived damaged or incorrect.</li>
        </ul>

        <h2>Damaged or wrong item?</h2>
        <p>
          We&apos;re sorry. Email us within 48 hours of delivery with photos of the item and packaging, and we&apos;ll send a
          replacement or a full refund, shipping included.
        </p>
      </Prose>
    </ContentPage>
  );
}
