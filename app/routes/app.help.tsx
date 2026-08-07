import type { LoaderFunctionArgs } from "@remix-run/node";
import { Page, Layout, Card, Text } from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

const faqs = [
  {
    q: "Can I try the section first?",
    a: "Yes, many sections are free or have live demo stores you can preview before purchasing.",
  },
  {
    q: "Can I use Section Store with any Shopify theme?",
    a: "Yes. Sections are added directly to your theme and edited with Shopify's native theme editor.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No coding is required. Browse, purchase and add sections in a few clicks.",
  },
  {
    q: "Will adding sections slow down my website?",
    a: "Our sections are built to be lightweight and fast, replacing bloated third-party apps.",
  },
  {
    q: "What happens if I don't like a section I added?",
    a: "You can remove the section from your theme at any time. Purchases are one-time charges.",
  },
  {
    q: "Can I get a refund?",
    a: "Refunds are handled on a case-by-case basis. Contact support with your purchase details.",
  },
  {
    q: "The section I added shows on all pages?",
    a: "You can control section visibility using Shopify's theme editor templates and visibility settings.",
  },
  {
    q: "I can't add sections into my product page?",
    a: "Product page support depends on your theme. Use the theme editor or contact support for help.",
  },
  {
    q: "Can you help me customise the sections?",
    a: "Yes — reach out to support for customisation help or check the setup guides.",
  },
];

export default function HelpAndResources() {
  return (
    <Page title="Help & Resources">
      <Layout>
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Frequently asked questions
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              Still have questions? Reach out to our support at
              help@example.com.
            </Text>
          </Card>
        </Layout.Section>

        <Layout.Section>
          {faqs.map((faq, index) => (
            <Card key={index}>
              <Text variant="headingSm" as="h3">
                {faq.q}
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                {faq.a}
              </Text>
            </Card>
          ))}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
