import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  ButtonGroup,
  TextField,
  Checkbox,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getShopMetafield, setShopMetafield } from "../lib/metafields.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const config = (await getShopMetafield(
    admin,
    "section_factory_plus",
    "cart_drawer"
  )) as { enabled?: boolean; heading?: string; upsell_text?: string } | null;

  return {
    enabled: config?.enabled ?? false,
    heading: config?.heading ?? "Your cart",
    upsellText: config?.upsell_text ?? "Add this recommended item.",
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const form = await request.formData();

  const enabled = form.get("enabled") === "on";
  const heading = String(form.get("heading") || "Your cart");
  const upsellText = String(form.get("upsellText") || "Add this recommended item.");

  await setShopMetafield(
    admin,
    "section_factory_plus",
    "cart_drawer",
    { enabled, heading, upsell_text: upsellText },
    "json"
  );

  return { success: true, enabled, heading, upsellText };
};

export default function CartDrawer() {
  const { enabled: initialEnabled, heading: initialHeading, upsellText: initialUpsell } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [enabled, setEnabled] = useState(initialEnabled);
  const [heading, setHeading] = useState(initialHeading);
  const [upsellText, setUpsellText] = useState(initialUpsell);

  return (
    <Page title="Cart Drawer">
      <Layout>
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Cart Drawer
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Create a global cart drawer with order upsells, discount codes,
              reward bars and more.
            </Text>
            <div style={{ marginTop: "1rem" }}>
              <ButtonGroup>
                <Button url="/app/conversion-blocks">Conversion Blocks</Button>
                <Button url="/app/bundles">Bundles / Quantity Breaks</Button>
                <Button primary>Cart Drawer</Button>
              </ButtonGroup>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            {actionData?.success && (
              <Banner tone="success" title="Cart drawer settings saved" />
            )}
            <Form method="post">
              <div style={{ display: "grid", gap: "1rem" }}>
                <TextField
                  label="Drawer heading"
                  name="heading"
                  value={heading}
                  onChange={setHeading}
                  autoComplete="off"
                />
                <TextField
                  label="Upsell text"
                  name="upsellText"
                  value={upsellText}
                  onChange={setUpsellText}
                  autoComplete="off"
                />
                <Checkbox
                  label="Enable cart drawer on all pages"
                  name="enabled"
                  checked={enabled}
                  onChange={setEnabled}
                  value="on"
                />
                <Button submit primary>
                  Save cart drawer
                </Button>
              </div>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
