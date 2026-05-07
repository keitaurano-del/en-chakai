import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BookingContent } from "@/components/booking/BookingContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function BookingPage() {
  return <BookingContent />;
}
