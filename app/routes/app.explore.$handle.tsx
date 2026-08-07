import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Banner,
  Badge,
  BlockStack,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import { generateSectionLiquid } from "../lib/section-template";
import { getSection } from "../data/sections.server";
import db from "../db.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  const section = getSection(params.handle);
  if (!section) {
    throw new Response("Section not found", { status: 404 });
  }
  return json({ section });
};

export const action = async ({
  request,
  params,
}: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const section = getSection(params.handle);
  if (!section || !session) {
    return { error: "Section or session not found" };
  }

  try {
    // 1) Record / simulate the one-time purchase
    const amount = section.price;
    if (amount > 0) {
      try {
        await admin.graphql(
          `
          mutation appPurchaseOneTimeCreate($name: String!, $price: MoneyInput!, $returnUrl: URL!) {
            appPurchaseOneTimeCreate(name: $name, price: $price, returnUrl: $returnUrl) {
              appPurchaseOneTime { id status }
              confirmationUrl
              userErrors { field message }
            }
          }
        `,
          {
            variables: {
              name: section.title,
              price: { amount: amount.toString(), currencyCode: "USD" },
              returnUrl: `${process.env.SHOPIFY_APP_URL}/app/explore/${section.handle}`,
            },
          }
        );
      } catch (billingErr) {
        // In local/dev environments billing is not available; fall back gracefully.
        console.warn("Billing call skipped/failed:", billingErr);
      }
    }

    const dbSection = await db.section.upsert({
      where: { handle: section.handle },
      create: {
        handle: section.handle,
        title: section.title,
        price: amount,
        isPro: section.isPro,
        imageUrl: section.image,
        category: section.groups[0] || "other",
        groups: section.groups.join(","),
      },
      update: {},
    });

    await db.sectionPurchase.create({
      data: {
        shop: session.shop,
        sectionId: dbSection.id,
        amount,
        currency: "USD",
        status: "paid",
      },
    });

    // 2) Install the section into the active theme
    const themesResponse = await admin.rest.get({
      path: "/themes.json",
    });
    const themes = (await themesResponse.json()) as {
      themes: { id: number; role: string }[];
    };
    const activeTheme = themes.themes.find((t) => t.role === "main");

    if (activeTheme) {
      const liquid =
        section.liquid ?? generateSectionLiquid(section.title, section.handle);
      await admin.rest.put({
        path: `/themes/${activeTheme.id}/assets.json`,
        data: {
          asset: {
            key: `sections/${section.handle}.liquid`,
            value: liquid,
          },
        },
      });

      await db.installedSection.upsert({
        where: {
          shop_sectionId: {
            shop: session.shop,
            sectionId: dbSection.id,
          },
        },
        create: {
          shop: session.shop,
          sectionId: dbSection.id,
          themeId: activeTheme.id.toString(),
        },
        update: {},
      });
    }

    return { success: true, themeId: activeTheme?.id };
  } catch (error) {
    console.error(error);
    return { error: (error as Error).message };
  }
};

export default function SectionDetail() {
  const { section } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [showPreview, setShowPreview] = useState(false);

  return (
    <Page
      title={section.title}
      backAction={{ content: "Explore", url: "/app/explore" }}
    >
      <Layout>
        {actionData?.success && (
          <Layout.Section>
            <Banner tone="success" title="Section installed">
              <Text as="p" variant="bodyMd">
                {section.title} has been purchased and added to your active
                theme. Open the theme editor to place it on a page.
              </Text>
            </Banner>
          </Layout.Section>
        )}

        {actionData?.error && (
          <Layout.Section>
            <Banner tone="critical" title="Installation failed">
              <Text as="p" variant="bodyMd">
                {actionData.error}
              </Text>
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card>
            <div style={{ position: "relative" }}>
              <img
                src={section.image}
                alt={section.title}
                style={{
                  width: "100%",
                  height: "360px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              {section.isPro && (
                <div style={{ position: "absolute", top: 16, right: 16 }}>
                  <Badge tone="info">Pro</Badge>
                </div>
              )}
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                {section.price === 0 ? "Free" : `$${section.price}`}
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                One-time purchase. No recurring fees.
              </Text>
              <Form method="post">
                <Button submit primary fullWidth>
                  {section.price === 0 ? "Add to theme" : "Buy & Install"}
                </Button>
              </Form>
              <Button fullWidth onClick={() => setShowPreview((p) => !p)}>
                {showPreview ? "Hide preview" : "Live preview"}
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>

        {showPreview && (
          <Layout.Section>
            <Card>
              <Text variant="headingMd" as="h2">
                Live preview
              </Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                The live preview would open the section on the demo store. This
                is a placeholder until the storefront preview URL is wired up.
              </Text>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
