import type { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Layout, Card, Text, EmptyState, Badge } from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

const bundleTiers = [
  { count: 3, discount: 10 },
  { count: 5, discount: 15 },
  { count: 10, discount: 25 },
];

export default function BundleAndSave() {
  return (
    <Page title="Bundle & Save">
      <Layout>
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Build Your Custom Bundle
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Purchase multiple sections together at a discounted price.
            </Text>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <Text variant="headingMd" as="h2">
              Bundle Discounts
            </Text>
            <div style={{ display: "grid", gap: "0.5rem", marginTop: "1rem" }}>
              {bundleTiers.map((tier) => (
                <div
                  key={tier.count}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem",
                    border: "1px solid #e3e3e3",
                    borderRadius: "8px",
                  }}
                >
                  <Text variant="bodyMd" as="span">
                    Add {tier.count} sections
                  </Text>
                  <Badge tone="success">Save {tier.discount}%</Badge>
                </div>
              ))}
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <EmptyState
            heading="Your bundle is empty"
            image="https://cdn.shopify.com/s/files/1/0262/9627/4458/files/empty-state.svg"
            action={{ content: "Explore Sections", url: "/app/explore" }}
          >
            <Text variant="bodyMd" as="p">
              Add sections from the catalog to unlock discounts.
            </Text>
          </EmptyState>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
