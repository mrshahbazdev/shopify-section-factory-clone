import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  TextField,
  Button,
  Checkbox,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  let settings = await db.shopSettings.findUnique({
    where: { shop: session.shop },
  });

  if (!settings) {
    settings = await db.shopSettings.create({
      data: { shop: session.shop },
    });
  }

  return {
    plusEnabled: settings.plusEnabled,
    supportEmail: "help@example.com",
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();

  const plusEnabled = form.get("plusEnabled") === "on";

  await db.shopSettings.upsert({
    where: { shop: session.shop },
    create: { shop: session.shop, plusEnabled },
    update: { plusEnabled },
  });

  return { success: true, plusEnabled };
};

export default function Settings() {
  const { plusEnabled: initialPlus, supportEmail: initialEmail } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [plusEnabled, setPlusEnabled] = useState(initialPlus);
  const [supportEmail, setSupportEmail] = useState(initialEmail);

  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Store Settings
            </Text>
            {actionData?.success && (
              <Banner tone="success" title="Settings saved" />
            )}
            <Form method="post">
              <div style={{ marginTop: "1rem" }}>
                <TextField
                  label="Support email"
                  name="supportEmail"
                  value={supportEmail}
                  onChange={setSupportEmail}
                  autoComplete="email"
                />
              </div>
              <div style={{ marginTop: "1rem" }}>
                <Checkbox
                  label="Enable Section Store Plus features (cart drawer, bundles, conversion blocks)"
                  name="plusEnabled"
                  checked={plusEnabled}
                  onChange={setPlusEnabled}
                  value="on"
                />
              </div>
              <div style={{ marginTop: "1rem" }}>
                <Button submit primary>
                  Save settings
                </Button>
              </div>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
