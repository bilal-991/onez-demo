// NEXT_DIST lets test builds use a separate folder so they don't clobber `npm run dev`
const nextConfig = {
  distDir: process.env.NEXT_DIST || ".next",
  async headers() {
    return [{ source: "/(frames|products)/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] }];
  },
};
export default nextConfig;
