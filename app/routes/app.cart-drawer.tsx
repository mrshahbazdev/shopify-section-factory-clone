import type { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Layout, Card, Text, Button, ButtonGroup } from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function CartDrawer() {
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
                <Button>Conversion Blocks</Button>
                <Button>Bundles / Quantity Breaks</Button>
                <Button primary>Cart Drawer</Button>
                <Button>Subscribe</Button>
              </ButtonGroup>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Quick Setup Guide
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Enable cart drawer in theme, then publish your drawer settings
              here.
            </Text>
            <div style={{ marginTop: "1rem" }}>
              <ButtonGroup>
                <Button>Watch tutorial</Button>
                <Button primary>Enable cart drawer in theme</Button>
              </ButtonGroup>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Cart drawer
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Configure and preview your cart drawer now. Upgrade to Plus when
              ready to enable it on your live store.
            </Text>
            <div style={{ marginTop: "1rem" }}>
              <Button primary>Create cart drawer</Button>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
