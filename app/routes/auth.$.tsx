import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  Button,
  Card,
  FormLayout,
  Layout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";

import { authenticate, login, LoginErrorType } from "../shopify.server";
import { normalizeRequestHost } from "../lib/normalize-host";

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  [LoginErrorType.MissingShop]: "Please enter your shop domain to continue.",
  [LoginErrorType.InvalidShop]:
    "Invalid shop domain. Please use my-shop.myshopify.com",
};

function loginErrorMessage(errors?: { shop?: LoginErrorType }) {
  if (!errors?.shop) return undefined;
  return LOGIN_ERROR_MESSAGES[errors.shop] ?? errors.shop;
}

async function handleLogin(request: Request) {
  const errors = loginErrorMessage(await login(normalizeRequestHost(request)));
  return json({ errors });
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.pathname === "/auth/login") {
    return handleLogin(request);
  }

  await authenticate.admin(normalizeRequestHost(request));
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);

  if (url.pathname === "/auth/login") {
    return handleLogin(request);
  }

  await authenticate.admin(normalizeRequestHost(request));
  return null;
};

export default function Auth() {
  const { errors: loaderErrors } = useLoaderData<typeof loader>() ?? {};
  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors ?? loaderErrors;

  return (
    <Page title="Install Section Factory Clone">
      <Layout>
        <Layout.Section>
          <Card>
            <Form method="post">
              <FormLayout>
                <Text as="p" variant="bodyMd">
                  Enter your shop domain to install or open the app.
                </Text>
                <TextField
                  name="shop"
                  label="Shop domain"
                  placeholder="my-shop.myshopify.com"
                  autoComplete="on"
                  error={errors}
                />
                <Button submit primary>
                  Install app
                </Button>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
