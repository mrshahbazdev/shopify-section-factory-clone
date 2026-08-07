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
  Select,
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
    "conversion_blocks"
  )) as { enabled?: boolean; mode?: string } | null;

  return {
    enabled: config?.enabled ?? false,
    mode: config?.mode ?? "tabs",
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const form = await request.formData();

  const enabled = form.get("enabled") === "on";
  const mode = String(form.get("mode") || "tabs");

  await setShopMetafield(
    admin,
    "section_factory_plus",
    "conversion_blocks",
    { enabled, mode },
    "json"
  );

  return { success: true, enabled, mode };
};

const modes = [
  { label: "Tabs", value: "tabs" },
  { label: "ATC button styling", value: "atc" },
  { label: "Video carousel", value: "video" },
  { label: "Addons", value: "addons" },
];

export default function ConversionBlocks() {
  const { enabled: initialEnabled, mode: initialMode } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [enabled, setEnabled] = useState(initialEnabled);
  const [mode, setMode] = useState(initialMode);

  return (
    <Page title="Conversion Blocks">
      <Layout>
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Conversion Blocks
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Add high-converting blocks to your product information area or any
              section on newer themes.
            </Text>
            <div style={{ marginTop: "1rem" }}>
              <ButtonGroup>
                <Button primary>Conversion Blocks</Button>
                <Button url="/app/bundles">Bundles / Quantity Breaks</Button>
                <Button url="/app/cart-drawer">Cart Drawer</Button>
              </ButtonGroup>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            {actionData?.success && (
              <Banner tone="success" title="Conversion Blocks updated" />
            )}
            <Form method="post">
              <div style={{ display: "grid", gap: "1rem" }}>
                <Select
                  label="Block mode"
                  name="mode"
                  options={modes}
                  value={mode}
                  onChange={setMode}
                />
                <Checkbox
                  label="Enable conversion blocks on product pages"
                  name="enabled"
                  checked={enabled}
                  onChange={setEnabled}
                  value="on"
                />
                <Button submit primary>
                  Save conversion blocks
                </Button>
              </div>
            </Form>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "1rem",
            }}
          >
            {modes.map((m) => (
              <Card key={m.value}>
                <Text variant="headingSm" as="h3">
                  {m.label}
                </Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                  Configure the {m.label.toLowerCase()} block from the theme
                  editor after enabling it above.
                </Text>
              </Card>
            ))}
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
