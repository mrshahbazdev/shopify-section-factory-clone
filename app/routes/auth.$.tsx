import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate, login } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // The /auth/login route must use shopify.login() rather than authenticate.admin()
  if (url.pathname === "/auth/login") {
    const errors = await login(request);
    return json(errors ?? {});
  }

  await authenticate.admin(request);

  return null;
};
