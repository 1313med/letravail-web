/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/offres-emploi-maroc", destination: "/emplois", permanent: true },
      { source: "/offres-emploi-casablanca", destination: "/emplois/casablanca-morocco", permanent: true },
      { source: "/offres-emploi-rabat", destination: "/emplois/rabat-morocco", permanent: true },
      { source: "/offres-emploi-marrakech", destination: "/emplois/marrakech-morocco", permanent: true },
      { source: "/offres-emploi-tanger", destination: "/emplois/tanger-morocco", permanent: true },
      { source: "/offres-emploi-fes", destination: "/emplois/fes-morocco", permanent: true },
      { source: "/offres-emploi-agadir", destination: "/emplois/agadir-morocco", permanent: true },
      { source: "/offres-emploi-tech", destination: "/emploi-tech-maroc", permanent: true },
      { source: "/offres-emploi-finance", destination: "/emploi-finance-maroc", permanent: true },
    ];
  },
};

export default nextConfig;
