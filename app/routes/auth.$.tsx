import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { normalizeRequestHost } from "../lib/normalize-host";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(normalizeRequestHost(request));

  return null;
};
