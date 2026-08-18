import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CONTACT, PLANS } from "@/lib/constants";
import { BASE_URL } from "@/lib/urls";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      images: ["/photos/room1.jpg"],
    },
    alternates: {
      languages: {
        en: "/",
        "x-default": "/",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  // Sitewide LocalBusiness structured data (Google rich results)
  const businessJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: "En Chakai 円茶会",
    description:
      "An intimate Japanese tea ceremony experience hosted in a private home in Sengoku, Tokyo.",
    url: BASE_URL,
    email: CONTACT.email,
    image: `${BASE_URL}/photos/room1.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bunkyo-ku",
      addressRegion: "Tokyo",
      addressCountry: "JP",
      streetAddress: "Sengoku",
    },
    isAccessibleForFree: false,
    offers: {
      "@type": "Offer",
      name: PLANS[0].name,
      price: PLANS[0].priceJpy,
      priceCurrency: "JPY",
      url: `${BASE_URL}/en/booking`,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${inter.variable} antialiased`}
    >
      <body className={`min-h-screen flex flex-col ${inter.className}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
