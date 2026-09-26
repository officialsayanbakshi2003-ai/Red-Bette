import { AtSign, Clock, Mail, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { ContactForm } from "@/components/forms/ContactForm";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Contact us", description: "Get in touch with the Red Betta team." };

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact"
      title="Talk to"
      accent="us"
      intro="Questions about an order, sizing or a collab? Drop us a message and a real person will reply within 24 hours on working days."
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_260px]">
        <ContactForm />
        <ul className="space-y-6 text-sm">
          <li className="flex gap-3">
            <Mail className="size-4 shrink-0 text-blood" />
            <span>
              <span className="block text-mist">Email</span>
              <a href={`mailto:${siteConfig.supportEmail}`} className="hover:text-blood">{siteConfig.supportEmail}</a>
            </span>
          </li>
          <li className="flex gap-3">
            <AtSign className="size-4 shrink-0 text-blood" />
            <span>
              <span className="block text-mist">Instagram</span>
              <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-blood">@redbetta</a>
            </span>
          </li>
          <li className="flex gap-3">
            <Clock className="size-4 shrink-0 text-blood" />
            <span>
              <span className="block text-mist">Hours</span>
              Mon to Sat, 10am to 7pm IST
            </span>
          </li>
          <li className="flex gap-3">
            <MapPin className="size-4 shrink-0 text-blood" />
            <span>
              <span className="block text-mist">Based in</span>
              {siteConfig.address}
            </span>
          </li>
        </ul>
      </div>
    </ContentPage>
  );
}
