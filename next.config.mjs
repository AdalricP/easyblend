/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // @libsql/client uses native bindings — keep it external to the server bundle.
    serverComponentsExternalPackages: ["@libsql/client", "libsql"],
  },
};

export default nextConfig;
