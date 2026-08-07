import { json } from "@remix-run/node";
import prisma from "../db.server";

export const loader = async () => {
  // This route is intentionally unauthenticated so it can be used as a public health probe.
  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    checks.database = { ok: false, detail: message };
  }

  // Shopify config check
  checks.shopify = {
    ok: Boolean(
      process.env.SHOPIFY_API_KEY &&
        process.env.SHOPIFY_API_SECRET &&
        process.env.SHOPIFY_APP_URL,
    ),
    detail: `appUrl=${process.env.SHOPIFY_APP_URL || "missing"}`,
  };

  const healthy = Object.values(checks).every((c) => c.ok);

  return json(
    {
      status: healthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: healthy ? 200 : 503 },
  );
};

// This is a resource route — it returns JSON directly and has no UI component.
