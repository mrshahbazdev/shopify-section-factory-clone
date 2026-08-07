import type { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Layout, Card, Text, Button, ButtonGroup } from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

const blockTypes = [
  {
    title: "Tabs",
    description: "Tabs w optional expert review",
  },
  {
    title: "ATC button styling",
    description: "Customise add to cart button",
  },
  {
    title: "Video carousel",
    description: "Showcase product w video",
  },
  {
    title: "Addons",
    description: "Complementary products",
  },
];

export default function ConversionBlocks() {
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
                <Button>Bundles / Quantity Breaks</Button>
                <Button>Cart Drawer</Button>
                <Button>Subscribe</Button>
              </ButtonGroup>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              AI Conversion Blocks Setup
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Get a conversion-optimized buy box in 60 seconds.
            </Text>
            <div style={{ marginTop: "1rem" }}>
              <Button primary>Set up with AI</Button>
            </div>
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
            {blockTypes.map((block) => (
              <Card key={block.title}>
                <Text variant="headingSm" as="h3">
                  {block.title}
                </Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                  {block.description}
                </Text>
                <div style={{ marginTop: "1rem" }}>
                  <Button fullWidth disabled>
                    Subscribe to unlock
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
