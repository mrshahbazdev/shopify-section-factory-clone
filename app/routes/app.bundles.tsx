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
    "bundles"
  )) as { enabled?: boolean; tiers?: { quantity: number; discount: number }[] } | null;

  return {
    enabled: config?.enabled ?? false,
    tiers: config?.tiers ?? [
      { quantity: 2, discount: 10 },
      { quantity: 3, discount: 15 },
    ],
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const form = await request.formData();

  const enabled = form.get("enabled") === "on";
  const tier1Qty = Number(form.get("tier1Qty") || 2);
  const tier1Discount = Number(form.get("tier1Discount") || 10);
  const tier2Qty = Number(form.get("tier2Qty") || 3);
  const tier2Discount = Number(form.get("tier2Discount") || 15);

  const tiers = [
    { quantity: tier1Qty, discount: tier1Discount },
    { quantity: tier2Qty, discount: tier2Discount },
  ];

  await setShopMetafield(
    admin,
    "section_factory_plus",
    "bundles",
    { enabled, tiers },
    "json"
  );

  return { success: true, enabled, tiers };
};

export default function BundlesAndQuantityBreaks() {
  const { enabled: initialEnabled, tiers: initialTiers } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [enabled, setEnabled] = useState(initialEnabled);
  const [tier1Qty, setTier1Qty] = useState(String(initialTiers[0].quantity));
  const [tier1Discount, setTier1Discount] = useState(
    String(initialTiers[0].discount)
  );
  const [tier2Qty, setTier2Qty] = useState(String(initialTiers[1].quantity));
  const [tier2Discount, setTier2Discount] = useState(
    String(initialTiers[1].discount)
  );

  return (
    <Page title="Bundles / Quantity Breaks">
      <Layout>
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Bundles / Quantity Breaks
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Create volume discounts and bundle offers to increase your average
              order value.
            </Text>
            <div style={{ marginTop: "1rem" }}>
              <ButtonGroup>
                <Button url="/app/conversion-blocks">Conversion Blocks</Button>
                <Button primary>Bundles / Quantity Breaks</Button>
                <Button url="/app/cart-drawer">Cart Drawer</Button>
              </ButtonGroup>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            {actionData?.success && (
              <Banner tone="success" title="Bundle settings saved" />
            )}
            <Form method="post">
              <div style={{ display: "grid", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <TextField
                      label="Tier 1 quantity"
                      name="tier1Qty"
                      value={tier1Qty}
                      onChange={setTier1Qty}
                      autoComplete="off"
                      type="number"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <TextField
                      label="Tier 1 discount %"
                      name="tier1Discount"
                      value={tier1Discount}
                      onChange={setTier1Discount}
                      autoComplete="off"
                      type="number"
                    />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <TextField
                      label="Tier 2 quantity"
                      name="tier2Qty"
                      value={tier2Qty}
                      onChange={setTier2Qty}
                      autoComplete="off"
                      type="number"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <TextField
                      label="Tier 2 discount %"
                      name="tier2Discount"
                      value={tier2Discount}
                      onChange={setTier2Discount}
                      autoComplete="off"
                      type="number"
                    />
                  </div>
                </div>
                <Checkbox
                  label="Enable bundles / quantity breaks on product pages"
                  name="enabled"
                  checked={enabled}
                  onChange={setEnabled}
                  value="on"
                />
                <Button submit primary>
                  Save bundle settings
                </Button>
              </div>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
