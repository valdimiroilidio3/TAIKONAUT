import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { SITE_CONFIG } from "@/lib/catalog";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.taikonautmaputo.com"),
  title: {
    default: "Taikonaut — Streetwear from Maputo, Mozambique",
    template: "%s — Taikonaut",
  },
  description:
    "Streetwear de Maputo que explora a cultura pop e o imaginário de Moçambique. Day & Night Map Jackets, Signature Hoodies, Taikosunnies e The Homecoming Pop-Up — 12 Dez, Restaurante Spazio.",
  keywords: [
    "Taikonaut",
    "Taikonaut Maputo",
    "Streetwear Moçambique",
    "Afro-futurismo",
    "Day Map Jacket",
    "Night Map Jacket",
    "Moda Africana Contemporânea",
    "Maputo Pop-Up",
  ],
  openGraph: {
    title: "TAIKONAUT® — Born in Maputo",
    description:
      "Explora a nova loja Taikonaut e garante presença no THE HOMECOMING POP-UP — Sábado, 12 Dezembro no Restaurante Spazio, Maputo.",
    url: "https://www.taikonautmaputo.com",
    siteName: "TAIKONAUT",
    locale: "pt_MZ",
    type: "website",
    images: [
      {
        url: "/images/campaigns/arrival/social.webp",
        width: 1200,
        height: 630,
        alt: "Taikonaut — Mozdrian Sweater, fotografia do arquivo da marca",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TAIKONAUT® — Born in Maputo",
    description:
      "THE HOMECOMING POP-UP · 12 DEZ · Restaurante Spazio, Maputo · 12:00–19:00.",
    images: ["/images/campaigns/arrival/social.webp"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA4_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ClothingStore",
        name: "TAIKONAUT",
        url: "https://www.taikonautmaputo.com",
        image: "https://www.taikonautmaputo.com/images/campaigns/arrival/social.webp",
        sameAs: [SITE_CONFIG.store.instagramUrl],
        address: {
          "@type": "PostalAddress",
          streetAddress: "Av. Paulo Samuel Kankhomba 578",
          addressLocality: "Maputo",
          addressCountry: "MZ",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: SITE_CONFIG.store.latitude,
          longitude: SITE_CONFIG.store.longitude,
        },
        priceRange: "€€",
      },
      {
        "@type": "Event",
        name: `TAIKONAUT — ${SITE_CONFIG.popupEvent.title}`,
        startDate: "2026-12-12T12:00:00+02:00",
        endDate: "2026-12-12T19:00:00+02:00",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: SITE_CONFIG.popupEvent.venueName,
          address: {
            "@type": "PostalAddress",
            streetAddress: SITE_CONFIG.popupEvent.address,
            addressLocality: "Maputo",
            addressCountry: "MZ",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: SITE_CONFIG.popupEvent.latitude,
            longitude: SITE_CONFIG.popupEvent.longitude,
          },
        },
        description: SITE_CONFIG.popupEvent.subtitlePt,
        organizer: {
          "@type": "Organization",
          name: "TAIKONAUT Maputo",
          url: "https://www.taikonautmaputo.com",
        },
      },
    ],
  };

  return (
    <html lang="pt-MZ" data-theme="day">
      <head>
        <link rel="preload" href="/fonts/anton-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <a href="#main-content" className="skip-link">Saltar para o conteúdo / Skip to content</a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
        />

        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');`}
            </Script>
          </>
        )}

        {metaPixelId && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');`}
          </Script>
        )}

        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
