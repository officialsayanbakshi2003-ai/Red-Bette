import type { Metadata } from "next";
import { ContentPage, Prose } from "@/components/ContentPage";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <ContentPage eyebrow="Legal" title="Privacy" accent="policy" intro={`Last updated: September 2026. ${siteConfig.name} is operated by ${siteConfig.parentBrand}.`}>
      <Prose>
        <p>
          This policy explains what personal information {siteConfig.name} (&quot;we&quot;, &quot;us&quot;) collects when you visit
          our store or place an order, how we use it and the choices you have. We process personal data in line with
          India&apos;s Digital Personal Data Protection Act, 2023.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Account details:</strong> your name, email address, phone number and a securely hashed password.</li>
          <li><strong>Order details:</strong> shipping address, items purchased, order value and payment status.</li>
          <li><strong>Payment details:</strong> handled entirely by Razorpay. We never receive or store card numbers, UPI PINs or bank credentials.</li>
          <li><strong>Messages:</strong> anything you send us through the contact form or by email.</li>
          <li><strong>Technical data:</strong> basic server logs (such as IP address) used to keep the store secure and prevent abuse.</li>
        </ul>
        <h2>How we use it</h2>
        <ul>
          <li>To process, ship and support your orders, and to send order and shipping updates.</li>
          <li>To run your account, wishlist and saved addresses.</li>
          <li>To send drop announcements, only if you subscribe. You can unsubscribe at any time.</li>
          <li>To detect fraud and keep the store secure.</li>
        </ul>
        <h2>Who we share it with</h2>
        <p>
          We share only what&apos;s needed with the partners who help us run the store: our payment processor (Razorpay),
          courier partners (for delivery), email delivery providers and hosting providers. We never sell your personal data.
        </p>
        <h2>Cookies</h2>
        <p>
          We use one essential cookie to keep you signed in, and your browser&apos;s local storage to remember your bag. We
          don&apos;t use advertising cookies.
        </p>
        <h2>Your rights</h2>
        <p>
          You can access, correct or delete your personal data, or withdraw consent for marketing, by emailing{" "}
          <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>. We keep order records for as long as
          tax and accounting laws require.
        </p>
      </Prose>
    </ContentPage>
  );
}
