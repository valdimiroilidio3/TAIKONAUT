import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ChapterNav } from "@/components/ChapterNav";
import { WorldChapter, DetailsChapter, MadeInMaputoBand } from "@/components/StoryChapters";
import { CollectionChapter } from "@/components/ShopCatalogSection";
import { LookbookAndSocialSection } from "@/components/LookbookAndSocialSection";
import { Footer } from "@/components/Footer";
import { GlobalDrawers } from "@/components/GlobalDrawers";
import { ScrollNarrative } from "@/components/ScrollNarrative";
import { getArrivalMedia } from "@/lib/media";

export default function HomePage(){
  const media=getArrivalMedia();
  return <>
    <Navbar cinematic/>
    <main id="main-content">
      <HeroSection media={media}/>
      <ChapterNav/>
      <WorldChapter/>
      <CollectionChapter/>
      <MadeInMaputoBand/>
      <DetailsChapter/>
      <LookbookAndSocialSection/>
    </main>
    <Footer/>
    <GlobalDrawers/>
    <ScrollNarrative/>
  </>;
}
