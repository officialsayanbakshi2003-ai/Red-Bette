import { StorefrontMediaEditor } from "@/components/admin/StorefrontMediaEditor";
import { AdminHeader } from "@/components/admin/ui";
import { MEDIA_SLOTS, type MediaSlot } from "@/lib/media";
import { getStorefrontMedia } from "@/lib/site-media";

export const metadata = { title: "Storefront" };

export default async function StorefrontPage() {
  const media = await getStorefrontMedia();
  return (
    <div>
      <AdminHeader
        title="Storefront images"
        description="Replace the banner and lifestyle photos across the store. Changes go live immediately."
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(MEDIA_SLOTS) as MediaSlot[]).map((slot) => (
          <StorefrontMediaEditor
            key={slot}
            slot={slot}
            label={MEDIA_SLOTS[slot].label}
            hint={MEDIA_SLOTS[slot].hint}
            photo={media[slot]}
            isCustom={media[slot].src !== MEDIA_SLOTS[slot].photo.src}
          />
        ))}
      </div>
    </div>
  );
}
