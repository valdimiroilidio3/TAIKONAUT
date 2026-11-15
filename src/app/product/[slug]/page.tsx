import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS, getProductBySlug, getGallery } from "@/lib/catalog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalDrawers } from "@/components/GlobalDrawers";
import { ProductDetailClient } from "@/components/ProductDetailClient";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: "Produto não encontrado · TAIKONAUT" };
  }

  const title = `${product.name} — € ${product.priceEur.toFixed(
    2
  )} | TAIKONAUT Maputo`;
  const description = product.taglinePt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: getGallery(product).map(img => ({ url: img.src, alt: img.altPt })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: getGallery(product).map(img => img.src),
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.descriptionPt,
    image: getGallery(product).map((g) => `https://www.taikonautmaputo.com${g.src}`),
    brand: {
      "@type": "Brand",
      name: "TAIKONAUT",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: product.priceEur.toFixed(2),
      availability: product.soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      url: `https://www.taikonautmaputo.com/product/${product.slug}`,
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Navbar />
      <main id="main-content" className="flex-1">
        <ProductDetailClient product={product} />
      </main>
      <Footer />
      <GlobalDrawers />
    </div>
  );
}
