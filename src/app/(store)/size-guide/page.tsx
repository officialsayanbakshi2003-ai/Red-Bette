import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { SIZE_CHART, SizeTable } from "@/components/product/SizeGuide";

export const metadata: Metadata = { title: "Size guide", description: "Red Betta size charts for hoodies, oversized tees and joggers." };

export default function SizeGuidePage() {
  return (
    <ContentPage
      eyebrow="Fit"
      title="Size"
      accent="guide"
      intro="All measurements are of the garment laid flat, in inches. Our hoodies and tees are cut oversized. For a regular fit, size down one."
    >
      <div className="space-y-12">
        <SizeTable chart={SIZE_CHART.hoodies} />
        <SizeTable chart={SIZE_CHART.tees} />
        <SizeTable chart={SIZE_CHART.joggers} />
        <div className="border border-line bg-coal p-6 text-sm leading-relaxed text-mist">
          <p className="mb-2 font-display font-semibold uppercase tracking-[0.15em] text-bone">How to measure</p>
          <p>
            Lay your favourite hoodie or tee flat. Measure chest straight across, 2.5 cm below the armpits, and double it.
            Measure length from the highest point of the shoulder to the hem. Compare with the chart above.
          </p>
        </div>
      </div>
    </ContentPage>
  );
}
