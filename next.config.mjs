// NEXT_DIST lets test builds use a separate folder so they don't clobber `npm run dev`
const nextConfig = { distDir: process.env.NEXT_DIST || ".next" };
export default nextConfig;
