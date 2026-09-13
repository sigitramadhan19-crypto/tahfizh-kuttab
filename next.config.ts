import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  turbopack: {},
  // Version-skew protection: if a teacher's phone still has an old JS bundle
  // loaded from before a deploy, Next.js will force a full reload instead of
  // letting it call a Server Action that no longer matches the deployed
  // server — this is what was silently dropping "successful" deposit inputs.
  // See node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/deploymentId.md
  // Must be <= 32 chars — a full git SHA (40 chars) is too long, so use the
  // short SHA (still unique per commit).
  deploymentId: (process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_DEPLOYMENT_ID)?.slice(0, 16),
};

export default withPWA(nextConfig);
