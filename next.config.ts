import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.106"],
  async redirects() {
    return [
      { source: "/ja", destination: "/", permanent: true },
      { source: "/ja/:path*", destination: "/:path*", permanent: true },
      {
        source: "/cancellation",
        destination: "/faq#cancellation",
        permanent: true,
      },
      {
        source: "/:locale/cancellation",
        destination: "/:locale/faq#cancellation",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
