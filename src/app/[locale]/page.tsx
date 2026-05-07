import { Hero } from "@/components/sections/Hero";
import { EditorsNote } from "@/components/sections/EditorsNote";
import { NeighborhoodsPreview } from "@/components/sections/NeighborhoodsPreview";
import { Ceremony } from "@/components/sections/Ceremony";
import { Host } from "@/components/sections/Host";
import { ReserveBlock } from "@/components/sections/ReserveBlock";

export default function HomePage() {
  return (
    <>
      <Hero />
      <EditorsNote />
      <NeighborhoodsPreview />
      <Ceremony />
      <Host />
      <ReserveBlock />
    </>
  );
}
