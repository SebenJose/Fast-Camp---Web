const apiProxyUrl = process.env.API_PROXY_URL ?? "http://localhost:8001";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // A cadeia de fallback da LLM pode passar dos 30s padrão do proxy
    proxyTimeout: 150_000,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
