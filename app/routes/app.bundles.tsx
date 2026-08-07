import type { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Layout, Card, Text, Button, ButtonGroup } from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function BundlesAndQuantityBreaks() {
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
                <Button>Conversion Blocks</Button>
                <Button primary>Bundles / Quantity Breaks</Button>
                <Button>Cart Drawer</Button>
                <Button>Subscribe</Button>
              </ButtonGroup>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <Text variant="headingMd" as="h2">
                No bundles yet
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                Create and preview your bundle, then upgrade to Plus when ready
                to publish.
              </Text>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "center",
                  marginTop: "1rem",
                }}
              >
                <Button>Create bundle</Button>
                <Button primary>Upgrade to Plus</Button>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Quick Setup Guide
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Learn how to add the bundle block to your product page in 30
              seconds.
            </Text>
            <div style={{ marginTop: "1rem" }}>
              <ButtonGroup>
                <Button>Watch tutorial</Button>
                <Button>Add block to theme</Button>
              </ButtonGroup>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
