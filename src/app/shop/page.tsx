import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { ShopAll } from "@/components/ShopCatalogSection";
import { Footer } from "@/components/Footer";
import { GlobalDrawers } from "@/components/GlobalDrawers";
import { ScrollNarrative } from "@/components/ScrollNarrative";

export const metadata: Metadata={title:"The Collection",description:"O catálogo Taikonaut. MAP Jackets, Signature Hoodies, Tees, Taikosunnies e acessórios. Streetwear de Maputo, Moçambique.",alternates:{canonical:"/shop"}};

export default function ShopPage(){
  return <><Navbar/><main id="main-content"><ShopAll/></main><Footer/><GlobalDrawers/><ScrollNarrative/></>;
}
