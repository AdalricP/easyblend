/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false, // don't advertise the framework
  experimental: {
    // @libsql/client uses native bindings — keep it external to the server bundle.
    serverComponentsExternalPackages: ["@libsql/client", "libsql"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" }, // anti-clickjacking
          { key: "X-Content-Type-Options", value: "nosniff" },
          // strip path+query from cross-origin Referer so manage tokens don't leak
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
