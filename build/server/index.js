var _a;
import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer, Meta, Links, Outlet, ScrollRestoration, Scripts, useLoaderData, Link, useRouteError, useActionData, Form, useSearchParams } from "@remix-run/react";
import { createReadableStreamFromReadable, redirect, json } from "@remix-run/node";
import { isbot } from "isbot";
import "@shopify/shopify-app-remix/adapters/node";
import { shopifyApp, AppDistribution, ApiVersion, boundary } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import { useState, useMemo } from "react";
import { Page, Layout, Card, Text, ButtonGroup, Button, Banner, Select, Checkbox, Badge, BlockStack, TextField, Tabs, EmptyState } from "@shopify/polaris";
import { readFileSync } from "fs";
import { resolve } from "path";
if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
}
const prisma = global.prismaGlobal ?? new PrismaClient();
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: (_a = process.env.SCOPES) == null ? void 0 : _a.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    expiringOfflineAccessTokens: true
  },
  ...process.env.SHOP_CUSTOM_DOMAIN ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] } : {}
});
ApiVersion.January25;
const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
const authenticate = shopify.authenticate;
shopify.unauthenticated;
const login = shopify.login;
shopify.registerWebhooks;
shopify.sessionStorage;
const streamTimeout = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  addDocumentResponseHeaders(request, responseHeaders);
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";
  return new Promise((resolve2, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url
        }
      ),
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve2(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
function App$1() {
  return /* @__PURE__ */ jsxs("html", { children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width,initial-scale=1" }),
      /* @__PURE__ */ jsx("link", { rel: "preconnect", href: "https://cdn.shopify.com/" }),
      /* @__PURE__ */ jsx(
        "link",
        {
          rel: "stylesheet",
          href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        }
      ),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(Outlet, {}),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App$1
}, Symbol.toStringTag, { value: "Module" }));
const action$6 = async ({ request }) => {
  const { payload, session, topic, shop } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  const current = payload.current;
  if (session) {
    await prisma.session.update({
      where: {
        id: session.id
      },
      data: {
        scope: current.toString()
      }
    });
  }
  return new Response();
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$6
}, Symbol.toStringTag, { value: "Module" }));
const action$5 = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  if (session) {
    await prisma.session.deleteMany({ where: { shop } });
  }
  return new Response();
};
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$5
}, Symbol.toStringTag, { value: "Module" }));
const loader$c = async ({ request }) => {
  const url = new URL(request.url);
  return redirect(`/app${url.search}`);
};
function Index() {
  return null;
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index,
  loader: loader$c
}, Symbol.toStringTag, { value: "Module" }));
const loader$b = async ({ request }) => {
  const url = new URL(request.url);
  if (url.pathname === "/auth/login") {
    const errors = await login(request);
    return json(errors ?? {});
  }
  await authenticate.admin(request);
  return null;
};
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$b
}, Symbol.toStringTag, { value: "Module" }));
const loader$a = async () => {
  const checks = {};
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    checks.database = { ok: false, detail: message };
  }
  checks.shopify = {
    ok: Boolean(
      process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET && process.env.SHOPIFY_APP_URL
    ),
    detail: `appUrl=${process.env.SHOPIFY_APP_URL || "missing"}`
  };
  const healthy = Object.values(checks).every((c) => c.ok);
  return json(
    {
      status: healthy ? "healthy" : "unhealthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      checks
    },
    { status: healthy ? 200 : 503 }
  );
};
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$a
}, Symbol.toStringTag, { value: "Module" }));
const polarisStyles = "/assets/styles-CV7GIAUv.css";
const links = () => [{ rel: "stylesheet", href: polarisStyles }];
const loader$9 = async ({ request }) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};
function App() {
  const { apiKey } = useLoaderData();
  return /* @__PURE__ */ jsxs(AppProvider, { isEmbeddedApp: true, apiKey, children: [
    /* @__PURE__ */ jsxs(NavMenu, { children: [
      /* @__PURE__ */ jsx(Link, { to: "/app/explore", rel: "home", children: "Explore Sections" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/bundle", children: "Bundle & Save" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/conversion-blocks", children: "Conversion Blocks" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/bundles", children: "Bundles / Quantity Breaks" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/cart-drawer", children: "Cart Drawer" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/help", children: "Help & Resources" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/settings", children: "Settings" })
    ] }),
    /* @__PURE__ */ jsx(Outlet, {})
  ] });
}
function ErrorBoundary() {
  return boundary.error(useRouteError());
}
const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: App,
  headers,
  links,
  loader: loader$9
}, Symbol.toStringTag, { value: "Module" }));
async function getShopGid(admin) {
  const response = await admin.graphql(
    `
    query getShop {
      shop {
        id
      }
    }
  `
  );
  const data = await response.json();
  return data.data.shop.id;
}
async function setShopMetafield(admin, namespace, key, value, type = "json") {
  const ownerId = await getShopGid(admin);
  const response = await admin.graphql(
    `
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
          key
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
    {
      variables: {
        metafields: [
          {
            ownerId,
            namespace,
            key,
            value: JSON.stringify(value),
            type
          }
        ]
      }
    }
  );
  const result = await response.json();
  if (result.data.metafieldsSet.userErrors.length > 0) {
    throw new Error(result.data.metafieldsSet.userErrors[0].message);
  }
  return result.data.metafieldsSet.metafields;
}
async function getShopMetafield(admin, namespace, key) {
  const ownerId = await getShopGid(admin);
  const response = await admin.graphql(
    `
    query getMetafield($ownerId: ID!, $namespace: String!, $key: String!) {
      metafield(ownerId: $ownerId, namespace: $namespace, key: $key) {
        id
        value
        type
      }
    }
  `,
    {
      variables: { ownerId, namespace, key }
    }
  );
  const result = await response.json();
  if (!result.data.metafield) return null;
  if (result.data.metafield.type === "json") {
    return JSON.parse(result.data.metafield.value);
  }
  return result.data.metafield.value;
}
const loader$8 = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const config = await getShopMetafield(
    admin,
    "section_factory_plus",
    "conversion_blocks"
  );
  return {
    enabled: (config == null ? void 0 : config.enabled) ?? false,
    mode: (config == null ? void 0 : config.mode) ?? "tabs"
  };
};
const action$4 = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const form = await request.formData();
  const enabled = form.get("enabled") === "on";
  const mode2 = String(form.get("mode") || "tabs");
  await setShopMetafield(
    admin,
    "section_factory_plus",
    "conversion_blocks",
    { enabled, mode: mode2 },
    "json"
  );
  return { success: true, enabled, mode: mode2 };
};
const modes = [
  { label: "Tabs", value: "tabs" },
  { label: "ATC button styling", value: "atc" },
  { label: "Video carousel", value: "video" },
  { label: "Addons", value: "addons" }
];
function ConversionBlocks() {
  const { enabled: initialEnabled, mode: initialMode } = useLoaderData();
  const actionData = useActionData();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [mode2, setMode] = useState(initialMode);
  return /* @__PURE__ */ jsx(Page, { title: "Conversion Blocks", children: /* @__PURE__ */ jsxs(Layout, { children: [
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Conversion Blocks" }),
      /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "p", tone: "subdued", children: "Add high-converting blocks to your product information area or any section on newer themes." }),
      /* @__PURE__ */ jsx("div", { style: { marginTop: "1rem" }, children: /* @__PURE__ */ jsxs(ButtonGroup, { children: [
        /* @__PURE__ */ jsx(Button, { primary: true, children: "Conversion Blocks" }),
        /* @__PURE__ */ jsx(Button, { url: "/app/bundles", children: "Bundles / Quantity Breaks" }),
        /* @__PURE__ */ jsx(Button, { url: "/app/cart-drawer", children: "Cart Drawer" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(Card, { children: [
      (actionData == null ? void 0 : actionData.success) && /* @__PURE__ */ jsx(Banner, { tone: "success", title: "Conversion Blocks updated" }),
      /* @__PURE__ */ jsx(Form, { method: "post", children: /* @__PURE__ */ jsxs("div", { style: { display: "grid", gap: "1rem" }, children: [
        /* @__PURE__ */ jsx(
          Select,
          {
            label: "Block mode",
            name: "mode",
            options: modes,
            value: mode2,
            onChange: setMode
          }
        ),
        /* @__PURE__ */ jsx(
          Checkbox,
          {
            label: "Enable conversion blocks on product pages",
            name: "enabled",
            checked: enabled,
            onChange: setEnabled,
            value: "on"
          }
        ),
        /* @__PURE__ */ jsx(Button, { submit: true, primary: true, children: "Save conversion blocks" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1rem"
        },
        children: modes.map((m) => /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(Text, { variant: "headingSm", as: "h3", children: m.label }),
          /* @__PURE__ */ jsxs(Text, { variant: "bodyMd", as: "p", tone: "subdued", children: [
            "Configure the ",
            m.label.toLowerCase(),
            " block from the theme editor after enabling it above."
          ] })
        ] }, m.value))
      }
    ) })
  ] }) });
}
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4,
  default: ConversionBlocks,
  loader: loader$8
}, Symbol.toStringTag, { value: "Module" }));
function generateSectionLiquid(title, handle) {
  return `{% comment %}
  ${title} — section installed by Shopify Section Factory Clone
{% endcomment %}

<section id="section-${handle}" class="${handle}">
  <div class="page-width">
    <h2 class="section-title">{{ section.settings.heading | default: "${title.replace(/"/g, '\\"')}" }}</h2>
    <div class="section-content">
      {{ section.settings.subheading | default: "Add your custom content here." }}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "${title.replace(/"/g, '\\"')}",
  "tag": "section",
  "class": "section-${handle}",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "${title.replace(/"/g, '\\"')}"
    },
    {
      "type": "richtext",
      "id": "subheading",
      "label": "Subheading",
      "default": "<p>Add your custom content here.</p>"
    }
  ],
  "presets": [
    {
      "name": "${title.replace(/"/g, '\\"')}"
    }
  ]
}
{% endschema %}
`;
}
const sectionsJson = /* @__PURE__ */ JSON.parse('[{"id":"glow-hero","title":"Glow Hero 🌀","handle":"glow-hero","groups":["hero"],"rawGroups":["hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/glow-hero.png?v=1764667388","price":9,"isPro":false,"link":"https://glow-single-sections.myshopify.com/"},{"id":"glow-faq","title":"Glow FAQ 🌀","handle":"glow-faq","groups":["faq"],"rawGroups":["faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/glow-faq.png?v=1764667387","price":9,"isPro":false,"link":"https://section.store/pages/glow-bundle#glow-faq-section"},{"id":"glow-features","title":"Glow Features 🌀","handle":"glow-features","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/glow-features.png?v=1764667387","price":9,"isPro":false,"link":"https://section.store/pages/glow-bundle#feature__wrapper"},{"id":"glow-call-out","title":"Glow Call Out 🌀","handle":"glow-call-out","groups":["features"],"rawGroups":["call-out"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/glow-call-out.png?v=1764667387","price":9,"isPro":false,"link":"https://section.store/pages/glow-bundle#call_wrapper"},{"id":"glow-testimonial","title":"Glow Testimonial 🌀","handle":"glow-testimonial","groups":["scrolling","testimonial"],"rawGroups":["scrolling","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/glow-testimonial.png?v=1764667388","price":9,"isPro":false,"link":"https://section.store/pages/glow-testimonial"},{"id":"glow-logo-cloud","title":"Glow Logo Cloud 🌀","handle":"glow-logo-cloud","groups":["scrolling"],"rawGroups":["logo-cloud"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/glow-logo-cloud.png?v=1764667388","price":9,"isPro":false,"link":"https://section.store/pages/glow-bundle#glow-logo-section"},{"id":"faq-1","title":"FAQ #1","handle":"faq-1","groups":["faq","free"],"rawGroups":["faq","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-1.png?v=1764667389","price":0,"isPro":false,"link":"https://section.store/pages/faq-1"},{"id":"eco-hero","title":"Eco Hero ♻️","handle":"eco-hero","groups":["hero"],"rawGroups":["hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/eco-hero.png?v=1764667388","price":9,"isPro":false,"link":"https://section.store/pages/eco-bundle"},{"id":"eco-slideshow","title":"Eco Slideshow ♻️","handle":"eco-slideshow","groups":["slider"],"rawGroups":["slideshow"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/eco-slideshow.png?v=1764667390","price":9,"isPro":false,"link":"https://section.store/pages/eco-bundle#imagetext-slide"},{"id":"eco-feature","title":"Eco Feature ♻️","handle":"eco-feature","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/eco-feature.png?v=1764667390","price":9,"isPro":false,"link":"https://section.store/pages/eco-bundle#eco-features"},{"id":"eco-faq","title":"Eco FAQ ♻️","handle":"eco-faq","groups":["faq"],"rawGroups":["faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/eco-faq.png?v=1764667390","price":9,"isPro":false,"link":"https://section.store/pages/eco-bundle#eco-faq"},{"id":"eco-image-with-text","title":"Eco image with text ♻️","handle":"eco-image-with-text","groups":["image-with-text"],"rawGroups":["image-with-text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/eco-image-with-text.png?v=1764667390","price":9,"isPro":false,"link":"https://section.store/pages/eco-bundle#eco-text-w-image"},{"id":"eco-testimonial","title":"Eco Testimonial ♻️","handle":"eco-testimonial","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/eco-testimonial.png?v=1764667392","price":9,"isPro":false,"link":"https://section.store/pages/eco-bundle#eco-review"},{"id":"nft-hero","title":"NFT Hero 👾","handle":"nft-hero","groups":["hero"],"rawGroups":["hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/nft-hero.png?v=1764667393","price":9,"isPro":false,"link":"https://bored-champ-nft.myshopify.com/"},{"id":"nft-shop","title":"NFT Shop 👾","handle":"nft-shop","groups":["other"],"rawGroups":[],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/nft-shop.png?v=1764667392","price":9,"isPro":false,"link":"https://bored-champ-nft.myshopify.com/"},{"id":"nft-roadmap","title":"NFT Roadmap 👾","handle":"nft-roadmap","groups":["steps","features"],"rawGroups":["steps","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/nft-roadmap.png?v=1764667392","price":9,"isPro":false,"link":"https://bored-champ-nft.myshopify.com/"},{"id":"nft-faq","title":"NFT FAQ 👾","handle":"nft-faq","groups":["faq"],"rawGroups":["faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/nft-faq.png?v=1764667394","price":9,"isPro":false,"link":"https://bored-champ-nft.myshopify.com/"},{"id":"nft-footer","title":"NFT Footer 👾","handle":"nft-footer","groups":["features"],"rawGroups":["call-out"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/nft-footer.png?v=1764667394","price":9,"isPro":false,"link":"https://bored-champ-nft.myshopify.com/"},{"id":"feature-2","title":"Feature #2","handle":"feature-2","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-2.png?v=1764667394","price":9,"isPro":false,"link":"https://section.store/pages/feature-2"},{"id":"feature-3","title":"Feature #3","handle":"feature-3","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-3.png?v=1764667393","price":9,"isPro":false,"link":"https://section.store/pages/feature-3"},{"id":"feature-5","title":"Feature #5","handle":"feature-5","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-5.png?v=1764667395","price":9,"isPro":false,"link":"https://section.store/pages/feature-8"},{"id":"feature-4","title":"Feature #4","handle":"feature-4","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-4.png?v=1764667395","price":9,"isPro":false,"link":"https://section.store/pages/feature-5"},{"id":"image-gallery-1","title":"Image gallery #1","handle":"image-gallery-1","groups":["scrolling","images","free"],"rawGroups":["instafeed","grid","images","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/CleanShot_Dec_2_from_jwsandbox.webp?v=1764681673","price":0,"isPro":false,"link":"https://section.store/pages/image-gallery-1"},{"id":"blog-1","title":"Blog #1","handle":"blog-1","groups":["blog","free"],"rawGroups":["blog","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/blog-1.png?v=1764667397","price":0,"isPro":false,"link":"https://section.store/pages/blog-1"},{"id":"navigation-1","title":"Navigation #1","handle":"navigation-1","groups":["header","free"],"rawGroups":["navigation","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/navigation-1.png?v=1764667397","price":0,"isPro":false,"link":"https://section-store-preview.myshopify.com/pages/navigation-1"},{"id":"product-slider-1","title":"Product slider #1","handle":"product-slider-1","groups":["collection","slider"],"rawGroups":["products","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-slider-1.png?v=1764667397","price":14,"isPro":true,"link":"https://section.store/pages/product-slider-1"},{"id":"blog-3-slider","title":"Blog #3 (slider)","handle":"blog-3-slider","groups":["blog","slider"],"rawGroups":["blog","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/blog-3-slider.png?v=1764667398","price":9,"isPro":false,"link":"https://section.store/pages/blog-3"},{"id":"collection-1-slider","title":"Collection #1 (slider)","handle":"collection-1-slider","groups":["collection","slider"],"rawGroups":["collections","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-1-slider.png?v=1764667398","price":9,"isPro":false,"link":"https://section.store/pages/collection-slider-1"},{"id":"blog-2","title":"Blog #2","handle":"blog-2","groups":["blog","free"],"rawGroups":["blog","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/blog-2.png?v=1764667400","price":0,"isPro":false,"link":"https://section.store/pages/blog-2"},{"id":"trust-badges-1","title":"Trust badges #1","handle":"trust-badges-1","groups":["snippet","features"],"rawGroups":["trust badges","snippet","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/trust-badges-1.png?v=1764667400","price":9,"isPro":false,"link":"https://section.store/products/gertrude-cardigan"},{"id":"circle-menu","title":"Circle menu","handle":"circle-menu","groups":["collection","slider","header","popular"],"rawGroups":["collections","slider","navigation","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/circle-menu.jpg?v=1764667400","price":9,"isPro":false,"link":"https://section.store/pages/bubble-navigation"},{"id":"announcement-bar","title":"Announcement Bar","handle":"announcement-bar","groups":["header"],"rawGroups":["announcement bar"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/announcement-bar.png?v=1764667399","price":9,"isPro":false,"link":"https://section.store/pages/announcement-bar"},{"id":"product-info-boxed","title":"Product info boxed","handle":"product-info-boxed","groups":["snippet","page-templates"],"rawGroups":["styling","snippet","product page"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-info-boxed.png?v=1764667401","price":14,"isPro":true,"link":"https://section.store/products/the-field-report-vol-2"},{"id":"collection-2","title":"Collection #2","handle":"collection-2","groups":["collection"],"rawGroups":["collections"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-2.png?v=1764667402","price":9,"isPro":false,"link":"https://section.store/pages/collection-2"},{"id":"image-with-text-1","title":"Image with text #1","handle":"image-with-text-1","groups":["image-with-text"],"rawGroups":["image-with-text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-1.png?v=1764667402","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-1"},{"id":"faq-2","title":"FAQ #2","handle":"faq-2","groups":["faq"],"rawGroups":["faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-2.png?v=1764667402","price":9,"isPro":false,"link":"https://section.store/pages/faq-2"},{"id":"instafeed","title":"Instafeed","handle":"instafeed","groups":["scrolling","images","free"],"rawGroups":["instafeed","images","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/instafeed.png?v=1764667403","price":0,"isPro":false,"link":"https://section.store/pages/instafeed"},{"id":"feature-6","title":"Feature #6","handle":"feature-6","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-6.png?v=1764667403","price":9,"isPro":false,"link":"https://section.store/pages/feature-6"},{"id":"testimonial-1","title":"Testimonial #1","handle":"testimonial-1","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-1.png?v=1764667404","price":9,"isPro":false,"link":"https://section.store/pages/testimonial-1"},{"id":"faq-3","title":"FAQ #3","handle":"faq-3","groups":["faq"],"rawGroups":["faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-3.png?v=1764667403","price":9,"isPro":false,"link":"https://section.store/pages/faq-3"},{"id":"styling-add-to-cart-button-1","title":"Styling: Add to cart button #1","handle":"styling-add-to-cart-button-1","groups":["snippet","upsell"],"rawGroups":["styling","atc-button","snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/styling-add-to-cart-button-1.png?v=1764667404","price":9,"isPro":false,"link":"https://section.store/products/5-panel-hat"},{"id":"styling-add-to-cart-button-2","title":"Styling: Add to cart button #2","handle":"styling-add-to-cart-button-2","groups":["snippet","upsell"],"rawGroups":["styling","atc-button","snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/styling-add-to-cart-button-2.png?v=1764667405","price":9,"isPro":false,"link":"https://section.store/products/camp-stool"},{"id":"styling-atc-button-3-animate","title":"Styling: atc button #3 (animate)","handle":"styling-atc-button-3-animate","groups":["snippet","upsell","free"],"rawGroups":["styling","atc-button","snippet","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/styling-atc-button-3-animate.png?v=1764667404","price":0,"isPro":false,"link":"https://section.store/products/snow-peak-titanium-single-wall-cup"},{"id":"styling-add-to-cart-button-4","title":"Styling: Add to cart button #4","handle":"styling-add-to-cart-button-4","groups":["snippet","upsell"],"rawGroups":["styling","atc-button","snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/styling-add-to-cart-button-4.png?v=1764667404","price":9,"isPro":false,"link":"https://section.store/products/lunar-cirque"},{"id":"scrolling-text","title":"Scrolling text","handle":"scrolling-text","groups":["text","scrolling"],"rawGroups":["text","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-text.png?v=1764667405","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-text"},{"id":"payment-icons","title":"Payment icons","handle":"payment-icons","groups":["snippet"],"rawGroups":["trust badges","snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/payment-icons.png?v=1764667407","price":9,"isPro":false,"link":"https://section.store/products/camp-stool"},{"id":"featured-review-slider","title":"Featured Review Slider","handle":"featured-review-slider","groups":["page-templates","testimonial","free"],"rawGroups":["product page","testimonial","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-review-slider.png?v=1764667406","price":0,"isPro":false,"link":"https://section.store/products/snow-peak-titanium-single-wall-cup"},{"id":"video-banner","title":"Video banner","handle":"video-banner","groups":["slider","hero","video"],"rawGroups":["slideshow","banner","hero","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-banner.png?v=1764667408","price":9,"isPro":false,"link":"https://section.store/pages/video-banner"},{"id":"snow-effect","title":"Snow effect","handle":"snow-effect","groups":["other"],"rawGroups":["other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/snow-effect.png?v=1764667408","price":9,"isPro":false,"link":"https://section.store/pages/snow-effect"},{"id":"image-grid","title":"Image Grid","handle":"image-grid","groups":["images"],"rawGroups":["images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-grid.png?v=1764667409","price":9,"isPro":false,"link":"https://section.store/pages/image-grid"},{"id":"scrolling-logo-cloud","title":"Scrolling logo cloud","handle":"scrolling-logo-cloud","groups":["scrolling","popular"],"rawGroups":["logo-cloud","scrolling","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-logo-cloud.png?v=1764667409","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-logo-cloud"},{"id":"image-grid-collections","title":"Image Grid (Collections)","handle":"image-grid-collections","groups":["images","collection"],"rawGroups":["grid","collections","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-grid-collections.png?v=1764667410","price":9,"isPro":false,"link":"https://section.store/pages/image-grid-collections"},{"id":"image-with-text-2","title":"Image with text #2","handle":"image-with-text-2","groups":["image-with-text"],"rawGroups":["image-with-text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-2.png?v=1764667410","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-overlap"},{"id":"product-slider-2","title":"Product slider #2","handle":"product-slider-2","groups":["collection","slider"],"rawGroups":["products","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-slider-2.png?v=1764667411","price":14,"isPro":true,"link":"https://section.store/pages/product-slider-2"},{"id":"banner-clickable","title":"Banner (Clickable)","handle":"banner-clickable","groups":["hero"],"rawGroups":["banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/banner-clickable.png?v=1764667411","price":9,"isPro":false,"link":"https://section.store/pages/banner"},{"id":"scrolling-announcement-bar","title":"Scrolling announcement bar","handle":"scrolling-announcement-bar","groups":["header","scrolling","popular"],"rawGroups":["announcement bar","scrolling","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-announcement-bar.png?v=1764667410","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-announcement-bar"},{"id":"age-restriction","title":"Age restriction","handle":"age-restriction","groups":["other"],"rawGroups":["other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/age-restriction.png?v=1764667411","price":9,"isPro":false,"link":"https://section.store/pages/age-restriction"},{"id":"navigation-links","title":"Navigation links","handle":"navigation-links","groups":["collection","header"],"rawGroups":["collections","navigation"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/navigation-links.png?v=1764667413","price":9,"isPro":false,"link":"https://section.store/collections/backpacks"},{"id":"upsell-cross-sell-1","title":"Upsell & cross-sell #1","handle":"upsell-cross-sell-1","groups":["upsell","snippet"],"rawGroups":["upsell","cross sell","snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/upsell-cross-sell-1.png?v=1764667412","price":9,"isPro":false,"link":"https://section.store/products/scout-backpack"},{"id":"upsell-cross-sell-2","title":"Upsell & cross-sell #2","handle":"upsell-cross-sell-2","groups":["upsell","snippet"],"rawGroups":["upsell","cross sell","snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/upsell-cross-sell-2.png?v=1764667412","price":9,"isPro":false,"link":"https://section.store/products/whitney-pullover"},{"id":"testimonial-3","title":"Testimonial #3","handle":"testimonial-3","groups":["slider","testimonial"],"rawGroups":["slider","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-3.png?v=1764667413","price":9,"isPro":false,"link":"https://section.store/pages/testimonial-slider"},{"id":"scrolling-features","title":"Scrolling features","handle":"scrolling-features","groups":["features","scrolling"],"rawGroups":["features","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-features.jpg?v=1764667414","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-features"},{"id":"bonbon-hero","title":"BonBon Hero 🍭","handle":"bonbon-hero","groups":["hero"],"rawGroups":["hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/bonbon-hero.png?v=1764667414","price":9,"isPro":false,"link":"https://section.store/pages/bonbon-bundle"},{"id":"bonbon-product-slider","title":"BonBon product slider 🍭","handle":"bonbon-product-slider","groups":["collection","slider"],"rawGroups":["products","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/bonbon-product-slider.png?v=1764667414","price":14,"isPro":true,"link":"https://section.store/pages/bonbon-bundle#best-seller"},{"id":"bonbon-steps","title":"BonBon Steps 🍭","handle":"bonbon-steps","groups":["steps"],"rawGroups":["steps"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/bonbon-steps.png?v=1764667415","price":9,"isPro":false,"link":"https://section.store/pages/bonbon-bundle#easy-setup"},{"id":"bonbon-testimonial","title":"BonBon Testimonial 🍭","handle":"bonbon-testimonial","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/bonbon-testimonial.png?v=1764667416","price":9,"isPro":false,"link":"https://section.store/pages/bonbon-bundle#customers-reviews"},{"id":"bonbon-call-out","title":"BonBon Call Out 🍭","handle":"bonbon-call-out","groups":["features"],"rawGroups":["call-out"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/bonbon-call-out.png?v=1764667415","price":9,"isPro":false,"link":"https://section.store/pages/bonbon-bundle#bonbon-call-out"},{"id":"feature-1","title":"Feature #1","handle":"feature-1","groups":["features","free"],"rawGroups":["features","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-1.png?v=1764667416","price":0,"isPro":false,"link":"https://section.store/pages/feature-1"},{"id":"threads-image-grid","title":"Threads Image Grid 🧵","handle":"threads-image-grid","groups":["images"],"rawGroups":["grid","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/threads-image-grid.png?v=1764667417","price":9,"isPro":false,"link":"https://section.store/pages/clothing-bundle#image-grid"},{"id":"threads-faq","title":"Threads FAQ 🧵","handle":"threads-faq","groups":["faq"],"rawGroups":["faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/threads-faq.png?v=1764667417","price":9,"isPro":false,"link":"https://section.store/pages/clothing-bundle#threads-faq"},{"id":"threads-product-slider","title":"Threads Product Slider 🧵","handle":"threads-product-slider","groups":["product-ingredients","slider"],"rawGroups":["product","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/threads-product-slider.png?v=1764667418","price":14,"isPro":true,"link":"https://section.store/pages/clothing-bundle#threads-slider"},{"id":"threads-hero","title":"Threads hero 🧵","handle":"threads-hero","groups":["hero"],"rawGroups":["banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/threads-hero.png?v=1764667418","price":9,"isPro":false,"link":"https://section.store/pages/clothing-bundle"},{"id":"tech-hero","title":"Tech Hero 📱","handle":"tech-hero","groups":["hero"],"rawGroups":["hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/tech-hero.png?v=1764667419","price":9,"isPro":false,"link":"https://section.store/pages/device-bundle"},{"id":"tech-collections","title":"Tech Collections 📱","handle":"tech-collections","groups":["collection"],"rawGroups":["collections"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/tech-collections.png?v=1764667419","price":9,"isPro":false,"link":"https://section.store/pages/device-bundle#tech-collections"},{"id":"scrolling-logo-cloud-pro","title":"Scrolling logo cloud pro 💎","handle":"scrolling-logo-cloud-pro","groups":["scrolling"],"rawGroups":["logo-cloud","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-logo-cloud-pro.png?v=1764667419","price":14,"isPro":true,"link":"https://section.store/pages/device-bundle#scrolling-logo-cloud"},{"id":"tech-product-slider","title":"Tech Product Slider 📱","handle":"tech-product-slider","groups":["product-ingredients","slider"],"rawGroups":["product","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/tech-product-slider.png?v=1764667420","price":14,"isPro":true,"link":"https://section.store/pages/device-bundle#tech-slider"},{"id":"scrolling-announcement-bar-pro","title":"Scrolling announcement bar pro 💎","handle":"scrolling-announcement-bar-pro","groups":["header","scrolling"],"rawGroups":["announcement bar","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-announcement-bar-pro.png?v=1764667418","price":14,"isPro":true,"link":"https://section.store/pages/scrolling-announcement-bar-pro"},{"id":"tech-call-out","title":"Tech Call Out 📱","handle":"tech-call-out","groups":["features"],"rawGroups":["call-out"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/tech-call-out.png?v=1764667420","price":9,"isPro":false,"link":"https://section.store/pages/device-bundle#tech-callout"},{"id":"tabs-pro","title":"Tabs Pro 💎","handle":"tabs-pro","groups":["tabs","product-ingredients"],"rawGroups":["tabs","product"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/tabs-pro.png?v=1764667421","price":14,"isPro":true,"link":"https://section.store/products/snow-peak-mola-headlamp#tabs-pro"},{"id":"tabs","title":"Tabs","handle":"tabs","groups":["tabs","product-ingredients"],"rawGroups":["tabs","product"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/tabs.png?v=1764667421","price":9,"isPro":false,"link":"https://section.store/products/snow-peak-mola-headlamp#tabs-pro"},{"id":"whatsapp-chat-button","title":"Whatsapp chat button","handle":"whatsapp-chat-button","groups":["snippet","other"],"rawGroups":["snippet","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/whatsapp-chat-button.png?v=1764667421","price":9,"isPro":false,"link":"https://section.store/pages/whatsapp-chat-button"},{"id":"slideshow-1","title":"Slideshow #1","handle":"slideshow-1","groups":["slider","hero"],"rawGroups":["slideshow","banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slideshow-1.png?v=1764667423","price":9,"isPro":false,"link":"https://section.store/pages/slideshow-1"},{"id":"slideshow-2","title":"Slideshow #2","handle":"slideshow-2","groups":["slider","hero"],"rawGroups":["slideshow","banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slideshow-2.png?v=1764667423","price":9,"isPro":false,"link":"https://section.store/pages/slideshow-2"},{"id":"slideshow-3","title":"Slideshow #3","handle":"slideshow-3","groups":["slider","hero"],"rawGroups":["slideshow","banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slideshow-3.png?v=1764667424","price":9,"isPro":false,"link":"https://section.store/pages/slideshow-3"},{"id":"back-to-top","title":"Back to top","handle":"back-to-top","groups":["snippet","other","free"],"rawGroups":["back-to-top","other","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/back-to-top.png?v=1764667423","price":0,"isPro":false,"link":"https://section.store/products/the-scout-skincare-kit"},{"id":"trust-badges-emojis","title":"Trust badges (emojis)","handle":"trust-badges-emojis","groups":["snippet","features"],"rawGroups":["trust badges","snippet","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/trust-badges-emojis.png?v=1764667424","price":9,"isPro":false,"link":"https://section.store/products/the-scout-skincare-kit"},{"id":"collection-tabs","title":"Collection tabs","handle":"collection-tabs","groups":["tabs","collection","slider"],"rawGroups":["tabs","collections","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-tabs.png?v=1764667425","price":9,"isPro":false,"link":"https://section.store/pages/birds#ss-collection-tabs"},{"id":"hero-1","title":"Hero #1","handle":"hero-1","groups":["slider","hero"],"rawGroups":["slideshow","banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-1.png?v=1764667426","price":9,"isPro":false,"link":"https://section.store/pages/hero-1"},{"id":"text-block","title":"Text block","handle":"text-block","groups":["text","free"],"rawGroups":["text","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/text-block.png?v=1764667424","price":0,"isPro":false,"link":"https://section.store/pages/text-block"},{"id":"countdown-timer-1","title":"Countdown timer #1","handle":"countdown-timer-1","groups":["countdown-timer"],"rawGroups":["countdown-timer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/countdown-timer-1.png?v=1764667426","price":9,"isPro":false,"link":"https://section.store/pages/countdown-timer-1"},{"id":"countdown-timer-bar","title":"Countdown timer bar","handle":"countdown-timer-bar","groups":["countdown-timer","header"],"rawGroups":["countdown-timer","announcement bar"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/countdown-timer-bar.png?v=1764667426","price":9,"isPro":false,"link":"https://section.store/pages/countdown-timer-bar"},{"id":"countdown-timer-2","title":"Countdown timer #2","handle":"countdown-timer-2","groups":["countdown-timer"],"rawGroups":["countdown-timer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/countdown-timer-2.png?v=1764667426","price":9,"isPro":false,"link":"https://section.store/pages/countdown-timer-2"},{"id":"cookie-banner","title":"Cookie banner","handle":"cookie-banner","groups":["snippet","free"],"rawGroups":["snippet","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/cookie-banner.png?v=1764667426","price":0,"isPro":false,"link":"https://section.store/pages/cookie-banner"},{"id":"feature-1-pro","title":"Feature #1 Pro 💎","handle":"feature-1-pro","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-1-pro.png?v=1764667428","price":14,"isPro":true,"link":"https://section.store/pages/feature-1-pro"},{"id":"scrolling-text-2","title":"Scrolling text #2","handle":"scrolling-text-2","groups":["text","scrolling"],"rawGroups":["text","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-text-2.png?v=1764667428","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-text-2"},{"id":"logo-cloud","title":"Logo cloud","handle":"logo-cloud","groups":["scrolling","testimonial"],"rawGroups":["logo-cloud","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/logo-cloud.png?v=1764667429","price":9,"isPro":false,"link":"https://section.store/pages/logo-cloud"},{"id":"beforeafter-image","title":"Before/after image","handle":"beforeafter-image","groups":["comparison","before-after","images"],"rawGroups":["comparison","before / after","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/beforeafter-image.png?v=1764667428","price":9,"isPro":false,"link":"https://section.store/pages/before-after-image"},{"id":"typewriter","title":"Typewriter","handle":"typewriter","groups":["text","other"],"rawGroups":["text","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/typewriter.png?v=1764667429","price":9,"isPro":false,"link":"https://section.store/pages/typewriter"},{"id":"multi-columns","title":"Multi columns","handle":"multi-columns","groups":["text","images"],"rawGroups":["text","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/multi-columns.png?v=1764667430","price":9,"isPro":false,"link":"https://section.store/pages/multi-columns"},{"id":"featured-collection-tabs","title":"Featured collection (tabs)","handle":"featured-collection-tabs","groups":["featured-collection","tabs","collection"],"rawGroups":["featured-collection","tabs","products","collections"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-tabs.png?v=1764667430","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-tabs"},{"id":"contact-form","title":"Contact form","handle":"contact-form","groups":["contact-form","other"],"rawGroups":["contact form","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/contact-form.png?v=1764667431","price":9,"isPro":false,"link":"https://section.store/pages/form-builder"},{"id":"comparison-table","title":"Comparison table","handle":"comparison-table","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table.png?v=1764667431","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table"},{"id":"split-screen","title":"Split screen","handle":"split-screen","groups":["text","image-with-text","hero"],"rawGroups":["text","image-with-text","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/split-screen.png?v=1764667432","price":9,"isPro":false,"link":"https://section.store/pages/split-screen"},{"id":"tabs-icon-image","title":"Tabs (icon + image)","handle":"tabs-icon-image","groups":["tabs","faq"],"rawGroups":["tabs","faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/tabs-icon-image.png?v=1764667433","price":9,"isPro":false,"link":"https://section.store/pages/faq-w-icon-image"},{"id":"split-screen-video","title":"Split screen (video)","handle":"split-screen-video","groups":["text","image-with-text","slider","hero","video"],"rawGroups":["text","image-with-text","slideshow","hero","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/split-screen-video.png?v=1764667432","price":9,"isPro":false,"link":"https://section.store/pages/split-screen-video"},{"id":"tabs-icon","title":"Tabs (icon)","handle":"tabs-icon","groups":["tabs","faq"],"rawGroups":["tabs","faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/tabs-icon.png?v=1764667433","price":9,"isPro":false,"link":"https://section.store/pages/tabs-icons"},{"id":"trust-badges-2","title":"Trust badges  #2","handle":"trust-badges-2","groups":["snippet","features"],"rawGroups":["trust badges","snippet","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/trust-badges-2.png?v=1764667434","price":9,"isPro":false,"link":"https://section.store/products/mud-scrub-soap"},{"id":"featured-collection","title":"Featured collection","handle":"featured-collection","groups":["featured-collection","collection","slider"],"rawGroups":["featured-collection","products","collections","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection.png?v=1764667434","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection"},{"id":"shop-the-look","title":"Shop the look","handle":"shop-the-look","groups":["shop-the-look","collection","other"],"rawGroups":["shop-the-look","products","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/shop-the-look.png?v=1764667435","price":9,"isPro":false,"link":"https://section.store/pages/shop-the-look"},{"id":"text-block-pro","title":"Text block pro 💎","handle":"text-block-pro","groups":["text","image-with-text","images"],"rawGroups":["text","image-with-text","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/text-block-pro.png?v=1764667435","price":14,"isPro":true,"link":"https://section.store/pages/text-block-pro"},{"id":"sticker-stamp-spinning","title":"Sticker / Stamp (spinning)","handle":"sticker-stamp-spinning","groups":["text","other","images"],"rawGroups":["text","other","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/sticker-stamp-spinning.png?v=1764667436","price":9,"isPro":false,"link":"https://section.store/pages/sticker-stamp"},{"id":"slideshow-4","title":"Slideshow #4","handle":"slideshow-4","groups":["slider","hero"],"rawGroups":["slideshow","banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slideshow-4.png?v=1764667437","price":9,"isPro":false,"link":"https://section.store/pages/slideshow-4"},{"id":"media-grid","title":"Media grid","handle":"media-grid","groups":["images","video"],"rawGroups":["grid","gallery","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/media-grid.png?v=1764667437","price":9,"isPro":false,"link":"https://section.store/pages/media-grid"},{"id":"multi-columns-video","title":"Multi columns (video)","handle":"multi-columns-video","groups":["text","video"],"rawGroups":["text","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/multi-columns-video.jpg?v=1764667436","price":9,"isPro":false,"link":"https://section.store/pages/multicolumn-video"},{"id":"map","title":"Map","handle":"map","groups":["other"],"rawGroups":["other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/map.png?v=1764667438","price":9,"isPro":false,"link":"https://section.store/pages/map"},{"id":"testimonial-2","title":"Testimonial #2","handle":"testimonial-2","groups":["slider","testimonial"],"rawGroups":["slider","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-2.png?v=1764667438","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-2"},{"id":"stats","title":"Stats","handle":"stats","groups":["text","other"],"rawGroups":["text","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/stats.png?v=1764667438","price":9,"isPro":false,"link":"https://section.store/pages/influence-text"},{"id":"faq-1-pro","title":"FAQ #1 Pro 💎","handle":"faq-1-pro","groups":["tabs","faq"],"rawGroups":["tabs","faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-1-pro.png?v=1764667439","price":14,"isPro":true,"link":"https://section.store/pages/faq-1-pro"},{"id":"neon-text","title":"Neon Text","handle":"neon-text","groups":["text","other"],"rawGroups":["text","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/neon-text.png?v=1764667440","price":9,"isPro":false,"link":"https://section.store/pages/neon-sign"},{"id":"product-countdown-timer","title":"Product countdown timer","handle":"product-countdown-timer","groups":["countdown-timer","snippet"],"rawGroups":["countdown-timer","snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-countdown-timer.png?v=1764667439","price":14,"isPro":true,"link":"https://section.store/products/lodge-womens-shirt"},{"id":"upsell-cross-sell-3","title":"Upsell & cross-sell #3","handle":"upsell-cross-sell-3","groups":["upsell","snippet"],"rawGroups":["upsell","cross sell","snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/upsell-cross-sell-3.png?v=1764667441","price":9,"isPro":false,"link":"https://section.store/products/chevron"},{"id":"product-tabs","title":"Product tabs","handle":"product-tabs","groups":["tabs","snippet","product-ingredients","page-templates","popular"],"rawGroups":["tabs","snippet","product","product page","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-tabs.png?v=1764667439","price":14,"isPro":true,"link":"https://section.store/products/long-sleeve-swing"},{"id":"comparison-table-2","title":"Comparison table #2","handle":"comparison-table-2","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-2.png?v=1764667441","price":9,"isPro":false,"link":"https://section.store/pages/product-vs-others"},{"id":"circle-menu-pro","title":"Circle menu pro 💎","handle":"circle-menu-pro","groups":["collection","images","header"],"rawGroups":["collections","images","navigation"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/circle-menu-pro.png?v=1764667441","price":14,"isPro":true,"link":"https://section.store/pages/circle-menu-pro"},{"id":"video-with-text","title":"Video with text","handle":"video-with-text","groups":["text","images","video"],"rawGroups":["text","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-with-text.png?v=1764667441","price":9,"isPro":false,"link":"https://section.store/pages/image-or-video-with-text"},{"id":"product-addons","title":"Product addons","handle":"product-addons","groups":["upsell","snippet","page-templates"],"rawGroups":["upsell","cross sell","snippet","product page"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-addons.png?v=1764667442","price":14,"isPro":true,"link":"https://section.store/products/Organic-Bandana"},{"id":"video-grid-social-media","title":"Video grid (social media)","handle":"video-grid-social-media","groups":["testimonial","video","popular"],"rawGroups":["testimonial","video","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-grid-social-media.png?v=1764667443","price":9,"isPro":false,"link":"https://section.store/pages/video-from-social"},{"id":"featured-collection-2","title":"Featured collection #2","handle":"featured-collection-2","groups":["featured-collection","collection","slider"],"rawGroups":["featured-collection","products","collections","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-2.png?v=1764667443","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-2"},{"id":"instafeed-2","title":"Instafeed #2","handle":"instafeed-2","groups":["scrolling","images","free"],"rawGroups":["instafeed","gallery","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/instafeed-2.png?v=1764667443","price":0,"isPro":false,"link":"https://section.store/pages/instafeed-new"},{"id":"wave","title":"Wave","handle":"wave","groups":["other","free"],"rawGroups":["other","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/wave.png?v=1764667445","price":0,"isPro":false,"link":"https://section.store/pages/wave"},{"id":"scrolling-images","title":"Scrolling images","handle":"scrolling-images","groups":["images","scrolling","testimonial"],"rawGroups":["images","scrolling","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-images.png?v=1764667445","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-image"},{"id":"scrolling-images-2","title":"Scrolling images #2","handle":"scrolling-images-2","groups":["images","scrolling"],"rawGroups":["images","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-images-2.png?v=1764667444","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-image-2"},{"id":"image-cards","title":"Image cards","handle":"image-cards","groups":["blog","images"],"rawGroups":["blog","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-cards.png?v=1764667447","price":9,"isPro":false,"link":"https://section.store/pages/articles"},{"id":"hero-2","title":"Hero #2 🌟","handle":"hero-2","groups":["hero"],"rawGroups":["hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-2.png?v=1764667446","price":9,"isPro":false,"link":"https://section.store/pages/hero-2"},{"id":"blog-4","title":"Blog #4","handle":"blog-4","groups":["blog"],"rawGroups":["blog"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/blog-4.png?v=1764667446","price":9,"isPro":false,"link":"https://section.store/pages/articles-2"},{"id":"feature-7","title":"Feature #7","handle":"feature-7","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-7.png?v=1764667446","price":9,"isPro":false,"link":"https://section.store/pages/feature-7"},{"id":"contact-form-pro","title":"Contact form pro 💎","handle":"contact-form-pro","groups":["contact-form","other"],"rawGroups":["contact form","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/contact-form-pro.png?v=1764667446","price":14,"isPro":true,"link":"https://section.store/pages/contact-pro"},{"id":"pricing-table-1","title":"Pricing table #1","handle":"pricing-table-1","groups":["comparison","other"],"rawGroups":["pricing-table","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/pricing-table-1.png?v=1764667448","price":9,"isPro":false,"link":"https://section.store/pages/pricing-table-1"},{"id":"pricing-table-2","title":"Pricing table #2","handle":"pricing-table-2","groups":["comparison","other"],"rawGroups":["pricing-table","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/pricing-table-2.png?v=1764667448","price":9,"isPro":false,"link":"https://section.store/pages/pricing-table-2"},{"id":"pricing-table-3","title":"Pricing table #3","handle":"pricing-table-3","groups":["comparison","other"],"rawGroups":["pricing-table","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/pricing-table-3.png?v=1764667448","price":9,"isPro":false,"link":"https://section.store/pages/pricing-table-3"},{"id":"masonry-gallery","title":"Masonry gallery","handle":"masonry-gallery","groups":["images"],"rawGroups":["gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/masonry-gallery.png?v=1764667449","price":9,"isPro":false,"link":"https://section.store/pages/gallery"},{"id":"scrolling-beforeafter-images","title":"Scrolling before/after images","handle":"scrolling-beforeafter-images","groups":["comparison","before-after","images","scrolling"],"rawGroups":["comparison","before / after","images","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-beforeafter-images.png?v=1764667450","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-before-after-images"},{"id":"collection-3","title":"Collection #3","handle":"collection-3","groups":["collection","images"],"rawGroups":["collections","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-3.png?v=1764667450","price":9,"isPro":false,"link":"https://section.store/pages/collection-3"},{"id":"testimonial-4","title":"Testimonial #4","handle":"testimonial-4","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-4.png?v=1764667450","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-4"},{"id":"testimonial-5","title":"Testimonial #5","handle":"testimonial-5","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-5.png?v=1764667451","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-5"},{"id":"hero-3","title":"Hero #3","handle":"hero-3","groups":["hero","images","video"],"rawGroups":["banner","hero","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-3.png?v=1764667452","price":9,"isPro":false,"link":"https://section.store/pages/hero-3"},{"id":"image-with-text-3","title":"Image with text #3","handle":"image-with-text-3","groups":["text","image-with-text","images"],"rawGroups":["text","image-with-text","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-3.png?v=1764667452","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-3"},{"id":"scrolling-announcement-bar-2","title":"Scrolling announcement bar #2","handle":"scrolling-announcement-bar-2","groups":["header","scrolling"],"rawGroups":["announcement bar","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-announcement-bar-2.png?v=1764667452","price":9,"isPro":false,"link":"https://section.store/pages/announcement-bar-2"},{"id":"counter","title":"Counter","handle":"counter","groups":["text","other","free"],"rawGroups":["text","other","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/CleanShot_Dec_2_from_jwsandbox_1.webp?v=1764681704","price":0,"isPro":false,"link":"https://section.store/pages/counter"},{"id":"testimonial-6","title":"Testimonial #6","handle":"testimonial-6","groups":["images","testimonial"],"rawGroups":["images","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-6.png?v=1764667455","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-6"},{"id":"feature-8","title":"Feature #8","handle":"feature-8","groups":["image-with-text","features","images"],"rawGroups":["image-with-text","features","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-8.png?v=1764667455","price":9,"isPro":false,"link":"https://section.store/pages/features-8"},{"id":"testimonial-7","title":"Testimonial #7","handle":"testimonial-7","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-7.png?v=1764667455","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-7"},{"id":"back-to-top-2","title":"Back to top #2","handle":"back-to-top-2","groups":["snippet","other"],"rawGroups":["back-to-top","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/back-to-top-2.png?v=1764667456","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-5"},{"id":"beforeafter-image-2","title":"Before/after image #2","handle":"beforeafter-image-2","groups":["comparison","before-after","image-with-text"],"rawGroups":["comparison","before / after","image-with-text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/beforeafter-image-2.png?v=1764667455","price":9,"isPro":false,"link":"https://section.store/pages/before-after-image-2"},{"id":"product-coupon","title":"Product coupon","handle":"product-coupon","groups":["snippet","page-templates","other"],"rawGroups":["snippet","product page","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-coupon.png?v=1764667455","price":14,"isPro":true,"link":"https://section.store/products/gertrude-cardigan"},{"id":"product-tabs-2","title":"Product tabs #2","handle":"product-tabs-2","groups":["tabs","snippet","product-ingredients","page-templates"],"rawGroups":["tabs","snippet","product","product page"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-tabs-2.png?v=1764667456","price":14,"isPro":true,"link":"https://section.store/products/galaxy-light-projector"},{"id":"testimonial-8","title":"Testimonial #8","handle":"testimonial-8","groups":["testimonial","popular"],"rawGroups":["testimonial","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-8.jpg?v=1764667456","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-8"},{"id":"video-pop","title":"Video pop","handle":"video-pop","groups":["video"],"rawGroups":["video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-pop.png?v=1764667459","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-8"},{"id":"video-image-text-2","title":"Video & image text #2","handle":"video-image-text-2","groups":["image-with-text","images","video"],"rawGroups":["image-with-text","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-image-text-2.png?v=1764667457","price":9,"isPro":false,"link":"https://section.store/pages/video-image-text-2"},{"id":"product-ingredients","title":"Product ingredients","handle":"product-ingredients","groups":["product-ingredients","other"],"rawGroups":["product-ingredients","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-ingredients.png?v=1764667458","price":14,"isPro":true,"link":"https://section.store/pages/product-ingredients"},{"id":"image-with-text-4","title":"Image with text #4","handle":"image-with-text-4","groups":["image-with-text","images"],"rawGroups":["image-with-text","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-4.png?v=1764667458","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-2"},{"id":"video-grid-tabs","title":"Video grid tabs","handle":"video-grid-tabs","groups":["tabs","images","video"],"rawGroups":["tabs","grid","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-grid-tabs.png?v=1764667459","price":9,"isPro":false,"link":"https://section.store/pages/video-grid-tabs"},{"id":"collection-4","title":"Collection #4","handle":"collection-4","groups":["image-with-text","collection","images"],"rawGroups":["image-with-text","collections","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-4.png?v=1764667460","price":9,"isPro":false,"link":"https://section.store/pages/collection-4"},{"id":"timeline","title":"Timeline","handle":"timeline","groups":["steps","other"],"rawGroups":["timeline","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/timeline.png?v=1764667460","price":9,"isPro":false,"link":"https://section.store/pages/timeline"},{"id":"timeline-horizontal","title":"Timeline horizontal","handle":"timeline-horizontal","groups":["steps","other"],"rawGroups":["timeline","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/timeline-horizontal.png?v=1764667460","price":9,"isPro":false,"link":"https://section.store/pages/timeline-horizontal"},{"id":"tabbed-content","title":"Tabbed Content","handle":"tabbed-content","groups":["tabs","faq"],"rawGroups":["tabs","faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/tabbed-content.png?v=1764667461","price":9,"isPro":false,"link":"https://section.store/pages/faq-4"},{"id":"hotspots","title":"Hotspots","handle":"hotspots","groups":["other","hotspots","images"],"rawGroups":["other","hotspots","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hotspots.png?v=1764667462","price":9,"isPro":false,"link":"https://section.store/pages/hotspots"},{"id":"hotspots-2","title":"Hotspots #2","handle":"hotspots-2","groups":["other","hotspots","images"],"rawGroups":["other","hotspots","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hotspots-2.png?v=1764667461","price":9,"isPro":false,"link":"https://section.store/pages/hotspots-2"},{"id":"product-reviews-video","title":"Product reviews (video)","handle":"product-reviews-video","groups":["snippet","page-templates","other","testimonial","video"],"rawGroups":["snippet","product page","other","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-reviews-video.png?v=1764667462","price":14,"isPro":true,"link":"https://section.store/products/harriet-chambray"},{"id":"product-reviews","title":"Product reviews","handle":"product-reviews","groups":["snippet","page-templates","other","testimonial","popular"],"rawGroups":["snippet","product page","other","testimonial","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-reviews.png?v=1764667462","price":14,"isPro":true,"link":"https://section.store/products/guaranteed"},{"id":"calendar","title":"Calendar","handle":"calendar","groups":["other"],"rawGroups":["other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/calendar.png?v=1764667464","price":9,"isPro":false,"link":"https://section.store/pages/calendar"},{"id":"masonry-grid","title":"Masonry Grid","handle":"masonry-grid","groups":["images","video"],"rawGroups":["grid","gallery","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/masonry-grid.png?v=1764667465","price":9,"isPro":false,"link":"https://section.store/pages/masonry-gallery"},{"id":"hotspots-3","title":"Hotspots #3","handle":"hotspots-3","groups":["collection","other","hotspots","images"],"rawGroups":["products","other","hotspots","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hotspots-3.png?v=1764667464","price":9,"isPro":false,"link":"https://section.store/pages/hotspots-3"},{"id":"grid-pro","title":"Grid pro 💎","handle":"grid-pro","groups":["images","video"],"rawGroups":["grid","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/grid-pro.png?v=1764667465","price":14,"isPro":true,"link":"https://section.store/pages/grid-pro"},{"id":"progress-bars","title":"Progress bars","handle":"progress-bars","groups":["other"],"rawGroups":["other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/progress-bars.png?v=1764667465","price":14,"isPro":true,"link":"https://section.store/pages/progress-bars"},{"id":"slider","title":"Slider","handle":"slider","groups":["collection","blog","slider"],"rawGroups":["products","blog","collections","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider.png?v=1764667464","price":9,"isPro":false,"link":"https://section.store/pages/grid-pro#ss-slider"},{"id":"hero-4","title":"Hero #4","handle":"hero-4","groups":["slider","hero","hotspots"],"rawGroups":["slideshow","banner","hero","hotspots"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-4.png?v=1764667467","price":9,"isPro":false,"link":"https://section.store/pages/hero-4"},{"id":"progress-circles","title":"Progress circles","handle":"progress-circles","groups":["other"],"rawGroups":["other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/progress-circles.png?v=1764667465","price":14,"isPro":true,"link":"https://section.store/pages/progress-circles"},{"id":"blog-5","title":"Blog #5","handle":"blog-5","groups":["blog"],"rawGroups":["blog"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/blog-5.png?v=1764667467","price":9,"isPro":false,"link":"https://section.store/pages/blog-5"},{"id":"testimonial-9","title":"Testimonial #9","handle":"testimonial-9","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-9.png?v=1764667467","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-9"},{"id":"video-with-text-3","title":"Video with text #3","handle":"video-with-text-3","groups":["image-with-text","hero","images","video"],"rawGroups":["image-with-text","hero","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-with-text-3.png?v=1764667468","price":9,"isPro":false,"link":"https://section.store/pages/video-with-text-3"},{"id":"feature-9","title":"Feature #9","handle":"feature-9","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-9.png?v=1764667469","price":9,"isPro":false,"link":"https://section.store/pages/features-9"},{"id":"video-banner-2","title":"Video banner #2","handle":"video-banner-2","groups":["hero","video"],"rawGroups":["banner","hero","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-banner-2.png?v=1764667469","price":9,"isPro":false,"link":"https://section.store/pages/video-banner-2"},{"id":"feature-10","title":"Feature #10","handle":"feature-10","groups":["image-with-text","features"],"rawGroups":["image-with-text","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-10.png?v=1764667469","price":9,"isPro":false,"link":"https://section.store/pages/product-details"},{"id":"instafeed-3","title":"Instafeed #3","handle":"instafeed-3","groups":["scrolling","free"],"rawGroups":["instafeed","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/instafeed-3.png?v=1764667468","price":0,"isPro":false,"link":"https://section.store/pages/instafeed-3"},{"id":"scrolling-logo-cloud-2","title":"Scrolling logo cloud #2","handle":"scrolling-logo-cloud-2","groups":["scrolling","images"],"rawGroups":["logo-cloud","images","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-logo-cloud-2.png?v=1764667470","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-logo-cloud-2"},{"id":"comparison-table-3","title":"Comparison table #3","handle":"comparison-table-3","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-3.png?v=1764667470","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-3"},{"id":"slope","title":"Slope","handle":"slope","groups":["other","free"],"rawGroups":["other","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slope.png?v=1764667470","price":0,"isPro":false,"link":"https://section.store/pages/slope"},{"id":"faq-5","title":"FAQ #5","handle":"faq-5","groups":["faq"],"rawGroups":["faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-5.png?v=1764667471","price":9,"isPro":false,"link":"https://section.store/pages/faq-5"},{"id":"collection-5","title":"Collection #5","handle":"collection-5","groups":["collection"],"rawGroups":["collections"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-5.png?v=1764667472","price":9,"isPro":false,"link":"https://section.store/pages/collections-5"},{"id":"image-with-text-5","title":"Image with text #5","handle":"image-with-text-5","groups":["image-with-text","slider","images"],"rawGroups":["image-with-text","slideshow","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-5.png?v=1764667473","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-5"},{"id":"product-addons-2","title":"Product addons #2","handle":"product-addons-2","groups":["upsell","snippet","popular"],"rawGroups":["upsell","cross sell","snippet","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-addons-2.png?v=1764667472","price":14,"isPro":true,"link":"https://section.store/products/hudderton-backpack"},{"id":"featured-collection-3","title":"Featured collection #3","handle":"featured-collection-3","groups":["featured-collection","collection"],"rawGroups":["featured-collection","products","collections"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-3.png?v=1764667473","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-3"},{"id":"about-us","title":"About us","handle":"about-us","groups":["image-with-text","images"],"rawGroups":["image-with-text","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/about-us.png?v=1764667474","price":9,"isPro":false,"link":"https://section.store/pages/about-us"},{"id":"product-ingredients-2","title":"Product ingredients #2","handle":"product-ingredients-2","groups":["product-ingredients","other"],"rawGroups":["product-ingredients","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-ingredients-2.png?v=1764667474","price":14,"isPro":true,"link":"https://section.store/pages/product-ingredients-2"},{"id":"countdown-timer-3","title":"Countdown timer #3","handle":"countdown-timer-3","groups":["countdown-timer"],"rawGroups":["countdown-timer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/countdown-timer-3.png?v=1764667474","price":9,"isPro":false,"link":"https://section.store/pages/countdown-timer-3"},{"id":"video-grid-social-media-2","title":"Video grid (social media) #2","handle":"video-grid-social-media-2","groups":["testimonial","video"],"rawGroups":["testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-grid-social-media-2.png?v=1764667475","price":9,"isPro":false,"link":"https://section.store/pages/video-from-social-2"},{"id":"video-with-text-4","title":"Video with text #4","handle":"video-with-text-4","groups":["slider","video"],"rawGroups":["slider","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-with-text-4.png?v=1764667474","price":9,"isPro":false,"link":"https://section.store/pages/video-with-text-4"},{"id":"product-videos","title":"Product videos","handle":"product-videos","groups":["snippet","product-ingredients","video","popular"],"rawGroups":["snippet","product","video","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-videos.png?v=1764667475","price":14,"isPro":true,"link":"https://section.store/products/product-videos"},{"id":"shoppable-video","title":"Shoppable video","handle":"shoppable-video","groups":["collection","testimonial","video","popular"],"rawGroups":["products","testimonial","video","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/shoppable-video.png?v=1764667476","price":9,"isPro":false,"link":"https://section.store/pages/shoppable-video"},{"id":"feature-11","title":"Feature #11","handle":"feature-11","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-11.png?v=1764667476","price":9,"isPro":false,"link":"https://section.store/pages/features-11"},{"id":"comparison-table-4","title":"Comparison table #4","handle":"comparison-table-4","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-4.png?v=1764667477","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-4"},{"id":"product-comparison-table","title":"Product comparison table","handle":"product-comparison-table","groups":["comparison","snippet"],"rawGroups":["comparison","snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-comparison-table.png?v=1764667477","price":14,"isPro":true,"link":"https://section.store/products/sunset-throw"},{"id":"trust-badges-pro","title":"Trust badges pro 💎","handle":"trust-badges-pro","groups":["snippet","features"],"rawGroups":["trust badges","snippet","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/trust-badges-pro.png?v=1764667477","price":14,"isPro":true,"link":"https://section.store/products/fern-throw"},{"id":"image-with-text-6","title":"Image with text #6","handle":"image-with-text-6","groups":["image-with-text","images"],"rawGroups":["image-with-text","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-6.png?v=1764667478","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-6"},{"id":"announcement-bar-slider","title":"Announcement bar (slider)","handle":"announcement-bar-slider","groups":["slider","header"],"rawGroups":["slider","announcement bar"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/announcement-bar-slider.png?v=1764667478","price":9,"isPro":false,"link":"https://section.store/pages/announcement-bar-slider"},{"id":"scrolling-products","title":"Scrolling products","handle":"scrolling-products","groups":["collection","scrolling"],"rawGroups":["products","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-products.png?v=1764667479","price":14,"isPro":true,"link":"https://section.store/pages/scrolling-products"},{"id":"featured-collection-4","title":"Featured collection #4","handle":"featured-collection-4","groups":["featured-collection","tabs","collection"],"rawGroups":["featured-collection","tabs","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-4.png?v=1764667479","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-4"},{"id":"beforeafter-image-3","title":"Before/after image #3","handle":"beforeafter-image-3","groups":["comparison","before-after","images"],"rawGroups":["comparison","before / after","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/beforeafter-image-3.png?v=1764667480","price":9,"isPro":false,"link":"https://section.store/pages/before-after-image-3"},{"id":"testimonial-10","title":"Testimonial #10","handle":"testimonial-10","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-10.png?v=1764667481","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-10"},{"id":"steps-1","title":"Steps #1","handle":"steps-1","groups":["steps","text"],"rawGroups":["steps","text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/steps-1.png?v=1764667480","price":9,"isPro":false,"link":"https://section.store/pages/steps"},{"id":"feature-12","title":"Feature #12","handle":"feature-12","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-12.png?v=1764667481","price":9,"isPro":false,"link":"https://section.store/pages/feature-11"},{"id":"media-grid-2","title":"Media grid #2","handle":"media-grid-2","groups":["collection","images"],"rawGroups":["collections","gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/media-grid-2.png?v=1764667482","price":9,"isPro":false,"link":"https://section.store/pages/media-grid-2"},{"id":"image-gallery-2","title":"Image gallery #2","handle":"image-gallery-2","groups":["images"],"rawGroups":["gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-gallery-2.png?v=1764667482","price":9,"isPro":false,"link":"https://section.store/pages/image-gallery-2"},{"id":"steps-2","title":"Steps #2","handle":"steps-2","groups":["steps","image-with-text"],"rawGroups":["steps","image-with-text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/steps-2.png?v=1764667482","price":9,"isPro":false,"link":"https://section.store/pages/steps-2"},{"id":"faq-6","title":"FAQ #6","handle":"faq-6","groups":["steps","tabs","image-with-text","faq"],"rawGroups":["steps","tabs","image-with-text","faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-6.png?v=1764667483","price":9,"isPro":false,"link":"https://section.store/pages/faq-6"},{"id":"audio-player","title":"Audio Player","handle":"audio-player","groups":["other"],"rawGroups":["other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/audio-player.png?v=1764667484","price":9,"isPro":false,"link":"https://section.store/pages/player"},{"id":"slider-2","title":"Slider #2","handle":"slider-2","groups":["collection","blog","slider","images","popular"],"rawGroups":["products","blog","collections","slider","images","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-2.png?v=1764667485","price":9,"isPro":false,"link":"https://section.store/pages/slider-2"},{"id":"delivery-timer","title":"Delivery timer","handle":"delivery-timer","groups":["snippet","other"],"rawGroups":["snippet","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/delivery-timer.png?v=1764667484","price":9,"isPro":false,"link":"https://section.store/products/jade-throw"},{"id":"bundle-builder","title":"Bundle builder","handle":"bundle-builder","groups":["collection","upsell","other"],"rawGroups":["products","bundle builder","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/bundle-builder.png?v=1764667485","price":9,"isPro":false,"link":"https://section.store/pages/build-a-box"},{"id":"feature-13","title":"Feature #13","handle":"feature-13","groups":["image-with-text","features"],"rawGroups":["image-with-text","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-13.png?v=1764667485","price":9,"isPro":false,"link":"https://section.store/pages/feature-13"},{"id":"steps-3","title":"Steps #3","handle":"steps-3","groups":["steps"],"rawGroups":["steps"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/steps-3.png?v=1764667486","price":9,"isPro":false,"link":"https://section.store/pages/steps-3"},{"id":"footer-2","title":"Footer #2","handle":"footer-2","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-2.png?v=1764667486","price":9,"isPro":false,"link":"https://section.store/pages/footer-2"},{"id":"modal-popup","title":"Modal popup","handle":"modal-popup","groups":["contact-form","other"],"rawGroups":["contact form","email signup","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/modal-popup.png?v=1764667486","price":9,"isPro":false,"link":"https://section.store/pages/modal-popup"},{"id":"footer-1","title":"Footer #1","handle":"footer-1","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-1.png?v=1764667487","price":9,"isPro":false,"link":"https://section.store/pages/footer"},{"id":"footer-3","title":"Footer #3","handle":"footer-3","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-3.png?v=1764667487","price":9,"isPro":false,"link":"https://section.store/pages/footer-3"},{"id":"hero-6","title":"Hero #6","handle":"hero-6","groups":["image-with-text","hero"],"rawGroups":["image-with-text","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-6.png?v=1764667489","price":9,"isPro":false,"link":"https://section.store/pages/hero-6"},{"id":"footer-4","title":"Footer #4","handle":"footer-4","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-4.png?v=1764667488","price":9,"isPro":false,"link":"https://section.store/pages/footer-4"},{"id":"hotspots-4","title":"Hotspots #4","handle":"hotspots-4","groups":["steps","image-with-text","hotspots"],"rawGroups":["steps","image-with-text","hotspots"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hotspots-4.png?v=1764667489","price":9,"isPro":false,"link":"https://section.store/pages/hotspots-4"},{"id":"scrolling-text-3","title":"Scrolling text #3","handle":"scrolling-text-3","groups":["text","scrolling"],"rawGroups":["text","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-text-3.png?v=1764667490","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-text-3"},{"id":"hero-7-scrolling","title":"Hero #7 (scrolling)","handle":"hero-7-scrolling","groups":["hero","images","scrolling"],"rawGroups":["hero","images","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-7-scrolling.png?v=1764667491","price":9,"isPro":false,"link":"https://section.store/pages/hero-7"},{"id":"testimonial-11","title":"Testimonial #11","handle":"testimonial-11","groups":["text","testimonial"],"rawGroups":["text","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-11.png?v=1764667491","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-11"},{"id":"image-grid-pro","title":"Image grid pro 💎","handle":"image-grid-pro","groups":["collection","images","hero"],"rawGroups":["products","grid","collections","hero","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-grid-pro.png?v=1764667491","price":14,"isPro":true,"link":"https://section.store/pages/image-grid-pro"},{"id":"terms-conditions-checkbox","title":"Terms & Conditions (Checkbox)","handle":"terms-conditions-checkbox","groups":["snippet","other"],"rawGroups":["snippet","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/terms-conditions-checkbox.png?v=1764667492","price":9,"isPro":false,"link":"https://section.store/cart"},{"id":"parallax-banner","title":"Parallax Banner","handle":"parallax-banner","groups":["hero","images","free"],"rawGroups":["banner","hero","images","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/parallax-banner.png?v=1764667492","price":0,"isPro":false,"link":"https://section.store/pages/parallax-banner"},{"id":"hero-8-scrolling","title":"Hero #8 (Scrolling)","handle":"hero-8-scrolling","groups":["hero","scrolling"],"rawGroups":["banner","hero","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-8-scrolling.png?v=1764667493","price":9,"isPro":false,"link":"https://section.store/pages/hero-8"},{"id":"letter","title":"Letter","handle":"letter","groups":["other"],"rawGroups":["other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/letter.png?v=1764667492","price":9,"isPro":false,"link":"https://section.store/pages/letter"},{"id":"animated-sticker-effects","title":"Animated sticker effects","handle":"animated-sticker-effects","groups":["other","images"],"rawGroups":["other","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/animated-sticker-effects.png?v=1764667493","price":9,"isPro":false,"link":"https://section.store/pages/sticker-stamp-2"},{"id":"testimonial-12","title":"Testimonial #12","handle":"testimonial-12","groups":["slider","testimonial","video"],"rawGroups":["slider","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-12.png?v=1764667494","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-12"},{"id":"animated-text","title":"Animated text","handle":"animated-text","groups":["features","text","other"],"rawGroups":["call-out","text","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/animated-text.png?v=1764667493","price":9,"isPro":false,"link":"https://section.store/pages/animated-text-effect"},{"id":"faq-7","title":"FAQ #7","handle":"faq-7","groups":["faq"],"rawGroups":["faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-7.png?v=1764667493","price":9,"isPro":false,"link":"https://section.store/pages/faq-7"},{"id":"wave-2","title":"Wave #2","handle":"wave-2","groups":["other","free"],"rawGroups":["other","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/wave-2.png?v=1764667494","price":0,"isPro":false,"link":"https://section.store/pages/wave-2"},{"id":"flexible-tabs","title":"Flexible tabs","handle":"flexible-tabs","groups":["tabs","faq","images","video"],"rawGroups":["tabs","faq","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/flexible-tabs.png?v=1764667496","price":9,"isPro":false,"link":"https://section.store/pages/flexible-tabs"},{"id":"hotspots-5","title":"Hotspots #5","handle":"hotspots-5","groups":["hero","hotspots"],"rawGroups":["hero","hotspots"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hotspots-5.png?v=1764667496","price":9,"isPro":false,"link":"https://section.store/pages/hotspots-5"},{"id":"hero-9","title":"Hero #9","handle":"hero-9","groups":["image-with-text","hero","images","scrolling"],"rawGroups":["image-with-text","hero","images","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-9.png?v=1764667496","price":9,"isPro":false,"link":"https://section.store/pages/hero-9"},{"id":"comparison-table-5","title":"Comparison table #5","handle":"comparison-table-5","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-5.png?v=1764667497","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-5"},{"id":"image-with-text-8","title":"Image with text #8","handle":"image-with-text-8","groups":["image-with-text","images"],"rawGroups":["image-with-text","gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-8.png?v=1764667497","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-8"},{"id":"trust-badges-3","title":"Trust badges #3","handle":"trust-badges-3","groups":["snippet","features"],"rawGroups":["trust badges","snippet","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/trust-badges-3.png?v=1764667498","price":9,"isPro":false,"link":"https://section.store/products/via-throw"},{"id":"featured-collection-5","title":"Featured collection #5","handle":"featured-collection-5","groups":["featured-collection","collection"],"rawGroups":["featured-collection","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-5.png?v=1764667497","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-5"},{"id":"beforeafter-image-4","title":"Before/after image #4","handle":"beforeafter-image-4","groups":["comparison","before-after","image-with-text","images"],"rawGroups":["comparison","before / after","image-with-text","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/beforeafter-image-4.png?v=1764667498","price":9,"isPro":false,"link":"https://section.store/pages/before-after-image-4"},{"id":"bento-grid","title":"Bento grid","handle":"bento-grid","groups":["text","image-with-text","images"],"rawGroups":["text","image-with-text","grid"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/bento-grid.png?v=1764667499","price":9,"isPro":false,"link":"https://section.store/pages/bento-grid"},{"id":"testimonial-13","title":"Testimonial #13","handle":"testimonial-13","groups":["scrolling","testimonial"],"rawGroups":["scrolling","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-13.png?v=1764667500","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-13"},{"id":"slideshow-5","title":"Slideshow #5","handle":"slideshow-5","groups":["slider","hero","images"],"rawGroups":["slideshow","hero","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slideshow-5.png?v=1764667500","price":9,"isPro":false,"link":"https://section.store/pages/slideshow-5"},{"id":"hero-10","title":"Hero #10","handle":"hero-10","groups":["hero"],"rawGroups":["banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-10.png?v=1764667502","price":9,"isPro":false,"link":"https://section.store/pages/hero-10"},{"id":"image-with-text-7","title":"Image with text #7","handle":"image-with-text-7","groups":["image-with-text","images"],"rawGroups":["image-with-text","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-7.png?v=1764667501","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-7"},{"id":"testimonial-14","title":"Testimonial #14","handle":"testimonial-14","groups":["slider","testimonial"],"rawGroups":["slider","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-14.png?v=1764667501","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-14"},{"id":"slider-3","title":"Slider #3","handle":"slider-3","groups":["collection","blog","slider","images"],"rawGroups":["products","blog","collections","slider","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-3.png?v=1764667502","price":9,"isPro":false,"link":"https://section.store/pages/slider-3"},{"id":"image-with-text-9","title":"Image with text #9","handle":"image-with-text-9","groups":["image-with-text"],"rawGroups":["image-with-text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-9.png?v=1764667504","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-9"},{"id":"faq-8","title":"FAQ #8","handle":"faq-8","groups":["tabs","faq"],"rawGroups":["tabs","faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-8.png?v=1764667503","price":9,"isPro":false,"link":"https://section.store/pages/faq-8"},{"id":"faq-9","title":"FAQ #9","handle":"faq-9","groups":["tabs","faq"],"rawGroups":["tabs","faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-9.png?v=1764667503","price":9,"isPro":false,"link":"https://section.store/pages/faq-9"},{"id":"video-grid-3","title":"Video grid #3","handle":"video-grid-3","groups":["images","video"],"rawGroups":["grid","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-grid-3.png?v=1764667504","price":9,"isPro":false,"link":"https://section.store/pages/video-grid-3"},{"id":"image-with-text-10","title":"Image with text #10","handle":"image-with-text-10","groups":["image-with-text","hero","scrolling"],"rawGroups":["image-with-text","hero","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-10.png?v=1764667505","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-10"},{"id":"video-banner-3","title":"Video banner #3","handle":"video-banner-3","groups":["hero","video"],"rawGroups":["banner","hero","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-banner-3.png?v=1764667505","price":9,"isPro":false,"link":"https://section.store/pages/video-banner-3"},{"id":"image-with-text-11","title":"Image with text #11","handle":"image-with-text-11","groups":["image-with-text","other","images"],"rawGroups":["image-with-text","other","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-11.png?v=1764667505","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-11"},{"id":"steps-4","title":"Steps #4","handle":"steps-4","groups":["steps","images"],"rawGroups":["steps","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/steps-4.png?v=1764667505","price":9,"isPro":false,"link":"https://section.store/pages/steps-4"},{"id":"comparison-table-6","title":"Comparison table #6","handle":"comparison-table-6","groups":["comparison","popular"],"rawGroups":["comparison","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-6.png?v=1764667506","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-6"},{"id":"scrolling-logo-cloud-3","title":"Scrolling logo cloud #3","handle":"scrolling-logo-cloud-3","groups":["scrolling"],"rawGroups":["logo-cloud","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-logo-cloud-3.png?v=1764667507","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-logo-cloud-3"},{"id":"countdown-timer-4","title":"Countdown timer #4","handle":"countdown-timer-4","groups":["countdown-timer","hero"],"rawGroups":["countdown-timer","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/countdown-timer-4.png?v=1764667507","price":9,"isPro":false,"link":"https://section.store/pages/countdown-timer-4"},{"id":"instafeed-4","title":"Instafeed #4","handle":"instafeed-4","groups":["scrolling","images"],"rawGroups":["instafeed","images","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/instafeed-4.png?v=1764667507","price":9,"isPro":false,"link":"https://section.store/pages/instafeed-4"},{"id":"404-page","title":"404 page","handle":"404-page","groups":["image-with-text","other"],"rawGroups":["image-with-text","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/404-page.png?v=1764667508","price":9,"isPro":false,"link":"https://section.store/thispagedoesnotexist"},{"id":"scrolling-images-3","title":"Scrolling images #3","handle":"scrolling-images-3","groups":["scrolling","images"],"rawGroups":["instafeed","images","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-images-3.png?v=1764667509","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-images-3"},{"id":"hero-11","title":"Hero #11","handle":"hero-11","groups":["image-with-text","hero"],"rawGroups":["image-with-text","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-11.png?v=1764667509","price":9,"isPro":false,"link":"https://section.store/pages/hero-11"},{"id":"shapes","title":"Shapes","handle":"shapes","groups":["text","other","images","testimonial"],"rawGroups":["text","other","images","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/shapes.png?v=1764667508","price":9,"isPro":false,"link":"https://section.store/pages/shapes"},{"id":"featured-products","title":"Featured products","handle":"featured-products","groups":["product-ingredients","collection","slider"],"rawGroups":["product","products","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-products.png?v=1764667510","price":14,"isPro":true,"link":"https://section.store/pages/featured-products-1"},{"id":"image-with-text-13","title":"Image with text #13","handle":"image-with-text-13","groups":["image-with-text","images"],"rawGroups":["image-with-text","grid","gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-13.png?v=1764667511","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-13"},{"id":"testimonial-15","title":"Testimonial #15","handle":"testimonial-15","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-15.png?v=1764667511","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-15"},{"id":"slider-5","title":"Slider #5","handle":"slider-5","groups":["collection","blog","slider"],"rawGroups":["products","blog","collections","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-5.png?v=1764667511","price":9,"isPro":false,"link":"https://section.store/pages/slider-5"},{"id":"rotating-text","title":"Rotating text","handle":"rotating-text","groups":["text"],"rawGroups":["text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/rotating-text.png?v=1764667512","price":9,"isPro":false,"link":"https://section.store/pages/rotating-text"},{"id":"gallery-3","title":"Gallery #3","handle":"gallery-3","groups":["slider","images","video"],"rawGroups":["slider","gallery","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/gallery-3.png?v=1764667512","price":9,"isPro":false,"link":"https://section.store/pages/gallery-3"},{"id":"collection-7","title":"Collection #7","handle":"collection-7","groups":["collection","images"],"rawGroups":["collections","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-7.png?v=1764667513","price":9,"isPro":false,"link":"https://section.store/pages/collection-7"},{"id":"scrolling-quotes","title":"Scrolling quotes","handle":"scrolling-quotes","groups":["text","scrolling","testimonial"],"rawGroups":["text","scrolling","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-quotes.png?v=1764667512","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-quotes"},{"id":"slider-4","title":"Slider #4","handle":"slider-4","groups":["collection","slider","images"],"rawGroups":["products","collections","slider","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-4.png?v=1764667515","price":9,"isPro":false,"link":"https://section.store/pages/slider-4"},{"id":"collection-list","title":"Collection list","handle":"collection-list","groups":["collection","blog","images"],"rawGroups":["products","blog","grid","collections"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-list.png?v=1764667515","price":9,"isPro":false,"link":"https://section.store/pages/collection-list"},{"id":"image-with-text-15","title":"Image with text #15","handle":"image-with-text-15","groups":["image-with-text"],"rawGroups":["image-with-text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-15.png?v=1764667515","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-15"},{"id":"image-with-text-14","title":"Image with text #14","handle":"image-with-text-14","groups":["image-with-text","scrolling"],"rawGroups":["image-with-text","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-14.png?v=1764667515","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-14"},{"id":"image-with-text-12","title":"Image with text #12","handle":"image-with-text-12","groups":["steps","image-with-text","images"],"rawGroups":["steps","image-with-text","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-12.png?v=1764667516","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-12"},{"id":"image-gallery-4","title":"Image gallery #4","handle":"image-gallery-4","groups":["images"],"rawGroups":["gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-gallery-4.png?v=1764667518","price":9,"isPro":false,"link":"https://section.store/pages/image-gallery-4"},{"id":"scrolling-text-4","title":"Scrolling text #4","handle":"scrolling-text-4","groups":["text","scrolling"],"rawGroups":["text","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-text-4.png?v=1764667517","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-text-4"},{"id":"instafeed-5","title":"Instafeed #5","handle":"instafeed-5","groups":["scrolling","images"],"rawGroups":["instafeed","gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/instafeed-5.png?v=1764667518","price":9,"isPro":false,"link":"https://section.store/pages/instafeed-5"},{"id":"video-with-text-5","title":"Video with text #5","handle":"video-with-text-5","groups":["image-with-text","slider","video"],"rawGroups":["image-with-text","slider","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-with-text-5.png?v=1764667519","price":9,"isPro":false,"link":"https://section.store/pages/video-with-text-5"},{"id":"timeline-2","title":"Timeline #2","handle":"timeline-2","groups":["steps","other"],"rawGroups":["timeline","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/timeline-2.png?v=1764667519","price":9,"isPro":false,"link":"https://section.store/pages/timeline-2"},{"id":"timeline-3","title":"Timeline #3","handle":"timeline-3","groups":["steps","other"],"rawGroups":["timeline","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/timeline-3.png?v=1764667519","price":9,"isPro":false,"link":"https://section.store/pages/timeline-3"},{"id":"collection-6","title":"Collection #6","handle":"collection-6","groups":["image-with-text","collection","images"],"rawGroups":["image-with-text","collections","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-6.png?v=1764667520","price":9,"isPro":false,"link":"https://section.store/pages/collection-6"},{"id":"instafeed-6","title":"Instafeed #6","handle":"instafeed-6","groups":["scrolling","images"],"rawGroups":["instafeed","images","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/instafeed-6.png?v=1764667521","price":9,"isPro":false,"link":"https://section.store/pages/instafeed-6"},{"id":"scrolling-text-5","title":"Scrolling text #5","handle":"scrolling-text-5","groups":["collection","text","scrolling"],"rawGroups":["products","text","collections","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-text-5.png?v=1764667521","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-text-5"},{"id":"slider-6","title":"Slider #6","handle":"slider-6","groups":["collection","blog","slider","images"],"rawGroups":["products","blog","collections","slider","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-6.png?v=1764667521","price":9,"isPro":false,"link":"https://section.store/pages/slider-6"},{"id":"feature-14","title":"Feature #14","handle":"feature-14","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-14.png?v=1764667520","price":9,"isPro":false,"link":"https://section.store/pages/feature-14"},{"id":"scrolling-text-6","title":"Scrolling text #6","handle":"scrolling-text-6","groups":["text","scrolling"],"rawGroups":["text","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-text-6.png?v=1764667522","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-text-6"},{"id":"shop-the-look-2","title":"Shop the look #2","handle":"shop-the-look-2","groups":["shop-the-look","collection","other"],"rawGroups":["shop-the-look","products","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/shop-the-look-2.png?v=1764667523","price":9,"isPro":false,"link":"https://section.store/pages/shop-the-look-2"},{"id":"shop-the-look-3","title":"Shop the look #3","handle":"shop-the-look-3","groups":["shop-the-look","collection","other"],"rawGroups":["shop-the-look","products","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/shop-the-look-3.png?v=1764667523","price":9,"isPro":false,"link":"https://section.store/pages/shop-the-look-3"},{"id":"slideshow-6","title":"Slideshow #6","handle":"slideshow-6","groups":["collection","slider","hero"],"rawGroups":["products","slideshow","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slideshow-6.png?v=1764667523","price":9,"isPro":false,"link":"https://section.store/pages/slideshow-6"},{"id":"image-with-text-16","title":"Image with text #16","handle":"image-with-text-16","groups":["image-with-text","features","scrolling","video"],"rawGroups":["image-with-text","features","scrolling","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-16.png?v=1764667525","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-16"},{"id":"video-grid-4","title":"Video grid #4","handle":"video-grid-4","groups":["images","testimonial","video"],"rawGroups":["grid","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-grid-4.png?v=1764667525","price":9,"isPro":false,"link":"https://section.store/pages/video-grid-4"},{"id":"product-tabs-3","title":"Product tabs #3","handle":"product-tabs-3","groups":["tabs","snippet","product-ingredients","page-templates"],"rawGroups":["tabs","snippet","product","product page"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-tabs-3.png?v=1764667525","price":14,"isPro":true,"link":"https://section.store/products/beige-stripes-beni-bed"},{"id":"instafeed-7","title":"Instafeed #7","handle":"instafeed-7","groups":["scrolling","images"],"rawGroups":["instafeed","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/instafeed-7.png?v=1764667525","price":9,"isPro":false,"link":"https://section.store/pages/instafeed-7"},{"id":"social-icons","title":"Social icons","handle":"social-icons","groups":["other"],"rawGroups":["other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/social-icons.png?v=1764667526","price":9,"isPro":false,"link":"https://section.store/pages/social-icons-block"},{"id":"feature-15","title":"Feature #15","handle":"feature-15","groups":["tabs","features","images"],"rawGroups":["tabs","features","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-15.png?v=1764667527","price":9,"isPro":false,"link":"https://section.store/pages/feature-15"},{"id":"feature-16","title":"Feature #16","handle":"feature-16","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-16.png?v=1764667526","price":9,"isPro":false,"link":"https://section.store/pages/feature-16"},{"id":"gallery-4","title":"Gallery #4","handle":"gallery-4","groups":["images"],"rawGroups":["gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/gallery-4.png?v=1764667528","price":9,"isPro":false,"link":"https://section.store/pages/gallery-4"},{"id":"feature-18","title":"Feature #18","handle":"feature-18","groups":["image-with-text","features"],"rawGroups":["image-with-text","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-18.png?v=1764667529","price":9,"isPro":false,"link":"https://section.store/pages/feature-18"},{"id":"comparison-video","title":"Comparison video","handle":"comparison-video","groups":["comparison","video"],"rawGroups":["comparison","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-video.png?v=1764667529","price":9,"isPro":false,"link":"https://section.store/pages/comparison-video"},{"id":"text-block-2","title":"Text block #2","handle":"text-block-2","groups":["text","other"],"rawGroups":["text","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/text-block-2.png?v=1764667529","price":9,"isPro":false,"link":"https://section.store/pages/text-block-2"},{"id":"slider-7","title":"Slider #7","handle":"slider-7","groups":["collection","blog","slider","images","popular"],"rawGroups":["products","blog","collections","slider","images","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-7.png?v=1764667530","price":9,"isPro":false,"link":"https://section.store/pages/slider-7"},{"id":"video-image-text-3","title":"Video & image text #3","handle":"video-image-text-3","groups":["product-ingredients","image-with-text","images","video"],"rawGroups":["product","image-with-text","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-image-text-3.jpg?v=1764667530","price":9,"isPro":false,"link":"https://section.store/pages/video-image-text-3"},{"id":"size-guide","title":"Size guide","handle":"size-guide","groups":["snippet","page-templates","other"],"rawGroups":["snippet","product page","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/size-guide.jpg?v=1718352974","price":9,"isPro":false,"link":"https://section.store/products/organic-double-cloth-button-down"},{"id":"feature-19","title":"Feature #19","handle":"feature-19","groups":["image-with-text","features"],"rawGroups":["image-with-text","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-19.jpg?v=1764667530","price":9,"isPro":false,"link":"https://section.store/pages/feature-19"},{"id":"footer-5","title":"Footer #5","handle":"footer-5","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-5.png?v=1764667531","price":9,"isPro":false,"link":"https://section.store/pages/footer-5"},{"id":"video-grid-social-media-3","title":"Video grid (social media) #3","handle":"video-grid-social-media-3","groups":["images","testimonial","video"],"rawGroups":["grid","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-grid-social-media-3.png?v=1764667532","price":9,"isPro":false,"link":"https://section.store/pages/video-from-social-3"},{"id":"404-page-2","title":"404 page #2","handle":"404-page-2","groups":["other"],"rawGroups":["other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/404-page-2.png?v=1764667532","price":9,"isPro":false,"link":"https://section.store/pages/404-2"},{"id":"product-videos-2","title":"Product videos #2","handle":"product-videos-2","groups":["snippet","collection","video"],"rawGroups":["snippet","products","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-videos-2.png?v=1764667533","price":14,"isPro":true,"link":"https://section.store/products/pennsylvania-field-notes"},{"id":"trust-badges-4","title":"Trust badges #4","handle":"trust-badges-4","groups":["snippet"],"rawGroups":["trust badges","snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/trust-badges-4.png?v=1764667533","price":9,"isPro":false,"link":"https://section.store/products/bison-ultralight-vest"},{"id":"featured-product","title":"Featured product","handle":"featured-product","groups":["product-ingredients","hero","images"],"rawGroups":["product","hero","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-product.png?v=1764667535","price":14,"isPro":true,"link":"https://section.store/pages/featured-product"},{"id":"scrolling-text-7","title":"Scrolling text #7","handle":"scrolling-text-7","groups":["text","scrolling"],"rawGroups":["text","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-text-7.png?v=1764667533","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-text-7"},{"id":"gallery-5","title":"Gallery #5","handle":"gallery-5","groups":["images"],"rawGroups":["gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/gallery-5.jpg?v=1764667535","price":9,"isPro":false,"link":"https://section.store/pages/gallery-5"},{"id":"feature-17","title":"Feature #17","handle":"feature-17","groups":["image-with-text","features","video"],"rawGroups":["image-with-text","features","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-17.jpg?v=1764667535","price":9,"isPro":false,"link":"https://section.store/pages/feature-17"},{"id":"faq-10","title":"FAQ #10","handle":"faq-10","groups":["tabs","faq"],"rawGroups":["tabs","faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-10.jpg?v=1764667537","price":9,"isPro":false,"link":"https://section.store/pages/faq-10"},{"id":"scrolling-product-text","title":"Scrolling product text","handle":"scrolling-product-text","groups":["snippet","collection","scrolling"],"rawGroups":["snippet","products","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-product-text.jpg?v=1764667536","price":14,"isPro":true,"link":"https://section.store/products/revolution%E2%84%A2-25l-convertible-carryall"},{"id":"hero-13","title":"Hero #13","handle":"hero-13","groups":["hero","video"],"rawGroups":["hero","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-13.jpg?v=1764667537","price":9,"isPro":false,"link":"https://section.store/pages/hero-13"},{"id":"collection-8","title":"Collection #8","handle":"collection-8","groups":["collection"],"rawGroups":["collections"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-8.jpg?v=1764667536","price":9,"isPro":false,"link":"https://section.store/pages/collection-8"},{"id":"trust-badges-5","title":"Trust badges #5","handle":"trust-badges-5","groups":["snippet"],"rawGroups":["trust badges","snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/trust-badges-5.jpg?v=1764667538","price":9,"isPro":false,"link":"https://section.store/products/16-oz-stoneware-mug"},{"id":"slideshow-7","title":"Slideshow #7","handle":"slideshow-7","groups":["slider","hero"],"rawGroups":["slideshow","banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slideshow-7.jpg?v=1764667538","price":9,"isPro":false,"link":"https://section.store/pages/slideshow-7"},{"id":"video-slider","title":"Video slider","handle":"video-slider","groups":["slider","testimonial","video","popular"],"rawGroups":["slider","testimonial","video","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-slider.jpg?v=1764667538","price":9,"isPro":false,"link":"https://section.store/pages/video-slider"},{"id":"featured-collection-list","title":"Featured collection list","handle":"featured-collection-list","groups":["featured-collection"],"rawGroups":["featured-collection"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-list.jpg?v=1764667540","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-list"},{"id":"comparison-table-8","title":"Comparison table #8","handle":"comparison-table-8","groups":["comparison","tabs","collection"],"rawGroups":["comparison","tabs","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-8.jpg?v=1764667539","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-8"},{"id":"comparison-table-7","title":"Comparison table #7","handle":"comparison-table-7","groups":["comparison","collection"],"rawGroups":["comparison","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-7.jpg?v=1764667540","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-7"},{"id":"scrolling-text-8","title":"Scrolling text #8","handle":"scrolling-text-8","groups":["countdown-timer","text","scrolling"],"rawGroups":["countdown-timer","text","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-text-8.jpg?v=1764667541","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-text-8"},{"id":"hero-12","title":"Hero #12","handle":"hero-12","groups":["product-ingredients","hero","testimonial","video"],"rawGroups":["product","hero","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-12.jpg?v=1764667541","price":9,"isPro":false,"link":"https://section.store/pages/hero-12"},{"id":"product-variants","title":"Product variants","handle":"product-variants","groups":["snippet","collection","popular"],"rawGroups":["snippet","products","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-variants.jpg?v=1764667542","price":14,"isPro":true,"link":"https://section.store/products/revolution-9l-sidekick"},{"id":"collection-list-2","title":"Collection list #2","handle":"collection-list-2","groups":["collection","header"],"rawGroups":["collections","navigation"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-list-2.jpg?v=1764667542","price":9,"isPro":false,"link":"https://section.store/pages/collection-list-2"},{"id":"featured-collection-7","title":"Featured collection #7","handle":"featured-collection-7","groups":["featured-collection","collection"],"rawGroups":["featured-collection","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-7.jpg?v=1764667543","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-7"},{"id":"image-with-text-17","title":"Image with text #17","handle":"image-with-text-17","groups":["image-with-text","hero"],"rawGroups":["image-with-text","banner"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-17.jpg?v=1764667544","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-17"},{"id":"testimonial-16","title":"Testimonial #16","handle":"testimonial-16","groups":["scrolling","testimonial"],"rawGroups":["scrolling","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-16.jpg?v=1764667545","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-16"},{"id":"featured-collection-6","title":"Featured collection #6","handle":"featured-collection-6","groups":["featured-collection","slider"],"rawGroups":["featured-collection","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-6.jpg?v=1764667543","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-6"},{"id":"gallery-6","title":"Gallery #6","handle":"gallery-6","groups":["image-with-text","images","video"],"rawGroups":["image-with-text","gallery","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/gallery-6.jpg?v=1764667545","price":9,"isPro":false,"link":"https://section.store/pages/gallery-6"},{"id":"feature-20","title":"Feature #20","handle":"feature-20","groups":["features","images","scrolling"],"rawGroups":["features","images","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-20.jpg?v=1764667547","price":9,"isPro":false,"link":"https://section.store/pages/feature-20"},{"id":"hotspots-6","title":"Hotspots #6","handle":"hotspots-6","groups":["hotspots","video"],"rawGroups":["hotspots","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hotspots-6.jpg?v=1764667546","price":9,"isPro":false,"link":"https://section.store/pages/hotspots-6"},{"id":"footer-6","title":"Footer #6","handle":"footer-6","groups":["footer","popular"],"rawGroups":["footer","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-6.jpg?v=1764667546","price":9,"isPro":false,"link":"https://section.store/pages/footer-6"},{"id":"features-bar","title":"Features bar","handle":"features-bar","groups":["snippet","page-templates","features"],"rawGroups":["snippet","product page","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/features-bar.jpg?v=1764667547","price":9,"isPro":false,"link":"https://section.store/products/bison-zip-up-jacket"},{"id":"beforeafter-image-5","title":"Before/after image #5","handle":"beforeafter-image-5","groups":["comparison","before-after","features"],"rawGroups":["comparison","before / after","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/beforeafter-image-5.jpg?v=1764667548","price":9,"isPro":false,"link":"https://section.store/pages/before-after-image-5"},{"id":"circle-menu-2","title":"Circle menu #2","handle":"circle-menu-2","groups":["collection","slider","header"],"rawGroups":["collections","slider","navigation"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/circle-menu-2.jpg?v=1764667548","price":9,"isPro":false,"link":"https://section.store/pages/circle-menu-2"},{"id":"header-1","title":"Header #1","handle":"header-1","groups":["other","header"],"rawGroups":["other","header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-1.jpg?v=1764667549","price":9,"isPro":false,"link":"https://section.store/pages/header"},{"id":"footer-7","title":"Footer #7","handle":"footer-7","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-7.jpg?v=1764667548","price":9,"isPro":false,"link":"https://section.store/pages/footer-7"},{"id":"trust-badges-6","title":"Trust badges #6","handle":"trust-badges-6","groups":["snippet"],"rawGroups":["trust badges","snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/trust-badges-6.jpg?v=1764667551","price":9,"isPro":false,"link":"https://section.store/products/5oz-scout-citronella-candle-2-pack"},{"id":"scrolling-videos","title":"Scrolling videos","handle":"scrolling-videos","groups":["scrolling","video"],"rawGroups":["scrolling","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-videos.jpg?v=1764667550","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-videos"},{"id":"footer-8","title":"Footer #8","handle":"footer-8","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-8.jpg?v=1764667552","price":9,"isPro":false,"link":"https://section.store/pages/footer-8"},{"id":"featured-collection-8","title":"Featured collection #8","handle":"featured-collection-8","groups":["featured-collection"],"rawGroups":["featured-collection"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-8.jpg?v=1764667551","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-8"},{"id":"hero-14","title":"Hero #14","handle":"hero-14","groups":["hero","video"],"rawGroups":["hero","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-14.jpg?v=1764667552","price":9,"isPro":false,"link":"https://section.store/pages/hero-14"},{"id":"newsletter-1","title":"Newsletter #1","handle":"newsletter-1","groups":["contact-form","other"],"rawGroups":["email signup","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/newsletter-1.jpg?v=1764667553","price":9,"isPro":false,"link":"https://section.store/pages/newsletter-1"},{"id":"product-videos-3","title":"Product videos #3","handle":"product-videos-3","groups":["snippet","product-ingredients","video"],"rawGroups":["snippet","product","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-videos-3.jpg?v=1764667552","price":14,"isPro":true,"link":"https://section.store/products/the-packable-tote-in-wood-thrush"},{"id":"testimonial-17","title":"Testimonial #17","handle":"testimonial-17","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-17.jpg?v=1764667554","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-17"},{"id":"product-tabs-4","title":"Product tabs #4","handle":"product-tabs-4","groups":["tabs","snippet","product-ingredients","page-templates"],"rawGroups":["tabs","snippet","product","product page"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-tabs-4.jpg?v=1764667554","price":14,"isPro":true,"link":"https://section.store/products/recycled-wool-9l-sidekick"},{"id":"bundle-builder-2","title":"Bundle builder #2","handle":"bundle-builder-2","groups":["collection","upsell","other"],"rawGroups":["products","bundle builder","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/bundle-builder-2.jpg?v=1764667555","price":9,"isPro":false,"link":"https://section.store/pages/builder-bundle-2"},{"id":"image-with-text-18","title":"Image with text #18","handle":"image-with-text-18","groups":["image-with-text"],"rawGroups":["image-with-text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-18.jpg?v=1764667555","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-18"},{"id":"faq-11","title":"FAQ #11","handle":"faq-11","groups":["tabs","faq"],"rawGroups":["tabs","faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-11.jpg?v=1764667554","price":9,"isPro":false,"link":"https://section.store/pages/faq-11"},{"id":"navigation-tabs","title":"Navigation tabs","handle":"navigation-tabs","groups":["tabs","header"],"rawGroups":["tabs","navigation"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/navigation-tabs.jpg?v=1764667556","price":9,"isPro":false,"link":"https://section.store/products/revolution%E2%84%A2-25l-convertible-carryall"},{"id":"feature-21","title":"Feature #21","handle":"feature-21","groups":["tabs","features"],"rawGroups":["tabs","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-21.jpg?v=1764667557","price":9,"isPro":false,"link":"https://section.store/pages/feature-21"},{"id":"scrolling-announcement-bar-3","title":"Scrolling announcement bar #3","handle":"scrolling-announcement-bar-3","groups":["header","scrolling"],"rawGroups":["announcement bar","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-announcement-bar-3.jpg?v=1764667556","price":9,"isPro":false,"link":"https://section.store/pages/announcement-bar-3"},{"id":"shoppable-video-2","title":"Shoppable video #2","handle":"shoppable-video-2","groups":["collection","testimonial","video"],"rawGroups":["products","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/shoppable-video-2.jpg?v=1764667558","price":9,"isPro":false,"link":"https://section.store/pages/shoppable-video-2"},{"id":"featured-products-2","title":"Featured products #2","handle":"featured-products-2","groups":["product-ingredients","collection","slider"],"rawGroups":["product","products","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-products-2.jpg?v=1764667558","price":14,"isPro":true,"link":"https://section.store/pages/featured-products-2"},{"id":"product-videos-4","title":"Product videos #4","handle":"product-videos-4","groups":["snippet","product-ingredients","page-templates","video"],"rawGroups":["snippet","product","product page","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-videos-4.jpg?v=1764667559","price":14,"isPro":true,"link":"https://section.store/products/the-packable-tote-in-navy"},{"id":"video-pop-2","title":"Video pop #2","handle":"video-pop-2","groups":["other","video"],"rawGroups":["other","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-pop-2.jpg?v=1764667559","price":9,"isPro":false,"link":"https://section.store/products/recycled-wool-9l-sidekick"},{"id":"feature-22","title":"Feature #22","handle":"feature-22","groups":["features","images"],"rawGroups":["features","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-22.jpg?v=1764667560","price":9,"isPro":false,"link":"https://section.store/pages/feature-22"},{"id":"size-guide-2","title":"Size guide #2","handle":"size-guide-2","groups":["snippet","other","popular"],"rawGroups":["snippet","other","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/size-guide-2.png?v=1764667561","price":9,"isPro":false,"link":"https://section.store/products/chambray-summer-dress"},{"id":"scrolling-text-9","title":"Scrolling text #9","handle":"scrolling-text-9","groups":["text","images","scrolling"],"rawGroups":["text","images","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-text-9.jpg?v=1764667561","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-text-9"},{"id":"testimonial-18","title":"Testimonial #18","handle":"testimonial-18","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-18.jpg?v=1764667561","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-18"},{"id":"multi-columns-video-2","title":"Multi columns (video) #2","handle":"multi-columns-video-2","groups":["steps","images","video"],"rawGroups":["steps","grid","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/multi-columns-video-2.jpg?v=1764667562","price":9,"isPro":false,"link":"https://section.store/pages/multicolumns-video-2"},{"id":"featured-collection-9","title":"Featured collection #9","handle":"featured-collection-9","groups":["featured-collection","collection"],"rawGroups":["featured-collection","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-9.jpg?v=1764667562","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-9"},{"id":"hero-15","title":"Hero #15","handle":"hero-15","groups":["hero","video"],"rawGroups":["hero","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-15.jpg?v=1764667562","price":9,"isPro":false,"link":"https://section.store/pages/hero-15"},{"id":"header-2","title":"Header #2","handle":"header-2","groups":["other","header"],"rawGroups":["other","header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-2.jpg?v=1764667564","price":9,"isPro":false,"link":"https://section.store/pages/header-2"},{"id":"link-in-bio","title":"Link in bio","handle":"link-in-bio","groups":["other","header"],"rawGroups":["other","navigation"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/link-in-bio.jpg?v=1764667563","price":9,"isPro":false,"link":"https://section.store/pages/link-in-bio"},{"id":"shoppable-video-3","title":"Shoppable video #3","handle":"shoppable-video-3","groups":["collection","testimonial","video"],"rawGroups":["products","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/shoppable-video-3.jpg?v=1764667564","price":9,"isPro":false,"link":"https://section.store/pages/shoppable-video-3"},{"id":"countdown-timer-bar-2","title":"Countdown timer bar #2","handle":"countdown-timer-bar-2","groups":["countdown-timer","header"],"rawGroups":["countdown-timer","announcement bar"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/countdown-timer-bar-2.jpg?v=1764667565","price":9,"isPro":false,"link":"https://section.store/pages/countdown-timer-bar-2"},{"id":"product-toggles","title":"Product toggles","handle":"product-toggles","groups":["snippet","page-templates"],"rawGroups":["snippet","product page"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-toggles.png?v=1764667565","price":14,"isPro":true,"link":"https://section.store/products/stoneware-travel-mug"},{"id":"footer-9","title":"Footer #9","handle":"footer-9","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-9.jpg?v=1764667565","price":9,"isPro":false,"link":"https://section.store/pages/footer-9"},{"id":"product-reviews-2","title":"Product reviews #2","handle":"product-reviews-2","groups":["snippet","product-ingredients","testimonial"],"rawGroups":["snippet","product","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-reviews-2.png?v=1764667567","price":14,"isPro":true,"link":"https://section.store/products/trucker-hat"},{"id":"feature-23","title":"Feature #23","handle":"feature-23","groups":["product-ingredients","features"],"rawGroups":["product","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-23.jpg?v=1764667568","price":9,"isPro":false,"link":"https://section.store/pages/feature-23"},{"id":"comparison-table-9","title":"Comparison table #9","handle":"comparison-table-9","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-9.jpg?v=1764667566","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-9"},{"id":"navigation-tabs-2","title":"Navigation tabs #2","handle":"navigation-tabs-2","groups":["tabs","header"],"rawGroups":["tabs","navigation"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/navigation-tabs-2.png?v=1764667568","price":9,"isPro":false,"link":"https://section.store/pages/navigation-tabs-2"},{"id":"product-countdown-timer-2","title":"Product countdown timer #2","handle":"product-countdown-timer-2","groups":["countdown-timer","snippet","product-ingredients","contact-form"],"rawGroups":["countdown-timer","snippet","product","email signup"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-countdown-timer-2.png?v=1764667569","price":14,"isPro":true,"link":"https://section.store/products/organic-trucker-hat"},{"id":"comparison-table-10","title":"Comparison table #10","handle":"comparison-table-10","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-10.jpg?v=1764667569","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-10"},{"id":"faq-12","title":"FAQ #12","handle":"faq-12","groups":["tabs","faq","images"],"rawGroups":["tabs","faq","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-12.jpg?v=1764667569","price":9,"isPro":false,"link":"https://section.store/pages/faq-12"},{"id":"comparison-table-11","title":"Comparison table #11","handle":"comparison-table-11","groups":["comparison","collection"],"rawGroups":["comparison","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-11.jpg?v=1764667569","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-11"},{"id":"text-block-3","title":"Text block #3","handle":"text-block-3","groups":["text"],"rawGroups":["text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/text-block-3.jpg?v=1764667570","price":9,"isPro":false,"link":"https://section.store/pages/text-block-3"},{"id":"contact-form-2","title":"Contact form #2","handle":"contact-form-2","groups":["contact-form","other"],"rawGroups":["contact form","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/contact-form-2.jpg?v=1764667572","price":9,"isPro":false,"link":"https://section.store/pages/contact-form-2"},{"id":"upsell-cross-sell-4","title":"Upsell & cross-sell #4","handle":"upsell-cross-sell-4","groups":["upsell","snippet"],"rawGroups":["upsell","cross sell","snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/upsell-cross-sell-4.png?v=1764667571","price":9,"isPro":false,"link":"https://section.store/products/ecoknit%E2%84%A2-stripe-scarf"},{"id":"bundle-builder-3","title":"Bundle builder #3","handle":"bundle-builder-3","groups":["collection","upsell","other"],"rawGroups":["products","bundle builder","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/bundle-builder-3.jpg?v=1764667572","price":9,"isPro":false,"link":"https://section.store/pages/bundle-3"},{"id":"header-3","title":"Header #3","handle":"header-3","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-3.jpg?v=1764667573","price":9,"isPro":false,"link":"https://section.store/pages/header-3"},{"id":"featured-collection-tabs-2","title":"Featured collection (tabs) #2","handle":"featured-collection-tabs-2","groups":["featured-collection","tabs","collection"],"rawGroups":["featured-collection","tabs","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-tabs-2.jpg?v=1764667573","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-tabs-2"},{"id":"testimonial-19","title":"Testimonial #19","handle":"testimonial-19","groups":["text","images","testimonial"],"rawGroups":["text","images","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-19.jpg?v=1764667574","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-19"},{"id":"video-with-text-2","title":"Video with text #2","handle":"video-with-text-2","groups":["text","video"],"rawGroups":["text","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-with-text-2.jpg?v=1764667574","price":9,"isPro":false,"link":"https://section.store/pages/video-with-text-2"},{"id":"steps-6","title":"Steps #6","handle":"steps-6","groups":["steps","text"],"rawGroups":["steps","text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/steps-6.jpg?v=1764667574","price":9,"isPro":false,"link":"https://section.store/pages/steps-6"},{"id":"collection-9","title":"Collection #9","handle":"collection-9","groups":["collection"],"rawGroups":["collections"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-9.jpg?v=1764667575","price":9,"isPro":false,"link":"https://section.store/pages/collection-9"},{"id":"featured-product-2","title":"Featured product #2","handle":"featured-product-2","groups":["product-ingredients","hero"],"rawGroups":["product","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-product-2.jpg?v=1764667576","price":14,"isPro":true,"link":"https://section.store/pages/featured-product-2"},{"id":"hero-16","title":"Hero #16","handle":"hero-16","groups":["hero"],"rawGroups":["hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-16.jpg?v=1764667576","price":9,"isPro":false,"link":"https://section.store/pages/hero-16"},{"id":"collection-10","title":"Collection #10","handle":"collection-10","groups":["collection","slider"],"rawGroups":["collections","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-10.jpg?v=1764667576","price":9,"isPro":false,"link":"https://section.store/pages/collection-10"},{"id":"scrolling-logo-cloud-4","title":"Scrolling logo cloud #4","handle":"scrolling-logo-cloud-4","groups":["scrolling"],"rawGroups":["logo-cloud","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-logo-cloud-4.jpg?v=1764667576","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-logo-cloud-4"},{"id":"feature-24","title":"Feature #24","handle":"feature-24","groups":["tabs","features"],"rawGroups":["tabs","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-24.jpg?v=1764667578","price":9,"isPro":false,"link":"https://section.store/pages/feature-24"},{"id":"hotspots-7","title":"Hotspots #7","handle":"hotspots-7","groups":["hotspots"],"rawGroups":["hotspots"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hotspots-7.jpg?v=1764667578","price":9,"isPro":false,"link":"https://section.store/pages/hotspots-7"},{"id":"image-with-text-19","title":"Image with text #19","handle":"image-with-text-19","groups":["image-with-text","scrolling"],"rawGroups":["image-with-text","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-19.jpg?v=1764667579","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-19"},{"id":"steps-5","title":"Steps #5","handle":"steps-5","groups":["steps","tabs"],"rawGroups":["steps","tabs"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/steps-5.jpg?v=1764667579","price":9,"isPro":false,"link":"https://section.store/pages/steps-5"},{"id":"scrolling-features-3","title":"Scrolling features #3","handle":"scrolling-features-3","groups":["slider","features","scrolling"],"rawGroups":["slider","features","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-features-3.jpg?v=1764667580","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-features-3"},{"id":"scrolling-images-4","title":"Scrolling images #4","handle":"scrolling-images-4","groups":["images","scrolling"],"rawGroups":["images","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-images-4.jpg?v=1764667580","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-images-4"},{"id":"featured-products-3","title":"Featured products #3","handle":"featured-products-3","groups":["collection","slider"],"rawGroups":["products","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-products-3.jpg?v=1764667581","price":14,"isPro":true,"link":"https://section.store/pages/featured-products-3"},{"id":"tabs-slide-out","title":"Tabs (slide out)","handle":"tabs-slide-out","groups":["tabs","faq"],"rawGroups":["tabs","faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/tabs-slide-out.jpg?v=1764667583","price":9,"isPro":false,"link":"https://section.store/pages/tabs"},{"id":"testimonial-20","title":"Testimonial #20","handle":"testimonial-20","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-20.jpg?v=1764667581","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-20"},{"id":"flexible-tabs-2","title":"Flexible tabs #2","handle":"flexible-tabs-2","groups":["tabs","faq","features"],"rawGroups":["tabs","faq","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/flexible-tabs-2.jpg?v=1764667583","price":9,"isPro":false,"link":"https://section.store/pages/flexible-tabs-2"},{"id":"footer-10","title":"Footer #10","handle":"footer-10","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-10.jpg?v=1764667582","price":9,"isPro":false,"link":"https://section.store/pages/footer-10"},{"id":"collection-11","title":"Collection #11","handle":"collection-11","groups":["collection","video"],"rawGroups":["collections","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-11.jpg?v=1764667583","price":9,"isPro":false,"link":"https://section.store/pages/collection-11"},{"id":"scrolling-collections","title":"Scrolling collections","handle":"scrolling-collections","groups":["collection","scrolling"],"rawGroups":["collections","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-collections.jpg?v=1764667584","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-collections"},{"id":"beforeafter-image-6","title":"Before/after image #6","handle":"beforeafter-image-6","groups":["comparison","before-after","tabs"],"rawGroups":["comparison","before / after","tabs"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/beforeafter-image-6.jpg?v=1764667585","price":9,"isPro":false,"link":"https://section.store/pages/before-after-image-6"},{"id":"featured-collection-10","title":"Featured collection #10","handle":"featured-collection-10","groups":["featured-collection","collection"],"rawGroups":["featured-collection","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-10.jpg?v=1764667585","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-10"},{"id":"shoppable-product-videos","title":"Shoppable product videos","handle":"shoppable-product-videos","groups":["snippet","collection","testimonial","video"],"rawGroups":["snippet","products","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/shoppable-product-videos.jpg?v=1764667585","price":14,"isPro":true,"link":"https://section.store/products/organic-5-panel-hat"},{"id":"shop-the-look-4","title":"Shop the look #4","handle":"shop-the-look-4","groups":["shop-the-look","collection"],"rawGroups":["shop-the-look","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/shop-the-look-4.jpg?v=1764667585","price":9,"isPro":false,"link":"https://section.store/pages/shop-the-look-4"},{"id":"hero-17","title":"Hero #17","handle":"hero-17","groups":["hero"],"rawGroups":["hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-17.jpg?v=1764667588","price":9,"isPro":false,"link":"https://section.store/pages/hero-17"},{"id":"comparison-table-13","title":"Comparison table #13","handle":"comparison-table-13","groups":["comparison","collection"],"rawGroups":["comparison","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-13.jpg?v=1764667586","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-13"},{"id":"comparison-table-12","title":"Comparison table #12","handle":"comparison-table-12","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-12.jpg?v=1764667587","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-12"},{"id":"testimonial-21","title":"Testimonial #21","handle":"testimonial-21","groups":["slider","testimonial"],"rawGroups":["slider","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-21.jpg?v=1764667587","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-21"},{"id":"beforeafter-image-8","title":"Before/after image #8","handle":"beforeafter-image-8","groups":["comparison","before-after"],"rawGroups":["comparison","before / after"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/beforeafter-image-8.jpg?v=1764667589","price":9,"isPro":false,"link":"https://section.store/pages/before-after-image-8"},{"id":"testimonial-22","title":"Testimonial #22","handle":"testimonial-22","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-22.jpg?v=1764667589","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-22"},{"id":"featured-collection-11","title":"Featured collection #11","handle":"featured-collection-11","groups":["featured-collection","collection"],"rawGroups":["featured-collection","products","collections"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-11.jpg?v=1764667590","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-11"},{"id":"slideshow-8","title":"Slideshow #8","handle":"slideshow-8","groups":["slider","hero"],"rawGroups":["slideshow","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slideshow-8.jpg?v=1764667591","price":9,"isPro":false,"link":"https://section.store/pages/slideshow-8"},{"id":"beforeafter-image-7","title":"Before/after image #7","handle":"beforeafter-image-7","groups":["comparison","before-after"],"rawGroups":["comparison","before / after"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/beforeafter-image-7.jpg?v=1764667589","price":9,"isPro":false,"link":"https://section.store/pages/before-after-image-7"},{"id":"scrolling-images-5","title":"Scrolling images #5","handle":"scrolling-images-5","groups":["scrolling","images"],"rawGroups":["logo-cloud","images","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-images-5.jpg?v=1764667592","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-images-5"},{"id":"video-grid-social-media-4","title":"Video grid (social media) #4","handle":"video-grid-social-media-4","groups":["features","testimonial","video"],"rawGroups":["features","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-grid-social-media-4.jpg?v=1764667591","price":9,"isPro":false,"link":"https://section.store/pages/video-from-social-4"},{"id":"feature-26","title":"Feature #26","handle":"feature-26","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-26.jpg?v=1764667592","price":9,"isPro":false,"link":"https://section.store/pages/feature-26"},{"id":"product-coupon-2","title":"Product coupon #2","handle":"product-coupon-2","groups":["snippet","product-ingredients"],"rawGroups":["snippet","product"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-coupon-2.png?v=1764667593","price":14,"isPro":true,"link":"https://section.store/products/Organic-Bandana"},{"id":"feature-25","title":"Feature #25","handle":"feature-25","groups":["features","images","video"],"rawGroups":["features","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-25.jpg?v=1764667594","price":9,"isPro":false,"link":"https://section.store/pages/feature-25"},{"id":"featured-collection-12","title":"Featured collection #12","handle":"featured-collection-12","groups":["featured-collection","collection"],"rawGroups":["featured-collection","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-12.jpg?v=1764667594","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-12"},{"id":"countdown-timer-5","title":"Countdown timer #5","handle":"countdown-timer-5","groups":["countdown-timer","text"],"rawGroups":["countdown-timer","text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/countdown-timer-5.jpg?v=1764667594","price":9,"isPro":false,"link":"https://section.store/pages/countdown-timer-5"},{"id":"faq-13","title":"FAQ #13","handle":"faq-13","groups":["faq"],"rawGroups":["faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-13.jpg?v=1764667594","price":9,"isPro":false,"link":"https://section.store/pages/faq-13"},{"id":"pricing-table-4","title":"Pricing table #4","handle":"pricing-table-4","groups":["comparison","other"],"rawGroups":["pricing-table","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/pricing-table-4.jpg?v=1764667596","price":9,"isPro":false,"link":"https://section.store/pages/pricing-table-4"},{"id":"header-4","title":"Header #4","handle":"header-4","groups":["other","header"],"rawGroups":["other","header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-4.jpg?v=1764667596","price":9,"isPro":false,"link":"https://section.store/pages/header-4"},{"id":"hero-19","title":"Hero #19","handle":"hero-19","groups":["collection","hero"],"rawGroups":["products","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-19.jpg?v=1764667597","price":9,"isPro":false,"link":"https://section.store/pages/hero-19"},{"id":"comparison-table-14","title":"Comparison table #14","handle":"comparison-table-14","groups":["comparison","collection"],"rawGroups":["comparison","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-14.jpg?v=1764667597","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-14"},{"id":"collection-12","title":"Collection #12","handle":"collection-12","groups":["images","collection"],"rawGroups":["grid","collections","gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-12.jpg?v=1764667598","price":9,"isPro":false,"link":"https://section.store/pages/collection-12"},{"id":"video-grid-social-media-5","title":"Video grid (social media) #5","handle":"video-grid-social-media-5","groups":["images","testimonial","video"],"rawGroups":["grid","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-grid-social-media-5.jpg?v=1764667598","price":9,"isPro":false,"link":"https://section.store/pages/video-from-social-5"},{"id":"logo-cloud-2","title":"Logo cloud #2","handle":"logo-cloud-2","groups":["scrolling","images"],"rawGroups":["logo-cloud","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/logo-cloud-2.jpg?v=1764667598","price":9,"isPro":false,"link":"https://section.store/pages/logo-cloud-2"},{"id":"testimonial-23","title":"Testimonial #23","handle":"testimonial-23","groups":["tabs","testimonial"],"rawGroups":["tabs","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-23.jpg?v=1764667600","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-23"},{"id":"bento-grid-2","title":"Bento grid #2","handle":"bento-grid-2","groups":["images"],"rawGroups":["grid","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/bento-grid-2.jpg?v=1764667600","price":9,"isPro":false,"link":"https://section.store/pages/bento-grid-2"},{"id":"hero-21","title":"Hero #21","handle":"hero-21","groups":["hero","scrolling","video"],"rawGroups":["hero","scrolling","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-21.jpg?v=1764667600","price":9,"isPro":false,"link":"https://section.store/pages/hero-21"},{"id":"feature-27-animated","title":"Feature #27 (animated)","handle":"feature-27-animated","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-27-animated.jpg?v=1764667600","price":9,"isPro":false,"link":"https://section.store/pages/feature-27"},{"id":"social-media-bar","title":"Social media bar","handle":"social-media-bar","groups":["other"],"rawGroups":["other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/social-media-bar.jpg?v=1764667601","price":9,"isPro":false,"link":"https://section.store/pages/social-media-bar"},{"id":"image-with-text-20","title":"Image with text #20","handle":"image-with-text-20","groups":["image-with-text","slider"],"rawGroups":["image-with-text","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-20.jpg?v=1764667602","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-20"},{"id":"back-to-top-3","title":"Back to top #3","handle":"back-to-top-3","groups":["snippet","other","free"],"rawGroups":["back-to-top","other","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/back-to-top-3.jpg?v=1764667602","price":0,"isPro":false,"link":"https://section.store/pages/back-to-top-3"},{"id":"hero-18","title":"Hero #18","handle":"hero-18","groups":["hero"],"rawGroups":["banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-18.jpg?v=1764667603","price":9,"isPro":false,"link":"https://section.store/pages/hero-18"},{"id":"testimonial-24","title":"Testimonial #24","handle":"testimonial-24","groups":["slider","testimonial"],"rawGroups":["slider","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-24.jpg?v=1764667603","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-24"},{"id":"feature-28","title":"Feature #28","handle":"feature-28","groups":["tabs","features","scrolling"],"rawGroups":["tabs","features","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-28.jpg?v=1764667604","price":9,"isPro":false,"link":"https://section.store/pages/feature-28"},{"id":"featured-collection-14","title":"Featured collection #14","handle":"featured-collection-14","groups":["featured-collection","collection","slider"],"rawGroups":["featured-collection","products","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-14.jpg?v=1764667604","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-14"},{"id":"product-ingredients-3","title":"Product ingredients #3","handle":"product-ingredients-3","groups":["product-ingredients","other"],"rawGroups":["product-ingredients","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-ingredients-3.jpg?v=1764667605","price":14,"isPro":true,"link":"https://section.store/pages/product-ingredients-3"},{"id":"comparison-table-15","title":"Comparison table #15","handle":"comparison-table-15","groups":["comparison","video"],"rawGroups":["comparison","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-15.jpg?v=1764667605","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-15"},{"id":"hero-20","title":"Hero #20","handle":"hero-20","groups":["hero","video"],"rawGroups":["hero","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-20.jpg?v=1764667606","price":9,"isPro":false,"link":"https://section.store/pages/hero-20"},{"id":"footer-11","title":"Footer #11","handle":"footer-11","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-11.jpg?v=1764667606","price":9,"isPro":false,"link":"https://section.store/pages/footer-11#"},{"id":"media-grid-3","title":"Media grid #3","handle":"media-grid-3","groups":["images","video"],"rawGroups":["grid","gallery","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/media-grid-3.jpg?v=1764667607","price":9,"isPro":false,"link":"https://section.store/pages/media-grid-3"},{"id":"featured-collection-13","title":"Featured collection #13","handle":"featured-collection-13","groups":["featured-collection","collection"],"rawGroups":["featured-collection","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-13.jpg?v=1764667607","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-13"},{"id":"video-slider-2","title":"Video slider #2","handle":"video-slider-2","groups":["collection","slider","video"],"rawGroups":["products","collections","slider","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-slider-2.jpg?v=1764667608","price":9,"isPro":false,"link":"https://section.store/pages/video-slider-2"},{"id":"product-tabs-5","title":"Product tabs #5","handle":"product-tabs-5","groups":["tabs","snippet","product-ingredients","page-templates"],"rawGroups":["tabs","snippet","product","product page"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-tabs-5.jpg?v=1764667608","price":14,"isPro":true,"link":"https://section.store/products/product-tabs-5"},{"id":"gallery-7","title":"Gallery #7","handle":"gallery-7","groups":["images","free"],"rawGroups":["gallery","images","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/gallery-7.jpg?v=1764667609","price":0,"isPro":false,"link":"https://section.store/pages/gallery-7"},{"id":"hero-22","title":"Hero #22","handle":"hero-22","groups":["hero","video"],"rawGroups":["hero","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-22.jpg?v=1764667609","price":9,"isPro":false,"link":"https://section.store/pages/hero-22"},{"id":"instafeed-8","title":"Instafeed #8","handle":"instafeed-8","groups":["scrolling","collection","slider"],"rawGroups":["instafeed","products","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/instafeed-8.jpg?v=1764667609","price":9,"isPro":false,"link":"https://section.store/pages/instafeed-8"},{"id":"scrolling-featured-collection","title":"Scrolling featured collection","handle":"scrolling-featured-collection","groups":["featured-collection","collection","scrolling"],"rawGroups":["featured-collection","products","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-featured-collection.jpg?v=1764667611","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-featured-collection"},{"id":"header-5","title":"Header #5","handle":"header-5","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-5.jpg?v=1764667611","price":9,"isPro":false,"link":"https://section.store/pages/header-5"},{"id":"gallery-8","title":"Gallery #8","handle":"gallery-8","groups":["text","images"],"rawGroups":["text","gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/gallery-8.jpg?v=1764667612","price":9,"isPro":false,"link":"https://section.store/pages/gallery-8"},{"id":"faq-14","title":"FAQ #14","handle":"faq-14","groups":["image-with-text","faq","images","video"],"rawGroups":["image-with-text","faq","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-14.jpg?v=1764667612","price":9,"isPro":false,"link":"https://section.store/pages/faq-14"},{"id":"testimonial-26","title":"Testimonial #26","handle":"testimonial-26","groups":["scrolling","testimonial"],"rawGroups":["scrolling","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-26.jpg?v=1764667612","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-26"},{"id":"hero-23","title":"Hero #23","handle":"hero-23","groups":["slider","hero","video"],"rawGroups":["slideshow","hero","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-23.jpg?v=1764667613","price":9,"isPro":false,"link":"https://section.store/pages/hero-23"},{"id":"scrolling-products-2","title":"Scrolling products #2","handle":"scrolling-products-2","groups":["collection","scrolling"],"rawGroups":["products","collections","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-products-2.jpg?v=1764667613","price":14,"isPro":true,"link":"https://section.store/pages/scrolling-products-2"},{"id":"scrolling-features-4","title":"Scrolling features #4","handle":"scrolling-features-4","groups":["features","scrolling"],"rawGroups":["features","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-features-4.jpg?v=1764667615","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-features-4"},{"id":"media-grid-4","title":"Media grid #4","handle":"media-grid-4","groups":["steps","images","video"],"rawGroups":["steps","grid","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/media-grid-4.jpg?v=1764667615","price":9,"isPro":false,"link":"https://section.store/pages/media-grid-4"},{"id":"feature-29","title":"Feature #29","handle":"feature-29","groups":["features","video"],"rawGroups":["features","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-29.jpg?v=1764667615","price":9,"isPro":false,"link":"https://section.store/pages/feature-29"},{"id":"countdown-timer-bar-3","title":"Countdown timer bar #3","handle":"countdown-timer-bar-3","groups":["countdown-timer","header"],"rawGroups":["countdown-timer","announcement bar"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/countdown-timer-bar-3.jpg?v=1764667615","price":9,"isPro":false,"link":"https://section.store/pages/countdown-timer-bar-3"},{"id":"image-with-text-21","title":"Image with text #21","handle":"image-with-text-21","groups":["text","image-with-text","scrolling"],"rawGroups":["text","image-with-text","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-21.jpg?v=1764667616","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-21"},{"id":"scrolling-features-5","title":"Scrolling features #5","handle":"scrolling-features-5","groups":["features","scrolling"],"rawGroups":["features","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-features-5.jpg?v=1764667616","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-features-5"},{"id":"slider-9","title":"Slider #9","handle":"slider-9","groups":["collection","blog","images","slider"],"rawGroups":["products","blog","grid","collections","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-9.jpg?v=1764667617","price":9,"isPro":false,"link":"https://section.store/pages/slider-9"},{"id":"slider-8","title":"Slider #8","handle":"slider-8","groups":["collection","blog","slider"],"rawGroups":["products","blog","collections","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-8.jpg?v=1764667618","price":9,"isPro":false,"link":"https://section.store/pages/slider-8"},{"id":"testimonial-27","title":"Testimonial #27","handle":"testimonial-27","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-27.jpg?v=1764667618","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-27"},{"id":"hero-24","title":"Hero #24","handle":"hero-24","groups":["hero","popular"],"rawGroups":["banner","hero","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-24.jpg?v=1764667618","price":9,"isPro":false,"link":"https://section.store/pages/hero-24"},{"id":"collection-tabs-2","title":"Collection tabs #2","handle":"collection-tabs-2","groups":["tabs","collection","images"],"rawGroups":["tabs","collections","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-tabs-2.jpg?v=1764667620","price":9,"isPro":false,"link":"https://section.store/pages/collection-tabs-2"},{"id":"blog-6","title":"Blog #6","handle":"blog-6","groups":["blog","collection"],"rawGroups":["blog","collections"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/blog-6.jpg?v=1764667619","price":9,"isPro":false,"link":"https://section.store/pages/blog-6"},{"id":"slider-11","title":"Slider #11","handle":"slider-11","groups":["collection","blog","slider"],"rawGroups":["products","blog","slideshow","collections","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-11.jpg?v=1764667620","price":9,"isPro":false,"link":"https://section.store/pages/slider-11"},{"id":"steps-7","title":"Steps #7","handle":"steps-7","groups":["steps"],"rawGroups":["steps"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/steps-7.jpg?v=1764667621","price":9,"isPro":false,"link":"https://section.store/pages/steps-7"},{"id":"header-7","title":"Header #7","handle":"header-7","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-7.jpg?v=1764667622","price":9,"isPro":false,"link":"https://section.store/pages/header-7"},{"id":"header-6","title":"Header #6","handle":"header-6","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-6.jpg?v=1764667621","price":9,"isPro":false,"link":"https://section.store/pages/header-6"},{"id":"slider-10","title":"Slider #10","handle":"slider-10","groups":["product-ingredients","collection","blog","slider"],"rawGroups":["product-ingredients","products","blog","collections","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-10.jpg?v=1764667622","price":9,"isPro":false,"link":"https://section.store/pages/slider-10"},{"id":"testimonial-29","title":"Testimonial #29","handle":"testimonial-29","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-29.jpg?v=1764667622","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-29"},{"id":"featured-collection-tabs-3","title":"Featured collection (tabs) #3","handle":"featured-collection-tabs-3","groups":["featured-collection","tabs","collection"],"rawGroups":["featured-collection","tabs","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-tabs-3.jpg?v=1764667624","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-tabs-3"},{"id":"video-image-text-4","title":"Video & image text #4","handle":"video-image-text-4","groups":["image-with-text","video"],"rawGroups":["image-with-text","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-image-text-4.jpg?v=1764667624","price":9,"isPro":false,"link":"https://section.store/pages/video-image-text-4"},{"id":"testimonial-30","title":"Testimonial #30","handle":"testimonial-30","groups":["scrolling","testimonial"],"rawGroups":["scrolling","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-30.jpg?v=1764667624","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-30"},{"id":"footer-12","title":"Footer #12","handle":"footer-12","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-12.jpg?v=1764667625","price":9,"isPro":false,"link":"https://section.store/pages/footer-12"},{"id":"video-slider-3","title":"Video slider #3","handle":"video-slider-3","groups":["slider","testimonial","video"],"rawGroups":["slider","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-slider-3.jpg?v=1764667625","price":9,"isPro":false,"link":"https://section.store/pages/video-slider-3"},{"id":"product-ingredients-4","title":"Product ingredients #4","handle":"product-ingredients-4","groups":["product-ingredients"],"rawGroups":["product-ingredients"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-ingredients-4.jpg?v=1764667626","price":14,"isPro":true,"link":"https://section.store/pages/product-ingredients-4"},{"id":"video-with-text-7","title":"Video with text #7","handle":"video-with-text-7","groups":["text","video"],"rawGroups":["text","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-with-text-7.jpg?v=1764667628","price":9,"isPro":false,"link":"https://section.store/pages/video-with-text-7"},{"id":"video-with-text-6","title":"Video with text #6","handle":"video-with-text-6","groups":["text","video"],"rawGroups":["text","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-with-text-6.jpg?v=1764667626","price":9,"isPro":false,"link":"https://section.store/pages/video-with-text-6"},{"id":"video-grid-social-media-6","title":"Video grid (social media) #6","handle":"video-grid-social-media-6","groups":["images","slider","video"],"rawGroups":["grid","slider","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-grid-social-media-6.jpg?v=1764667627","price":9,"isPro":false,"link":"https://section.store/pages/video-from-social-6"},{"id":"testimonial-25","title":"Testimonial #25","handle":"testimonial-25","groups":["images","testimonial","video"],"rawGroups":["grid","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-25.jpg?v=1764667628","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-25"},{"id":"testimonial-28","title":"Testimonial #28","handle":"testimonial-28","groups":["testimonial","video"],"rawGroups":["testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-28.jpg?v=1764667628","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-28"},{"id":"feature-30","title":"Feature #30","handle":"feature-30","groups":["slider","features","images"],"rawGroups":["slider","features","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-30.jpg?v=1764667629","price":9,"isPro":false,"link":"https://section.store/pages/feature-30"},{"id":"beforeafter-image-9","title":"Before/after image #9","handle":"beforeafter-image-9","groups":["before-after","collection"],"rawGroups":["before / after","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/beforeafter-image-9.jpg?v=1764667630","price":9,"isPro":false,"link":"https://section.store/pages/before-after-image-9"},{"id":"header-8","title":"Header #8","handle":"header-8","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-8.jpg?v=1764667630","price":9,"isPro":false,"link":"https://section.store/pages/header-8"},{"id":"slideshow-9","title":"Slideshow #9","handle":"slideshow-9","groups":["slider","hero"],"rawGroups":["slideshow","banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slideshow-9.jpg?v=1764667630","price":9,"isPro":false,"link":"https://section.store/pages/slideshow-9"},{"id":"steps-8","title":"Steps #8","handle":"steps-8","groups":["steps","images"],"rawGroups":["steps","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/steps-8.jpg?v=1764667630","price":9,"isPro":false,"link":"https://section.store/pages/steps-8"},{"id":"hero-27","title":"Hero #27","handle":"hero-27","groups":["image-with-text","hero"],"rawGroups":["image-with-text","banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-27.jpg?v=1764667632","price":9,"isPro":false,"link":"https://section.store/pages/hero-27"},{"id":"featured-collection-16","title":"Featured collection #16","handle":"featured-collection-16","groups":["featured-collection","collection"],"rawGroups":["featured-collection","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-16.jpg?v=1764667631","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-16"},{"id":"hero-25","title":"Hero #25","handle":"hero-25","groups":["collection","hero","scrolling"],"rawGroups":["collections","hero","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-25.jpg?v=1764667633","price":9,"isPro":false,"link":"https://section.store/pages/hero-25"},{"id":"feature-33","title":"Feature #33","handle":"feature-33","groups":["features","images"],"rawGroups":["features","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-33.jpg?v=1764667634","price":9,"isPro":false,"link":"https://section.store/pages/feature-33"},{"id":"announcement-bar-slideshow","title":"Announcement bar (slideshow)","handle":"announcement-bar-slideshow","groups":["slider","header"],"rawGroups":["slideshow","announcement bar"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/announcement-bar-slideshow.jpg?v=1764667633","price":9,"isPro":false,"link":"https://section.store/pages/announcement-bar-slideshow"},{"id":"feature-31","title":"Feature #31","handle":"feature-31","groups":["text","features"],"rawGroups":["text","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-31.jpg?v=1764667632","price":9,"isPro":false,"link":"https://section.store/pages/feature-31"},{"id":"faq-15","title":"FAQ #15","handle":"faq-15","groups":["faq"],"rawGroups":["faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-15.jpg?v=1764667634","price":9,"isPro":false,"link":"https://section.store/pages/faq-15"},{"id":"feature-34","title":"Feature #34","handle":"feature-34","groups":["tabs","features"],"rawGroups":["tabs","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-34.jpg?v=1764667635","price":9,"isPro":false,"link":"https://section.store/pages/feature-34"},{"id":"comparison-table-16","title":"Comparison table #16","handle":"comparison-table-16","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-16.jpg?v=1764667635","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-16"},{"id":"feature-32","title":"Feature #32","handle":"feature-32","groups":["tabs","image-with-text","features"],"rawGroups":["tabs","image-with-text","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-32.jpg?v=1764667636","price":9,"isPro":false,"link":"https://section.store/pages/feature-32"},{"id":"contact-form-3","title":"Contact form #3","handle":"contact-form-3","groups":["contact-form","other"],"rawGroups":["contact form","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/contact-form-3.jpg?v=1764667636","price":9,"isPro":false,"link":"https://section.store/pages/contact-form-3"},{"id":"comparison-table-18","title":"Comparison table #18","handle":"comparison-table-18","groups":["comparison","collection"],"rawGroups":["comparison","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-18.jpg?v=1764667637","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-18"},{"id":"hotspots-8","title":"Hotspots #8","handle":"hotspots-8","groups":["image-with-text","hotspots"],"rawGroups":["image-with-text","hotspots"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hotspots-8.jpg?v=1764667638","price":9,"isPro":false,"link":"https://section.store/pages/hotspots-8"},{"id":"hero-26","title":"Hero #26","handle":"hero-26","groups":["features","hero","video"],"rawGroups":["call-out","hero","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-26.jpg?v=1764667637","price":9,"isPro":false,"link":"https://section.store/pages/hero-26"},{"id":"video-image-text-5","title":"Video & image text #5","handle":"video-image-text-5","groups":["image-with-text","images","video"],"rawGroups":["image-with-text","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-image-text-5.jpg?v=1764667639","price":9,"isPro":false,"link":"https://section.store/pages/video-image-text-5"},{"id":"timeline-4","title":"Timeline #4","handle":"timeline-4","groups":["steps","slider"],"rawGroups":["timeline","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/timeline-4.jpg?v=1764667639","price":9,"isPro":false,"link":"https://section.store/pages/timeline-4"},{"id":"testimonial-31","title":"Testimonial #31","handle":"testimonial-31","groups":["images","testimonial","video"],"rawGroups":["grid","images","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-31.jpg?v=1764667639","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-31"},{"id":"featured-collection-15","title":"Featured collection #15","handle":"featured-collection-15","groups":["featured-collection","collection"],"rawGroups":["featured-collection","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-15.jpg?v=1764667640","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-15"},{"id":"hero-28","title":"Hero #28","handle":"hero-28","groups":["hero","video"],"rawGroups":["banner","hero","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-28.jpg?v=1764667641","price":9,"isPro":false,"link":"https://section.store/pages/hero-28"},{"id":"comparison-table-17","title":"Comparison table #17","handle":"comparison-table-17","groups":["comparison","video"],"rawGroups":["comparison","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-17.jpg?v=1764667641","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-17"},{"id":"contact-form-4","title":"Contact form #4","handle":"contact-form-4","groups":["contact-form"],"rawGroups":["contact form"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/contact-form-4.jpg?v=1764667642","price":9,"isPro":false,"link":"https://section.store/pages/contact-form-4"},{"id":"collection-13","title":"Collection #13","handle":"collection-13","groups":["collection","video"],"rawGroups":["collections","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-13.jpg?v=1764667642","price":9,"isPro":false,"link":"https://section.store/pages/collection-13"},{"id":"featured-collection-tabs-4","title":"Featured collection (tabs) #4","handle":"featured-collection-tabs-4","groups":["featured-collection","tabs","collection"],"rawGroups":["featured-collection","tabs","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-tabs-4.jpg?v=1764667643","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-tabs-4"},{"id":"product-ingredients-5","title":"Product ingredients #5","handle":"product-ingredients-5","groups":["product-ingredients","slider"],"rawGroups":["product-ingredients","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-ingredients-5.jpg?v=1764667643","price":14,"isPro":true,"link":"https://section.store/pages/product-ingredients-5"},{"id":"comparison-table-19","title":"Comparison table #19","handle":"comparison-table-19","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-19.jpg?v=1764667644","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-19"},{"id":"steps-9","title":"Steps #9","handle":"steps-9","groups":["steps","image-with-text"],"rawGroups":["steps","image-with-text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/steps-9.jpg?v=1764667644","price":9,"isPro":false,"link":"https://section.store/pages/steps-9"},{"id":"trust-badges-7","title":"Trust badges #7","handle":"trust-badges-7","groups":["snippet"],"rawGroups":["trust badges","snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/trust-badges-7.png?v=1764667645","price":9,"isPro":false,"link":"https://section.store/products/trust-badge-7"},{"id":"testimonial-32","title":"Testimonial #32","handle":"testimonial-32","groups":["testimonial","video"],"rawGroups":["testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-32.jpg?v=1764667644","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-32"},{"id":"product-reviews-3","title":"Product reviews #3","handle":"product-reviews-3","groups":["snippet","testimonial"],"rawGroups":["snippet","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-reviews-3.png?v=1764667646","price":14,"isPro":true,"link":"https://section.store/products/product-reviews-3"},{"id":"header-12","title":"Header #12","handle":"header-12","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-12.jpg?v=1764667646","price":9,"isPro":false,"link":"https://section.store/pages/header-12#"},{"id":"header-10","title":"Header #10","handle":"header-10","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-10.jpg?v=1764667648","price":9,"isPro":false,"link":"https://section.store/pages/header-10"},{"id":"header-9","title":"Header #9","handle":"header-9","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-9.jpg?v=1764667646","price":9,"isPro":false,"link":"https://section.store/pages/header-9"},{"id":"featured-collection-17","title":"Featured collection #17","handle":"featured-collection-17","groups":["featured-collection","collection","slider"],"rawGroups":["featured-collection","products","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-17.jpg?v=1764667648","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-17"},{"id":"hero-29","title":"Hero #29","handle":"hero-29","groups":["hero","features"],"rawGroups":["banner","hero","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-29.jpg?v=1764667648","price":9,"isPro":false,"link":"https://section.store/pages/hero-29"},{"id":"testimonial-33","title":"Testimonial #33","handle":"testimonial-33","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-33.jpg?v=1764667648","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-33"},{"id":"feature-35","title":"Feature #35","handle":"feature-35","groups":["text","image-with-text","features"],"rawGroups":["text","image-with-text","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-35.jpg?v=1764667649","price":9,"isPro":false,"link":"https://section.store/pages/feature-35"},{"id":"hero-30","title":"Hero #30","handle":"hero-30","groups":["hero","video"],"rawGroups":["hero","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-30.jpg?v=1764667650","price":9,"isPro":false,"link":"https://section.store/pages/hero-30"},{"id":"beforeafter-image-10","title":"Before/after image #10","handle":"beforeafter-image-10","groups":["comparison","before-after"],"rawGroups":["comparison","before / after"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/beforeafter-image-10.jpg?v=1764667651","price":9,"isPro":false,"link":"https://section.store/pages/before-after-image-10"},{"id":"header-11","title":"Header #11","handle":"header-11","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-11.jpg?v=1764667651","price":9,"isPro":false,"link":"https://section.store/pages/header-11"},{"id":"comparison-table-20","title":"Comparison table #20","handle":"comparison-table-20","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-20.jpg?v=1764667651","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-20"},{"id":"hotspots-9","title":"Hotspots #9","handle":"hotspots-9","groups":["image-with-text","hotspots","features"],"rawGroups":["image-with-text","hotspots","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hotspots-9.jpg?v=1764667651","price":9,"isPro":false,"link":"https://section.store/pages/hotspots-9"},{"id":"testimonial-34","title":"Testimonial #34","handle":"testimonial-34","groups":["collection","testimonial"],"rawGroups":["products","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-34.jpg?v=1764667652","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-34"},{"id":"header-13","title":"Header #13","handle":"header-13","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-13.jpg?v=1764667652","price":9,"isPro":false,"link":"https://section.store/pages/header-13"},{"id":"hero-31","title":"Hero #31","handle":"hero-31","groups":["text","hero","features","images"],"rawGroups":["text","hero","features","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-31.jpg?v=1764667653","price":9,"isPro":false,"link":"https://section.store/pages/hero-31"},{"id":"image-with-text-22","title":"Image with text #22","handle":"image-with-text-22","groups":["image-with-text","scrolling"],"rawGroups":["image-with-text","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-22.jpg?v=1764667654","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-22"},{"id":"hotspots-10","title":"Hotspots #10","handle":"hotspots-10","groups":["collection","image-with-text","hotspots","features","images"],"rawGroups":["products","image-with-text","hotspots","features","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hotspots-10.jpg?v=1764667654","price":9,"isPro":false,"link":"https://section.store/pages/hotspots-10"},{"id":"hotspots-11","title":"Hotspots #11","handle":"hotspots-11","groups":["collection","image-with-text","hotspots","images"],"rawGroups":["products","image-with-text","hotspots","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hotspots-11.jpg?v=1764667655","price":9,"isPro":false,"link":"https://section.store/pages/hotspots-11"},{"id":"footer-13","title":"Footer #13","handle":"footer-13","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-13.jpg?v=1764667655","price":9,"isPro":false,"link":"https://section.store/pages/footer-13"},{"id":"image-with-text-23","title":"Image with text #23","handle":"image-with-text-23","groups":["image-with-text","testimonial"],"rawGroups":["image-with-text","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/image-with-text-23.jpg?v=1764667656","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-23"},{"id":"modal-popup-2","title":"Modal popup #2","handle":"modal-popup-2","groups":["contact-form","countdown-timer","other"],"rawGroups":["contact form","countdown-timer","email signup","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/modal-popup-2.jpg?v=1764667656","price":9,"isPro":false,"link":"https://section.store/pages/modal-popup-2"},{"id":"shop-the-look-5","title":"Shop the look #5","handle":"shop-the-look-5","groups":["shop-the-look"],"rawGroups":["shop-the-look"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/shop-the-look-5.jpg?v=1764667657","price":9,"isPro":false,"link":"https://section.store/pages/shop-the-look-5"},{"id":"feature-36","title":"Feature #36","handle":"feature-36","groups":["features","video"],"rawGroups":["features","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-36.jpg?v=1764667657","price":9,"isPro":false,"link":"https://section.store/pages/feature-36"},{"id":"video-grid-5","title":"Video grid #5","handle":"video-grid-5","groups":["images","video"],"rawGroups":["grid","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-grid-5.jpg?v=1764667658","price":9,"isPro":false,"link":"https://section.store/pages/video-grid-5"},{"id":"testimonial-35","title":"Testimonial #35","handle":"testimonial-35","groups":["collection","testimonial","video"],"rawGroups":["products","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-35.jpg?v=1764667658","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-35"},{"id":"hero-32","title":"Hero #32","handle":"hero-32","groups":["hero","features","scrolling"],"rawGroups":["hero","features","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-32.jpg?v=1764667659","price":9,"isPro":false,"link":"https://section.store/pages/hero-32"},{"id":"slideshow-10","title":"Slideshow #10","handle":"slideshow-10","groups":["slider","hero"],"rawGroups":["slideshow","banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slideshow-10.jpg?v=1764667659","price":9,"isPro":false,"link":"https://section.store/pages/slideshow-10"},{"id":"beforeafter-image-11","title":"Before/after image #11","handle":"beforeafter-image-11","groups":["comparison","before-after","video"],"rawGroups":["comparison","before / after","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/beforeafter-image-11.jpg?v=1764667660","price":9,"isPro":false,"link":"https://section.store/pages/before-after-image-11"},{"id":"collection-14","title":"Collection #14","handle":"collection-14","groups":["collection","images"],"rawGroups":["collections","gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-14.jpg?v=1764667660","price":9,"isPro":false,"link":"https://section.store/pages/collection-14"},{"id":"featured-collection-18","title":"Featured collection #18","handle":"featured-collection-18","groups":["featured-collection","collection","video"],"rawGroups":["featured-collection","products","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-18.jpg?v=1764667661","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-18"},{"id":"video-image-text-6","title":"Video & image text #6","handle":"video-image-text-6","groups":["image-with-text","testimonial","video"],"rawGroups":["image-with-text","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-image-text-6.jpg?v=1764667661","price":9,"isPro":false,"link":"https://section.store/pages/video-image-text-6"},{"id":"countdown-timer-6","title":"Countdown timer #6","handle":"countdown-timer-6","groups":["countdown-timer","image-with-text","scrolling"],"rawGroups":["countdown-timer","image-with-text","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/countdown-timer-6.jpg?v=1764667662","price":9,"isPro":false,"link":"https://section.store/pages/countdown-timer-6"},{"id":"hero-33","title":"Hero #33","handle":"hero-33","groups":["hero","testimonial","video","popular"],"rawGroups":["banner","hero","testimonial","video","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-33.jpg?v=1764667663","price":9,"isPro":false,"link":"https://section.store/pages/hero-33"},{"id":"feature-37","title":"Feature #37","handle":"feature-37","groups":["tabs","features","images"],"rawGroups":["tabs","features","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-37.jpg?v=1764667663","price":9,"isPro":false,"link":"https://section.store/pages/feature-37"},{"id":"comparison-table-21","title":"Comparison table #21","handle":"comparison-table-21","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-21.jpg?v=1764667663","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-21"},{"id":"testimonial-36","title":"Testimonial #36","handle":"testimonial-36","groups":["scrolling","testimonial","video"],"rawGroups":["scrolling","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-36.jpg?v=1764667664","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-36"},{"id":"product-ingredients-6","title":"Product ingredients #6","handle":"product-ingredients-6","groups":["product-ingredients"],"rawGroups":["product-ingredients"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-ingredients-6.jpg?v=1764667664","price":14,"isPro":true,"link":"https://section.store/pages/product-ingredients-6"},{"id":"feature-38","title":"Feature #38","handle":"feature-38","groups":["image-with-text","features"],"rawGroups":["image-with-text","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-38.jpg?v=1764667666","price":9,"isPro":false,"link":"https://section.store/pages/feature-38"},{"id":"faq-16","title":"FAQ #16","handle":"faq-16","groups":["tabs","faq","video"],"rawGroups":["tabs","faq","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-16.jpg?v=1764667666","price":9,"isPro":false,"link":"https://section.store/pages/faq-16"},{"id":"steps-10","title":"Steps #10","handle":"steps-10","groups":["steps"],"rawGroups":["steps"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/steps-10.jpg?v=1764667667","price":9,"isPro":false,"link":"https://section.store/pages/steps-10"},{"id":"text-block-4","title":"Text block #4","handle":"text-block-4","groups":["text","images"],"rawGroups":["text","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/text-block-4.jpg?v=1764667667","price":9,"isPro":false,"link":"https://section.store/pages/text-block-4"},{"id":"feature-39","title":"Feature #39","handle":"feature-39","groups":["image-with-text","features"],"rawGroups":["image-with-text","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-39.jpg?v=1764667668","price":9,"isPro":false,"link":"https://section.store/pages/feature-39"},{"id":"logo-cloud-3","title":"Logo cloud #3","handle":"logo-cloud-3","groups":["scrolling"],"rawGroups":["logo-cloud"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/logo-cloud-3.jpg?v=1764667668","price":9,"isPro":false,"link":"https://section.store/pages/logo-cloud-3"},{"id":"header-14","title":"Header #14","handle":"header-14","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-14.jpg?v=1764667668","price":9,"isPro":false,"link":"https://section.store/pages/header-14"},{"id":"bento-grid-3","title":"Bento grid #3","handle":"bento-grid-3","groups":["images","other"],"rawGroups":["grid","other","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/bento-grid-3.jpg?v=1764667669","price":9,"isPro":false,"link":"https://section.store/pages/bento-grid-3"},{"id":"comparison-table-22","title":"Comparison table #22","handle":"comparison-table-22","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-22.jpg?v=1764667669","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-22"},{"id":"pricing-table-5","title":"Pricing table #5","handle":"pricing-table-5","groups":["comparison","other"],"rawGroups":["pricing-table","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/pricing-table-5.jpg?v=1764667670","price":9,"isPro":false,"link":"https://section.store/pages/pricing-table-5"},{"id":"video-grid-6","title":"Video grid #6","handle":"video-grid-6","groups":["collection","scrolling","video"],"rawGroups":["collections","scrolling","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-grid-6.jpg?v=1764667671","price":9,"isPro":false,"link":"https://section.store/pages/video-grid-6"},{"id":"beforeafter-image-12","title":"Before/after image #12","handle":"beforeafter-image-12","groups":["comparison","before-after","tabs","testimonial"],"rawGroups":["comparison","before / after","tabs","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/beforeafter-image-12.jpg?v=1764667671","price":9,"isPro":false,"link":"https://section.store/pages/before-after-image-12"},{"id":"feature-40","title":"Feature #40","handle":"feature-40","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-40.jpg?v=1764667672","price":9,"isPro":false,"link":"https://section.store/pages/feature-40"},{"id":"product-ingredients-7","title":"Product ingredients #7","handle":"product-ingredients-7","groups":["product-ingredients","slider"],"rawGroups":["product-ingredients","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-ingredients-7.jpg?v=1764667673","price":14,"isPro":true,"link":"https://section.store/pages/product-ingredients-7"},{"id":"steps-11","title":"Steps #11","handle":"steps-11","groups":["steps"],"rawGroups":["steps"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/steps-11.jpg?v=1764667671","price":9,"isPro":false,"link":"https://section.store/pages/steps-11"},{"id":"hero-34","title":"Hero #34","handle":"hero-34","groups":["hero"],"rawGroups":["banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-34.jpg?v=1764667673","price":9,"isPro":false,"link":"https://section.store/pages/hero-34,popular"},{"id":"hero-35","title":"Hero #35","handle":"hero-35","groups":["before-after","hero"],"rawGroups":["before / after","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-35.jpg?v=1764667674","price":9,"isPro":false,"link":"https://section.store/pages/hero-35"},{"id":"feature-41","title":"Feature #41","handle":"feature-41","groups":["image-with-text","features","images"],"rawGroups":["image-with-text","features","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-41.jpg?v=1764667674","price":9,"isPro":false,"link":"https://section.store/pages/feature-41"},{"id":"feature-42","title":"Feature #42","handle":"feature-42","groups":["product-ingredients","features","video"],"rawGroups":["product","features","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-42.jpg?v=1764667675","price":9,"isPro":false,"link":"https://section.store/pages/feature-42"},{"id":"hero-36","title":"Hero #36","handle":"hero-36","groups":["hero","video"],"rawGroups":["banner","hero","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-36.jpg?v=1764667675","price":9,"isPro":false,"link":"https://section.store/pages/hero-36"},{"id":"footer-14","title":"Footer #14","handle":"footer-14","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-14.jpg?v=1764667676","price":9,"isPro":false,"link":"https://section.store/pages/footer-14"},{"id":"feature-44","title":"Feature #44","handle":"feature-44","groups":["tabs","features","video"],"rawGroups":["tabs","features","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-44.jpg?v=1764667676","price":9,"isPro":false,"link":"https://section.store/pages/feature-44"},{"id":"collection-15","title":"Collection #15","handle":"collection-15","groups":["collection"],"rawGroups":["collections"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-15.jpg?v=1764667677","price":9,"isPro":false,"link":"https://section.store/pages/collection-15"},{"id":"feature-43","title":"Feature #43","handle":"feature-43","groups":["tabs","features","images"],"rawGroups":["tabs","features","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-43.jpg?v=1764667677","price":9,"isPro":false,"link":"https://section.store/pages/feature-43"},{"id":"video-grid-social-media-7","title":"Video grid (social media) #7","handle":"video-grid-social-media-7","groups":["testimonial","video"],"rawGroups":["testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-grid-social-media-7.jpg?v=1764667678","price":9,"isPro":false,"link":"https://section.store/pages/video-from-social-7"},{"id":"product-quiz","title":"Product quiz","handle":"product-quiz","groups":["featured-collection","tabs","product-ingredients","collection","other"],"rawGroups":["featured-collection","tabs","product","products","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-quiz.jpg?v=1764667678","price":14,"isPro":true,"link":"https://section.store/pages/product-quiz"},{"id":"faq-17","title":"FAQ #17","handle":"faq-17","groups":["tabs","faq"],"rawGroups":["tabs","faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-17.jpg?v=1764667679","price":9,"isPro":false,"link":"https://section.store/pages/faq-17"},{"id":"comparison-table-23","title":"Comparison table #23","handle":"comparison-table-23","groups":["comparison","features"],"rawGroups":["comparison","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-23.jpg?v=1764667679","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-23"},{"id":"scrolling-logo-cloud-5","title":"Scrolling logo cloud #5","handle":"scrolling-logo-cloud-5","groups":["scrolling"],"rawGroups":["logo-cloud","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-logo-cloud-5.jpg?v=1764667680","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-logo-cloud-5"},{"id":"testimonial-37","title":"Testimonial #37","handle":"testimonial-37","groups":["scrolling","testimonial"],"rawGroups":["scrolling","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-37.jpg?v=1764667680","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-37"},{"id":"testimonial-38","title":"Testimonial #38","handle":"testimonial-38","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-38.jpg?v=1764667680","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-38"},{"id":"contact-form-5","title":"Contact form #5","handle":"contact-form-5","groups":["contact-form"],"rawGroups":["contact form"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/contact-form-5.jpg?v=1764667682","price":9,"isPro":false,"link":"https://section.store/pages/contact-form-5"},{"id":"product-addons-3","title":"Product addons #3","handle":"product-addons-3","groups":["upsell","snippet","page-templates"],"rawGroups":["upsell","cross sell","snippet","product page"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-addons-3.jpg?v=1764667682","price":14,"isPro":true,"link":"https://section.store/products/product-addons-3"},{"id":"hero-37","title":"Hero #37","handle":"hero-37","groups":["hero","images","video"],"rawGroups":["hero","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-37.jpg?v=1764667683","price":9,"isPro":false,"link":"https://section.store/pages/hero-37"},{"id":"slideshow-11","title":"Slideshow #11","handle":"slideshow-11","groups":["slider","hero"],"rawGroups":["slideshow","banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slideshow-11.jpg?v=1764667683","price":9,"isPro":false,"link":"https://section.store/pages/slideshow-11"},{"id":"collection-list-3","title":"Collection list #3","handle":"collection-list-3","groups":["collection","video","header"],"rawGroups":["collections","video","navigation"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-list-3.jpg?v=1764667684","price":9,"isPro":false,"link":"https://section.store/pages/collection-list-3"},{"id":"footer-15","title":"Footer #15","handle":"footer-15","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-15.jpg?v=1764667685","price":9,"isPro":false,"link":"https://section.store/pages/footer-15"},{"id":"countdown-timer-7","title":"Countdown timer #7","handle":"countdown-timer-7","groups":["countdown-timer"],"rawGroups":["countdown-timer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/countdown-timer-7.jpg?v=1764667684","price":9,"isPro":false,"link":"https://section.store/pages/countdown-timer-7"},{"id":"bundle-builder-4","title":"Bundle builder #4","handle":"bundle-builder-4","groups":["collection","upsell","other"],"rawGroups":["products","bundle builder","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/bundle-builder-4.jpg?v=1764667686","price":9,"isPro":false,"link":"https://section.store/pages/bundle-builder-4"},{"id":"testimonial-39","title":"Testimonial #39","handle":"testimonial-39","groups":["slider","images","testimonial","video"],"rawGroups":["slider","images","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-39.jpg?v=1764667685","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-39"},{"id":"hero-38","title":"Hero #38","handle":"hero-38","groups":["hero","features"],"rawGroups":["hero","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-38.jpg?v=1764667686","price":9,"isPro":false,"link":"https://section.store/pages/hero-38"},{"id":"hero-39","title":"Hero #39","handle":"hero-39","groups":["hero","features"],"rawGroups":["hero","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-39.jpg?v=1764667687","price":9,"isPro":false,"link":"https://section.store/pages/hero-39"},{"id":"contact-form-6","title":"Contact form #6","handle":"contact-form-6","groups":["contact-form"],"rawGroups":["contact form"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/contact-form-6.jpg?v=1764667687","price":9,"isPro":false,"link":"https://section.store/pages/contact-form-6"},{"id":"product-ingredients-8","title":"Product ingredients #8","handle":"product-ingredients-8","groups":["product-ingredients","slider"],"rawGroups":["product-ingredients","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-ingredients-8.jpg?v=1764667688","price":14,"isPro":true,"link":"https://section.store/pages/product-ingredients-8"},{"id":"trust-box","title":"Trust box","handle":"trust-box","groups":["snippet","page-templates"],"rawGroups":["snippet","product page"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/trust-box.jpg?v=1764667688","price":9,"isPro":false,"link":"https://section.store/products/trust-box"},{"id":"scrolling-images-6","title":"Scrolling images #6","handle":"scrolling-images-6","groups":["scrolling"],"rawGroups":["scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-images-6.jpg?v=1764667689","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-images-6"},{"id":"flip-cards","title":"Flip cards","handle":"flip-cards","groups":["product-ingredients","other","features"],"rawGroups":["product-ingredients","other","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/flip-cards.jpg?v=1764667689","price":9,"isPro":false,"link":"https://section.store/pages/flip-cards"},{"id":"countdown-timer-8","title":"Countdown timer #8","handle":"countdown-timer-8","groups":["countdown-timer"],"rawGroups":["countdown-timer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/countdown-timer-8.jpg?v=1764667692","price":9,"isPro":false,"link":"https://section.store/pages/countdown-timer-8"},{"id":"slider-12","title":"Slider #12","handle":"slider-12","groups":["collection","blog","slider","images"],"rawGroups":["products","blog","collections","slider","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-12.jpg?v=1764667691","price":9,"isPro":false,"link":"https://section.store/pages/slider-12"},{"id":"slider-2-pro","title":"Slider #2 pro 💎","handle":"slider-2-pro","groups":["collection","blog","slider","images"],"rawGroups":["products","blog","collections","slider","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-2-pro.jpg?v=1764667691","price":14,"isPro":true,"link":"https://section.store/pages/slider-2-pro"},{"id":"testimonial-41","title":"Testimonial #41","handle":"testimonial-41","groups":["images","scrolling","testimonial"],"rawGroups":["images","scrolling","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-41.jpg?v=1764667692","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-41"},{"id":"gallery-9","title":"Gallery #9","handle":"gallery-9","groups":["slider","images","free"],"rawGroups":["slider","gallery","images","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/gallery-9.jpg?v=1764667693","price":0,"isPro":false,"link":"https://section.store/pages/gallery-9"},{"id":"testimonial-42","title":"Testimonial #42","handle":"testimonial-42","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-42.jpg?v=1764667693","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-42"},{"id":"countdown-timer-bar-4","title":"Countdown timer bar #4","handle":"countdown-timer-bar-4","groups":["countdown-timer","header"],"rawGroups":["countdown-timer","announcement bar"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/countdown-timer-bar-4.jpg?v=1764667693","price":9,"isPro":false,"link":"https://section.store/pages/countdown-timer-bar-4"},{"id":"stats-2","title":"Stats #2","handle":"stats-2","groups":["text","other","features"],"rawGroups":["text","other","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/stats-2.jpg?v=1764667695","price":9,"isPro":false,"link":"https://section.store/pages/stats-2"},{"id":"promo-slider","title":"Promo slider","handle":"promo-slider","groups":["text","header"],"rawGroups":["text","announcement bar"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/promo-slider.jpg?v=1764667694","price":14,"isPro":true,"link":"https://section.store/pages/promo-slider"},{"id":"countdown-timer-9","title":"Countdown timer #9","handle":"countdown-timer-9","groups":["countdown-timer"],"rawGroups":["countdown-timer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/countdown-timer-9.jpg?v=1764667693","price":9,"isPro":false,"link":"https://section.store/pages/countdown-timer-9"},{"id":"footer-16","title":"Footer #16","handle":"footer-16","groups":["footer","scrolling"],"rawGroups":["footer","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-16.jpg?v=1764667694","price":9,"isPro":false,"link":"https://section.store/pages/footer-16"},{"id":"countdown-timer-bar-5","title":"Countdown timer bar #5","handle":"countdown-timer-bar-5","groups":["countdown-timer","header"],"rawGroups":["countdown-timer","announcement bar"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/countdown-timer-bar-5.jpg?v=1764667695","price":9,"isPro":false,"link":"https://section.store/pages/countdown-timer-bar-5"},{"id":"feature-45","title":"Feature #45","handle":"feature-45","groups":["hotspots","features"],"rawGroups":["hotspots","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-45.jpg?v=1764667696","price":9,"isPro":false,"link":"https://section.store/pages/feature-45"},{"id":"video-with-text-8","title":"Video with text #8","handle":"video-with-text-8","groups":["video"],"rawGroups":["video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-with-text-8.jpg?v=1764667697","price":9,"isPro":false,"link":"https://section.store/pages/video-with-text-8"},{"id":"header-15","title":"Header #15","handle":"header-15","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-15.jpg?v=1764667698","price":9,"isPro":false,"link":"https://section.store/pages/header-15"},{"id":"beforeafter-image-13","title":"Before/after image #13","handle":"beforeafter-image-13","groups":["before-after","testimonial"],"rawGroups":["before / after","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/beforeafter-image-13.jpg?v=1764667697","price":9,"isPro":false,"link":"https://section.store/pages/before-after-image-13"},{"id":"social-proof","title":"Social proof","handle":"social-proof","groups":["snippet"],"rawGroups":["snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/social-proof.jpg?v=1764667698","price":14,"isPro":true,"link":"https://section.store/products/social-proof"},{"id":"header-16","title":"Header #16","handle":"header-16","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-16.jpg?v=1764667699","price":9,"isPro":false,"link":"https://section.store/pages/header-16"},{"id":"testimonial-43","title":"Testimonial #43","handle":"testimonial-43","groups":["scrolling","testimonial","video"],"rawGroups":["scrolling","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-43.jpg?v=1764667699","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-43"},{"id":"hero-40","title":"Hero #40","handle":"hero-40","groups":["scrolling","hero","images"],"rawGroups":["logo-cloud","hero","images","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-40.jpg?v=1764667699","price":9,"isPro":false,"link":"https://section.store/pages/hero-40"},{"id":"slider-13","title":"Slider #13","handle":"slider-13","groups":["collection","slider"],"rawGroups":["collections","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-13.jpg?v=1764667701","price":9,"isPro":false,"link":"https://section.store/pages/slider-13"},{"id":"testimonial-44","title":"Testimonial #44","handle":"testimonial-44","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-44.jpg?v=1764667701","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-44"},{"id":"flip-cards-2","title":"Flip cards #2","handle":"flip-cards-2","groups":["product-ingredients","images","other"],"rawGroups":["product-ingredients","grid","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/flip-cards-2.jpg?v=1764667701","price":9,"isPro":false,"link":"https://section.store/pages/flip-cards-2"},{"id":"feature-47","title":"Feature #47","handle":"feature-47","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-47.jpg?v=1764667701","price":9,"isPro":false,"link":"https://section.store/pages/feature-47"},{"id":"footer-17","title":"Footer #17","handle":"footer-17","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/footer-17.jpg?v=1764667702","price":9,"isPro":false,"link":"https://section.store/pages/footer-17"},{"id":"comparison-table-24","title":"Comparison table #24","handle":"comparison-table-24","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-24.jpg?v=1764667703","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-24"},{"id":"feature-46","title":"Feature #46","handle":"feature-46","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-46.jpg?v=1764667703","price":9,"isPro":false,"link":"https://section.store/pages/feature-46"},{"id":"video-with-text-9","title":"Video with text #9","handle":"video-with-text-9","groups":["features","video"],"rawGroups":["features","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-with-text-9.jpg?v=1764667705","price":9,"isPro":false,"link":"https://section.store/pages/video-with-text-9"},{"id":"collection-tabs-3","title":"Collection tabs #3","handle":"collection-tabs-3","groups":["tabs","images","collection","slider"],"rawGroups":["tabs","grid","collections","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/collection-tabs-3.jpg?v=1764667704","price":9,"isPro":false,"link":"https://section.store/pages/collection-tabs-3"},{"id":"slider-14","title":"Slider #14","handle":"slider-14","groups":["collection","slider"],"rawGroups":["collections","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-14.jpg?v=1764667705","price":9,"isPro":false,"link":"https://section.store/pages/slider-14"},{"id":"feature-48","title":"Feature #48","handle":"feature-48","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-48.jpg?v=1764667705","price":9,"isPro":false,"link":"https://section.store/pages/feature-48"},{"id":"featured-product-3","title":"Featured product #3","handle":"featured-product-3","groups":["countdown-timer","product-ingredients"],"rawGroups":["countdown-timer","product"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-product-3.jpg?v=1764667706","price":14,"isPro":true,"link":"https://section.store/pages/featured-product-3"},{"id":"faq-18","title":"FAQ #18","handle":"faq-18","groups":["faq"],"rawGroups":["faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/faq-18.jpg?v=1764667706","price":9,"isPro":false,"link":"https://section.store/pages/faq-18"},{"id":"testimonial-45","title":"Testimonial #45","handle":"testimonial-45","groups":["scrolling","testimonial"],"rawGroups":["scrolling","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-45.jpg?v=1764667706","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-45"},{"id":"comparison-table-25","title":"Comparison table #25","handle":"comparison-table-25","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/comparison-table-25.jpg?v=1764667707","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-25"},{"id":"feature-49","title":"Feature #49","handle":"feature-49","groups":["features","scrolling"],"rawGroups":["features","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-49.jpg?v=1764667707","price":9,"isPro":false,"link":"https://section.store/pages/feature-49"},{"id":"featured-collection-tabs-5","title":"Featured collection (tabs) #5","handle":"featured-collection-tabs-5","groups":["tabs","collection"],"rawGroups":["tabs","products","collections"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-tabs-5.jpg?v=1764667709","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-tabs-5"},{"id":"product-ingredients-9","title":"Product ingredients #9","handle":"product-ingredients-9","groups":["product-ingredients"],"rawGroups":["product-ingredients"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-ingredients-9.jpg?v=1764667709","price":14,"isPro":true,"link":"https://section.store/pages/product-ingredients-9"},{"id":"slider-15","title":"Slider #15","handle":"slider-15","groups":["collection","slider","images"],"rawGroups":["collections","slider","gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-15.jpg?v=1764667710","price":9,"isPro":false,"link":"https://section.store/pages/slider-15"},{"id":"hero-41","title":"Hero #41","handle":"hero-41","groups":["slider","hero","scrolling"],"rawGroups":["slideshow","hero","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-41.jpg?v=1764667710","price":9,"isPro":false,"link":"https://section.store/pages/hero-41"},{"id":"header-17","title":"Header #17","handle":"header-17","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/header-17.jpg?v=1764667711","price":9,"isPro":false,"link":"https://section.store/pages/header-17"},{"id":"feature-50","title":"Feature #50","handle":"feature-50","groups":["hotspots","features"],"rawGroups":["hotspots","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-50.jpg?v=1764667711","price":9,"isPro":false,"link":"https://section.store/pages/feature-50"},{"id":"tabs-2","title":"Tabs #2","handle":"tabs-2","groups":["tabs","features","video"],"rawGroups":["tabs","features","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/tabs-2.jpg?v=1764667711","price":9,"isPro":false,"link":"https://section.store/pages/tabs-2"},{"id":"hero-42","title":"Hero #42","handle":"hero-42","groups":["hero","testimonial","video"],"rawGroups":["banner","hero","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-42.jpg?v=1764667711","price":9,"isPro":false,"link":"https://section.store/pages/hero-42"},{"id":"how-it-works","title":"How it works","handle":"how-it-works","groups":["steps","faq","video"],"rawGroups":["steps","faq","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/how-it-works.jpg?v=1764667714","price":9,"isPro":false,"link":"https://section.store/pages/how-it-works"},{"id":"featured-collection-19","title":"Featured collection #19","handle":"featured-collection-19","groups":["featured-collection","collection","images","video"],"rawGroups":["featured-collection","products","images","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-collection-19.jpg?v=1764667713","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-19"},{"id":"modal-popup-3","title":"Modal popup #3","handle":"modal-popup-3","groups":["contact-form","other"],"rawGroups":["contact form","email signup","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/modal-popup-3.jpg?v=1764667714","price":9,"isPro":false,"link":"https://section.store/pages/modal-popup-3"},{"id":"feature-51","title":"Feature #51","handle":"feature-51","groups":["faq","features","images"],"rawGroups":["faq","features","gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/feature-51.jpg?v=1764667714","price":9,"isPro":false,"link":"https://section.store/pages/feature-51"},{"id":"product-videos-5","title":"Product videos #5","handle":"product-videos-5","groups":["snippet","video"],"rawGroups":["snippet","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-videos-5.jpg?v=1764667715","price":14,"isPro":true,"link":"https://section.store/products/product-videos-5"},{"id":"countdown-timer-bar-6","title":"Countdown timer bar #6","handle":"countdown-timer-bar-6","groups":["countdown-timer","header"],"rawGroups":["countdown-timer","announcement bar"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/countdown-timer-bar-6.jpg?v=1764667715","price":9,"isPro":false,"link":"https://section.store/pages/countdown-timer-bar-6"},{"id":"video-banner-pro","title":"Video banner pro 💎","handle":"video-banner-pro","groups":["slider","hero","video"],"rawGroups":["slideshow","banner","hero","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-banner-pro.jpg?v=1764667715","price":14,"isPro":true,"link":"https://section.store/pages/video-banner-flagman"},{"id":"instafeed-9","title":"Instafeed #9","handle":"instafeed-9","groups":["scrolling","images","video","free"],"rawGroups":["instafeed","gallery","images","video","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/instafeed-9.jpg?v=1764667717","price":0,"isPro":false,"link":"https://section.store/pages/instafeed-9"},{"id":"schedule-section","title":"Schedule section","handle":"schedule-section","groups":["other","free"],"rawGroups":["other","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/schedule-section.png?v=1764667716","price":0,"isPro":false,"link":"https://section.store/pages/schedule"},{"id":"scrolling-promotion","title":"Scrolling promotion","handle":"scrolling-promotion","groups":["steps","features","images","scrolling","video"],"rawGroups":["timeline","features","images","scrolling","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-promotion.jpg?v=1764667718","price":14,"isPro":true,"link":"https://section.store/pages/scrolling-promotion"},{"id":"hero-43","title":"Hero #43","handle":"hero-43","groups":["hero","scrolling","video"],"rawGroups":["banner","hero","scrolling","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hero-43.jpg?v=1764667717","price":9,"isPro":false,"link":"https://section.store/pages/hero-43"},{"id":"featured-product-4","title":"Featured product #4","handle":"featured-product-4","groups":["product-ingredients","features","testimonial","video"],"rawGroups":["product","features","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/featured-product-4.jpg?v=1764667718","price":14,"isPro":true,"link":"https://section.store/pages/featured-product-4"},{"id":"testimonial-46","title":"Testimonial #46","handle":"testimonial-46","groups":["scrolling","testimonial"],"rawGroups":["scrolling","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/testimonial-46.jpg?v=1764667719","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-46"},{"id":"scrolling-media","title":"Scrolling media","handle":"scrolling-media","groups":["blog","collection","images","scrolling","video"],"rawGroups":["blog","collections","gallery","images","scrolling","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-media.jpg?v=1764667720","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-media"},{"id":"video-slider-4","title":"Video slider #4","handle":"video-slider-4","groups":["slider","testimonial","video"],"rawGroups":["slider","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-slider-4.jpg?v=1764667719","price":9,"isPro":false,"link":"https://section.store/pages/video-slider-4"},{"id":"hotspots-12","title":"Hotspots #12","handle":"hotspots-12","groups":["hotspots","features"],"rawGroups":["hotspots","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/hotspots-12.jpg?v=1764667721","price":9,"isPro":false,"link":"https://section.store/pages/hotspots-12"},{"id":"scrolling-collections-2","title":"Scrolling collections #2","handle":"scrolling-collections-2","groups":["collection","scrolling"],"rawGroups":["collections","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-collections-2.jpg?v=1764667719","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-collection-2"},{"id":"product-details","title":"Product details","handle":"product-details","groups":["product-ingredients","page-templates","collection","faq","features"],"rawGroups":["product","product page","products","faq","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-details.jpg?v=1764667721","price":14,"isPro":true,"link":"https://section.store/pages/product-details"},{"id":"animate-section","title":"Animate section","handle":"animate-section","groups":["other","free"],"rawGroups":["other","free"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/animate-section.png?v=1764667720","price":0,"isPro":false,"link":"https://section.store/pages/scrolling-animation"},{"id":"announcement-bar-slideshow-2","title":"Announcement bar (slideshow) #2","handle":"announcement-bar-slideshow-2","groups":["header"],"rawGroups":["announcement bar"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/announcement-bar-slideshow-2.jpg?v=1764667721","price":9,"isPro":false,"link":"https://section.store/pages/announcement-bar-slideshow-2"},{"id":"scrolling-images-pro","title":"Scrolling images pro 💎","handle":"scrolling-images-pro","groups":["images","scrolling"],"rawGroups":["gallery","images","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/scrolling-images-pro.jpg?v=1764667722","price":14,"isPro":true,"link":"https://section.store/pages/scrolling-images-pro"},{"id":"video-slider-5","title":"Video slider #5","handle":"video-slider-5","groups":["slider","testimonial","video"],"rawGroups":["slider","testimonial","video"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/video-slider-5.jpg?v=1764667723","price":9,"isPro":false,"link":"https://section.store/pages/video-slider-5"},{"id":"floating-menu","title":"Floating menu","handle":"floating-menu","groups":["header"],"rawGroups":["navigation","header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/floating-menu.jpg?v=1764667722","price":9,"isPro":false,"link":"https://section.store/pages/floating-menu"},{"id":"product-tabs-5-pro","title":"Product tabs #5 pro 💎","handle":"product-tabs-5-pro","groups":["tabs","snippet","product-ingredients","page-templates"],"rawGroups":["tabs","snippet","product","product page"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-tabs-5-pro.jpg?v=1764667723","price":14,"isPro":true,"link":"https://section.store/products/outdoors-for-all-hoodie"},{"id":"product-ingredients-10","title":"Product ingredients #10","handle":"product-ingredients-10","groups":["product-ingredients"],"rawGroups":["product-ingredients"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/product-ingredients-10.jpg?v=1764667725","price":14,"isPro":true,"link":"https://section.store/pages/product-ingredients-10"},{"id":"bundle-builder-5","title":"Bundle builder #5","handle":"bundle-builder-5","groups":["collection","upsell","other"],"rawGroups":["products","bundle builder","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/bundle-builder-5.jpg?v=1764667725","price":9,"isPro":false,"link":"https://section.store/pages/bundle-builder-5"},{"id":"bento-grid-4","title":"Bento grid #4","handle":"bento-grid-4","groups":["text","image-with-text","images","other"],"rawGroups":["text","image-with-text","grid","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/bento-grid-4.jpg?v=1764667725","price":9,"isPro":false,"link":"https://section.store/pages/bento-grid-4"},{"id":"slider-16","title":"Slider #16","handle":"slider-16","groups":["slider","hero"],"rawGroups":["slideshow","banner","hero","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/slider-16.jpg?v=1764667726","price":9,"isPro":false,"link":"https://section.store/pages/slider-16"},{"id":"about-us-2","title":"About Us #2","handle":"about-us-2","groups":["scrolling","other"],"rawGroups":["scrolling","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/About_Us.jpg?v=1765816633","price":9,"isPro":false,"link":"https://section.store/pages/about-us-2"},{"id":"featured-collection-20","title":"Featured Collection #20","handle":"featured-collection-20","groups":["scrolling","countdown-timer","featured-collection","collection"],"rawGroups":["scrolling","countdown-timer","featured-collection","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Featured_Collection_20.jpg?v=1765816686","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-20"},{"id":"shoppable-video-4","title":"Shoppable Video #4","handle":"shoppable-video-4","groups":["testimonial","video","shop-the-look","collection"],"rawGroups":["testimonial","video","shop-the-look","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Shoppable_Video_4.jpg?v=1765816758","price":9,"isPro":false,"link":"https://section.store/pages/shoppable-video-4"},{"id":"hero-44","title":"Hero #44","handle":"hero-44","groups":["scrolling","hero"],"rawGroups":["scrolling","banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Hero_2400x1600_1.jpg?v=1765816848","price":9,"isPro":false,"link":"https://section.store/pages/hero-44"},{"id":"featured-collection-tabs-6","title":"Featured Collection (tabs) #6","handle":"featured-collection-tabs-6","groups":["tabs","collection","featured-collection","product-ingredients"],"rawGroups":["tabs","collections","featured-collections","product"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Featured_Collection_Tabs.jpg?v=1765816901","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-tabs-6"},{"id":"image-with-text-24","title":"Image with text #24","handle":"image-with-text-24","groups":["steps","image-with-text","features"],"rawGroups":["timeline","image-with-text","features","steps"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Image_with_Text_2400x1600_a3081a4c-fba4-4f60-8be2-c828876a0728.jpg?v=1765816973","price":9,"isPro":false,"link":"https://section.store/pages/image-with-text-24"},{"id":"feature-52","title":"Feature #52","handle":"feature-52","groups":["image-with-text","features"],"rawGroups":["image-with-text","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Feature_52_2400x1600_da301c3d-b8ef-4fbb-8810-ef04cce86f6c.jpg?v=1765817034","price":9,"isPro":false,"link":"https://section.store/pages/feature-52"},{"id":"feature-53","title":"Feature #53","handle":"feature-53","groups":["image-with-text","features"],"rawGroups":["image-with-text","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Feature_53.jpg?v=1765817094","price":9,"isPro":false,"link":"https://section.store/pages/feature-53"},{"id":"scrolling-text-10","title":"Scrolling text #10","handle":"scrolling-text-10","groups":["text","scrolling"],"rawGroups":["text","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Scrolling_Text_2400x1600_5f286e43-c705-492b-98b8-763b9cff0266.jpg?v=1765817148","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-text-10"},{"id":"hero-pro","title":"Hero Pro","handle":"hero-pro","groups":["hero","video","popular"],"rawGroups":["hero","banner","video","popular"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Hero_Pro.jpg?v=1768539813","price":14,"isPro":true,"link":"https://section.store/pages/hero-pro"},{"id":"hero-45","title":"Hero #45","handle":"hero-45","groups":["hero","image-with-text","video","testimonial"],"rawGroups":["hero","image-with-text","video","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Hero_Image_9315.jpg?v=1768539890","price":9,"isPro":false,"link":"https://section.store/pages/hero-45"},{"id":"faq-19","title":"FAQ #19","handle":"faq-19","groups":["faq"],"rawGroups":["faq"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/FAQ_19.jpg?v=1768539956","price":9,"isPro":false,"link":"https://section.store/pages/faq-19"},{"id":"video-with-text-10","title":"Video With Text #10","handle":"video-with-text-10","groups":["video","slider","collection"],"rawGroups":["video","slider","collections"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Video_with_Text_10.jpg?v=1768540002","price":9,"isPro":false,"link":"https://section.store/pages/video-with-text-10"},{"id":"hero-46","title":"Hero #46","handle":"hero-46","groups":["hero","before-after"],"rawGroups":["hero","before / after"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Hero_Section_9381.jpg?v=1768540055","price":9,"isPro":false,"link":"https://section.store/pages/hero-46"},{"id":"featured-products-4","title":"Featured Products #4","handle":"featured-products-4","groups":["image-with-text","images","featured-collection","collection"],"rawGroups":["image-with-text","images","featured-collection","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Featured_Products_4.jpg?v=1768540155","price":14,"isPro":true,"link":"https://section.store/pages/featured-products-4"},{"id":"bundle-builder-6","title":"Bundle Builder #6","handle":"bundle-builder-6","groups":["collection","upsell","other"],"rawGroups":["products","bundle builder","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Bundle_Builder_6.jpg?v=1768540283","price":9,"isPro":false,"link":"https://section.store/pages/bundle-builder-6"},{"id":"header-18","title":"Header #18","handle":"header-18","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Header_18.jpg?v=1768540345","price":9,"isPro":false,"link":"https://section.store/pages/header-18"},{"id":"testimonial-47","title":"Testimonial #47","handle":"testimonial-47","groups":["testimonial","features"],"rawGroups":["testimonial","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Testimonials_47.jpg?v=1768540394","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-47"},{"id":"comparison-table-26","title":"Comparison Table #26","handle":"comparison-table-26","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Comparison_Table_26.jpg?v=1768540576","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-26"},{"id":"testimonial-48","title":"Testimonial #48","handle":"testimonial-48","groups":["scrolling","testimonial"],"rawGroups":["scrolling","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Testimonials_48.jpg?v=1768540628","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-48"},{"id":"testimonial-49","title":"Testimonial #49","handle":"testimonial-49","groups":["scrolling","testimonial"],"rawGroups":["scrolling","testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Testimonials_49.jpg?v=1768540679","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-49"},{"id":"feature-54","title":"Feature #54","handle":"feature-54","groups":["features"],"rawGroups":["features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Feature_54.jpg?v=1768540723","price":9,"isPro":false,"link":"https://section.store/pages/feature-54"},{"id":"guarantee","title":"Guarantee","handle":"guarantee","groups":["features","hero","other","images"],"rawGroups":["features","hero","other","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Section_Guarantee.jpg?v=1771487063","price":9,"isPro":false,"link":"https://section.store/pages/guarantee"},{"id":"product-stats","title":"Product stats","handle":"product-stats","groups":["snippet"],"rawGroups":["snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Product_Stats_from_Section_Factory.jpg?v=1771487119","price":14,"isPro":true,"link":"https://section.store/products/product-stats"},{"id":"comparison-table-29","title":"Comparison Table #29","handle":"comparison-table-29","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Comparison_Table_29.jpg?v=1771487220","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-29"},{"id":"comparison-table-27","title":"Comparison Table #27","handle":"comparison-table-27","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Comparison_Table_27.jpg?v=1771487280","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-27"},{"id":"shoppable-video-5","title":"Shoppable Video #5","handle":"shoppable-video-5","groups":["video","shop-the-look","collection"],"rawGroups":["video","shop-the-look","products"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Shoppable_Video_5.jpg?v=1771487352","price":9,"isPro":false,"link":"https://section.store/pages/shoppable-video-5"},{"id":"footer-18","title":"Footer #18","handle":"footer-18","groups":["footer"],"rawGroups":["footer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Footer_18.jpg?v=1771487414","price":9,"isPro":false,"link":"https://section.store/pages/footer-18"},{"id":"featured-collection-21","title":"Featured Collection #21","handle":"featured-collection-21","groups":["featured-collection","collection","features"],"rawGroups":["featured-collection","products","features"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Featured_Collection_21.jpg?v=1771487464","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-21"},{"id":"section-divider-pro","title":"Section divider pro","handle":"section-divider-pro","groups":["other"],"rawGroups":["other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Section_Divider_Pro.jpg?v=1771487558","price":14,"isPro":true,"link":"https://section.store/pages/section-divider-pro"},{"id":"steps-12","title":"Steps #12","handle":"steps-12","groups":["features","steps","text"],"rawGroups":["features","steps","text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Steps_12.jpg?v=1771487624","price":9,"isPro":false,"link":"https://section.store/pages/steps-12"},{"id":"bento-grid-5","title":"Bento Grid #5","handle":"bento-grid-5","groups":["image-with-text","images","text"],"rawGroups":["image-with-text","grid","text","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Bento_Grid_5.jpg?v=1771487664","price":9,"isPro":false,"link":"https://section.store/pages/bento-grid-5"},{"id":"instafeed-10","title":"Instafeed #10","handle":"instafeed-10","groups":["scrolling","images"],"rawGroups":["instafeed","gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Instafeed_10.jpg?v=1771487725","price":9,"isPro":false,"link":"https://section.store/pages/instafeed-10"},{"id":"hero-47","title":"Hero #47","handle":"hero-47","groups":["scrolling","hero"],"rawGroups":["scrolling","banner","hero"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Hero_Image_10008.jpg?v=1771487783","price":9,"isPro":false,"link":"https://section.store/pages/hero-47"},{"id":"abandoned-tab-message","title":"Abandoned tab message","handle":"abandoned-tab-message","groups":["other"],"rawGroups":["other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Abandoned_Tab_Message.jpg?v=1771487834","price":9,"isPro":false,"link":"https://section.store/pages/abandoned-tab-message"},{"id":"product-image-banner","title":"Product image banner","handle":"product-image-banner","groups":["snippet"],"rawGroups":["snippet"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Product_Image_Banner.jpg?v=1771487882","price":14,"isPro":true,"link":"https://section.store/products/zesty-orange"},{"id":"header-19","title":"Header #19","handle":"header-19","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Header_from_Section_10107.jpg?v=1771487950","price":9,"isPro":false,"link":"https://section.store/pages/header-19"},{"id":"scrolling-images-8","title":"Scrolling Images #8","handle":"scrolling-images-8","groups":["scrolling","images"],"rawGroups":["scrolling","gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Scrolling_Images_8.jpg?v=1771488000","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-images-8"},{"id":"header-20","title":"Header #20","handle":"header-20","groups":["header"],"rawGroups":["header"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Header_20.jpg?v=1771488088","price":9,"isPro":false,"link":"https://section.store/pages/header-20"},{"id":"universal-template-1","title":"Universal template #1","handle":"universal-template-1","groups":["page-templates"],"rawGroups":["page templates"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Universal_Template.jpg?v=1782481615","price":9,"isPro":false,"link":"https://section.store/pages/universal-template-1"},{"id":"testimonial-50","title":"Testimonial #50","handle":"testimonial-50","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Testimonials_50.jpg?v=1782481771","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-50"},{"id":"comparison-table-28","title":"Comparison table #28","handle":"comparison-table-28","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Comparison_Table_10.jpg?v=1782481829","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-28"},{"id":"supplement-facts","title":"Supplement facts","handle":"supplement-facts","groups":["product-ingredients","features","text","other"],"rawGroups":["product-ingredients","features","text","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Supplement_Facts.jpg?v=1782481924","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-28"},{"id":"slideshow-pro","title":"Slideshow pro","handle":"slideshow-pro","groups":["slider","hero"],"rawGroups":["slideshow","hero","banner"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Slideshow_Pro.jpg?v=1782481994","price":14,"isPro":true,"link":"https://section.store/pages/comparison-table-28"},{"id":"modal-popup-4","title":"Modal popup #4","handle":"modal-popup-4","groups":["contact-form","other","scrolling"],"rawGroups":["contact form","other","scrolling"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Modal_Popup_4_1.jpg?v=1782482051","price":9,"isPro":false,"link":"https://section.store/pages/modal-popup-4"},{"id":"featured-collection-22","title":"Featured collection #22","handle":"featured-collection-22","groups":["collection","slider","featured-collection"],"rawGroups":["products","slider","featured-collection","collections"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Featured_Collection_22.jpg?v=1782482101","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-22"},{"id":"modal-popup-5","title":"Modal popup #5","handle":"modal-popup-5","groups":["contact-form","other"],"rawGroups":["contact form","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Modal_Popup_5_1.jpg?v=1782482161","price":9,"isPro":false,"link":"https://section.store/pages/modal-popup-5"},{"id":"comparison-table-30","title":"Comparison Table #30","handle":"comparison-table-30","groups":["comparison"],"rawGroups":["comparison"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Comparison_Table_11.jpg?v=1782482222","price":9,"isPro":false,"link":"https://section.store/pages/comparison-table-30"},{"id":"guarantees","title":"Guarantees","handle":"guarantees","groups":["features","other"],"rawGroups":["features","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Guarantees_from_Section_Factory.jpg?v=1782482238","price":9,"isPro":false,"link":"https://section.store/pages/guarantees"},{"id":"video-slider-6","title":"Video slider #6","handle":"video-slider-6","groups":["testimonial","video","slider"],"rawGroups":["testimonial","video","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Video_Slider_6_608716ea-f7f4-40d9-b5cf-212c8b283f8a.jpg?v=1782482304","price":9,"isPro":false,"link":"https://section.store/pages/video-slider-6"},{"id":"stats-3","title":"Stats #3","handle":"stats-3","groups":["features","image-with-text","text","other"],"rawGroups":["features","image with text","text","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/stats-3.jpg?v=1782482358","price":9,"isPro":false,"link":"https://section.store/pages/stats-3"},{"id":"collection-16","title":"Collection #16","handle":"collection-16","groups":["video","slider","images","collection"],"rawGroups":["video","slider","grid","collections"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Collection_16.jpg?v=1782482400","price":9,"isPro":false,"link":"https://section.store/pages/collection-16"},{"id":"testimonial-51","title":"Testimonial #51","handle":"testimonial-51","groups":["testimonial"],"rawGroups":["testimonial"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Testimonials_1_9fa4b454-5849-4ea2-88e0-d59f0e72ddf8.jpg?v=1782482482","price":9,"isPro":false,"link":"https://section.store/pages/testimonials-51"},{"id":"free-shipping-bar","title":"Free shipping bar","handle":"free-shipping-bar","groups":["snippet","page-templates"],"rawGroups":["snippet","product page"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Free_Shipping_Bar.jpg?v=1782482537","price":0,"isPro":false,"link":"https://section.store/products/mens-all-day-chambray-short-sleeve-plaid-button-down"},{"id":"hero-48","title":"Hero #48","handle":"hero-48","groups":["video","hero"],"rawGroups":["video","hero","banner"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Hero_Image_1_c5a3882d-18dd-4650-8ca8-e0cff36d3c7d.jpg?v=1782482581","price":9,"isPro":false,"link":"https://section.store/pages/hero-48"},{"id":"scrolling-text-11","title":"Scrolling text #11","handle":"scrolling-text-11","groups":["scrolling","text"],"rawGroups":["scrolling","text"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Scrolling_Text_11.jpg?v=1782482662","price":9,"isPro":false,"link":"https://section.store/pages/scrolling-text-11"},{"id":"stats-4","title":"Stats #4","handle":"stats-4","groups":["features","image-with-text","text","other"],"rawGroups":["features","image with text","text","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Section_Factory_Stats_4.jpg?v=1782482698","price":9,"isPro":false,"link":"https://section.store/pages/stats-4"},{"id":"featured-collection-tabs-7","title":"Featured collection (tabs) #7","handle":"featured-collection-tabs-7","groups":["collection","featured-collection","tabs"],"rawGroups":["products","featured collection","collections","tabs"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Featured_Collection_Tabs_3.jpg?v=1782482856","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-tabs-7"},{"id":"stats-5","title":"Stats #5","handle":"stats-5","groups":["features","text","other"],"rawGroups":["features","text","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/stats-5.jpg?v=1782482906","price":9,"isPro":false,"link":"https://section.store/pages/stats-5"},{"id":"gallery-10","title":"Gallery #10","handle":"gallery-10","groups":["images"],"rawGroups":["gallery","images"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Gallery_10.jpg?v=1782482937","price":9,"isPro":false,"link":"https://section.store/pages/gallery-10"},{"id":"home-template-1","title":"Home template #1","handle":"home-template-1","groups":["page-templates"],"rawGroups":["Page templates"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Page_Section_1.jpg?v=1782482995","price":9,"isPro":false,"link":"https://section.store/pages/page-section-1"},{"id":"modal-popup-6","title":"Modal popup #6","handle":"modal-popup-6","groups":["contact-form","other"],"rawGroups":["contact form","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Modal_Popup_6.jpg?v=1782483014","price":9,"isPro":false,"link":"https://section.store/pages/modal-popup-6"},{"id":"featured-collection-23","title":"Featured collection #23","handle":"featured-collection-23","groups":["collection","featured-collection"],"rawGroups":["products","featured collection"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Featured_Collection_2023.jpg?v=1782483120","price":9,"isPro":false,"link":"https://section.store/pages/featured-collection-23"},{"id":"stats-6","title":"Stats #6","handle":"stats-6","groups":["features","image-with-text","text","other"],"rawGroups":["features","image with text","text","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Section_Stats_6.jpg?v=1782483116","price":9,"isPro":false,"link":"https://section.store/pages/stats-6"},{"id":"video-banner-4","title":"Video banner #4","handle":"video-banner-4","groups":["hero","video"],"rawGroups":["hero","video","banner"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Video_Banner_4.jpg?v=1782483206","price":9,"isPro":false,"link":"https://section.store/pages/video-banner-4"},{"id":"hero-pro-2","title":"Hero pro #2","handle":"hero-pro-2","groups":["hero"],"rawGroups":["hero","banner"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Hero_Pro_2.0.jpg?v=1782483249","price":14,"isPro":true,"link":"https://section.store/pages/hero-pro-2"},{"id":"sticky-bar","title":"Sticky bar","handle":"sticky-bar","groups":["scrolling","header"],"rawGroups":["scrolling","announcement bar"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Sticky_Bar.jpg?v=1782483272","price":9,"isPro":false,"link":"https://section.store/pages/sticky-bar"},{"id":"beauty-template-1","title":"Beauty template #1","handle":"beauty-template-1","groups":["page-templates"],"rawGroups":["Page templates"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Beauty_Template.jpg?v=1782483356","price":9,"isPro":false,"link":"https://section.store/pages/page-template-2"},{"id":"sticky-countdown","title":"Sticky countdown","handle":"sticky-countdown","groups":["header","countdown-timer"],"rawGroups":["announcement bar","countdown timer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Sticky_Countdown.jpg?v=1782483404","price":9,"isPro":false,"link":"https://section.store/pages/ss-sticky-countdown-bar"},{"id":"wellness-template-1","title":"Wellness template #1","handle":"wellness-template-1","groups":["page-templates"],"rawGroups":["Page templates"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Wellness_Template.jpg?v=1782483459","price":9,"isPro":false,"link":"https://section.store/pages/page-template-3"},{"id":"video-slider-pro","title":"Video slider pro","handle":"video-slider-pro","groups":["testimonial","collection","video","slider"],"rawGroups":["testimonial","products","video","slider"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Video_Slider_Pro.jpg?v=1782483502","price":14,"isPro":true,"link":"https://section.store/pages/video-slider-pro"},{"id":"wellness-template-2","title":"Wellness template #2","handle":"wellness-template-2","groups":["page-templates"],"rawGroups":["Page templates"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Wellness_Template_1.jpg?v=1782483542","price":9,"isPro":false,"link":"https://section.store/pages/wellness-template-2"},{"id":"modal-popup-7","title":"Modal popup #7","handle":"modal-popup-7","groups":["contact-form","other"],"rawGroups":["contact form","other"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Modal_Popup_7.jpg?v=1782483576","price":9,"isPro":false,"link":"https://section.store/pages/modal-popup-7"},{"id":"sticky-countdown-pro","title":"Sticky countdown pro","handle":"sticky-countdown-pro","groups":["header","countdown-timer"],"rawGroups":["announcement bar","countdown timer"],"image":"https://cdn.shopify.com/s/files/1/0670/4834/1753/files/Sticky_Countdown_Pro.jpg?v=1782483643","price":14,"isPro":true,"link":"https://section.store/pages/sticky-countdown-timer-pro-%F0%9F%92%8E"}]');
const categoriesJson = [
  {
    handle: "popular",
    title: "Popular",
    sortOrder: 1,
    count: 20
  },
  {
    handle: "features",
    title: "Features",
    sortOrder: 2,
    count: 105
  },
  {
    handle: "hero",
    title: "Hero",
    sortOrder: 3,
    count: 86
  },
  {
    handle: "free",
    title: "Free",
    sortOrder: 4,
    count: 25
  },
  {
    handle: "testimonial",
    title: "Testimonial",
    sortOrder: 5,
    count: 89
  },
  {
    handle: "scrolling",
    title: "Scrolling",
    sortOrder: 6,
    count: 99
  },
  {
    handle: "video",
    title: "Video",
    sortOrder: 7,
    count: 120
  },
  {
    handle: "countdown-timer",
    title: "Countdown Timer",
    sortOrder: 8,
    count: 23
  },
  {
    handle: "images",
    title: "Images",
    sortOrder: 9,
    count: 141
  },
  {
    handle: "snippet",
    title: "Snippet",
    sortOrder: 10,
    count: 61
  },
  {
    handle: "text",
    title: "Text",
    sortOrder: 11,
    count: 55
  },
  {
    handle: "faq",
    title: "FAQ",
    sortOrder: 12,
    count: 32
  },
  {
    handle: "image-with-text",
    title: "Image with text",
    sortOrder: 12,
    count: 77
  },
  {
    handle: "slider",
    title: "Slider",
    sortOrder: 13,
    count: 90
  },
  {
    handle: "collection",
    title: "Collections",
    sortOrder: 14,
    count: 130
  },
  {
    handle: "upsell",
    title: "Upsell",
    sortOrder: 15,
    count: 17
  },
  {
    handle: "tabs",
    title: "Tabs",
    sortOrder: 16,
    count: 53
  },
  {
    handle: "comparison",
    title: "Comparison",
    sortOrder: 17,
    count: 49
  },
  {
    handle: "blog",
    title: "Blog",
    sortOrder: 18,
    count: 21
  },
  {
    handle: "hotspots",
    title: "Hotspots",
    sortOrder: 19,
    count: 15
  },
  {
    handle: "featured-collection",
    title: "Featured Collection",
    sortOrder: 20,
    count: 33
  },
  {
    handle: "before-after",
    title: "Before / After",
    sortOrder: 21,
    count: 16
  },
  {
    handle: "footer",
    title: "Footer",
    sortOrder: 22,
    count: 18
  },
  {
    handle: "header",
    title: "Header",
    sortOrder: 23,
    count: 49
  },
  {
    handle: "contact-form",
    title: "Contact form",
    sortOrder: 24,
    count: 16
  },
  {
    handle: "product-ingredients",
    title: "Product ingredients",
    sortOrder: 25,
    count: 43
  },
  {
    handle: "steps",
    title: "Steps",
    sortOrder: 26,
    count: 27
  },
  {
    handle: "shop-the-look",
    title: "Shop the look",
    sortOrder: 27,
    count: 7
  },
  {
    handle: "other",
    title: "Other",
    sortOrder: 28,
    count: 96
  },
  {
    handle: "page-templates",
    title: "Page templates",
    sortOrder: 29,
    count: 25
  },
  {
    handle: "other",
    title: "Other",
    sortOrder: 99,
    count: 96
  }
];
const sections = sectionsJson;
const categories = categoriesJson;
function getSection(handle) {
  const section = sections.find((s) => s.handle === handle);
  if (!section) return void 0;
  const liquidPath = resolve(process.cwd(), "app/sections", `${handle}.liquid`);
  try {
    const liquid = readFileSync(liquidPath, "utf-8");
    return { ...section, liquid };
  } catch {
    return {
      ...section,
      liquid: generateSectionLiquid(section.title, section.handle)
    };
  }
}
function getSectionsWithoutLiquid() {
  return sections.map(({ liquid: _liquid, ...s }) => s);
}
const loader$7 = async ({ request, params }) => {
  await authenticate.admin(request);
  const section = getSection(params.handle);
  if (!section) {
    throw new Response("Section not found", { status: 404 });
  }
  return json({ section });
};
const action$3 = async ({
  request,
  params
}) => {
  const { admin, session } = await authenticate.admin(request);
  const section = getSection(params.handle);
  if (!section || !session) {
    return { error: "Section or session not found" };
  }
  try {
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
              returnUrl: `${process.env.SHOPIFY_APP_URL}/app/explore/${section.handle}`
            }
          }
        );
      } catch (billingErr) {
        console.warn("Billing call skipped/failed:", billingErr);
      }
    }
    const dbSection = await prisma.section.upsert({
      where: { handle: section.handle },
      create: {
        handle: section.handle,
        title: section.title,
        price: amount,
        isPro: section.isPro,
        imageUrl: section.image,
        category: section.groups[0] || "other",
        groups: section.groups.join(",")
      },
      update: {}
    });
    await prisma.sectionPurchase.create({
      data: {
        shop: session.shop,
        sectionId: dbSection.id,
        amount,
        currency: "USD",
        status: "paid"
      }
    });
    const themesResponse = await admin.rest.get({
      path: "/themes.json"
    });
    const themes = await themesResponse.json();
    const activeTheme = themes.themes.find((t) => t.role === "main");
    if (activeTheme) {
      const liquid = section.liquid ?? generateSectionLiquid(section.title, section.handle);
      await admin.rest.put({
        path: `/themes/${activeTheme.id}/assets.json`,
        data: {
          asset: {
            key: `sections/${section.handle}.liquid`,
            value: liquid
          }
        }
      });
      await prisma.installedSection.upsert({
        where: {
          shop_sectionId: {
            shop: session.shop,
            sectionId: dbSection.id
          }
        },
        create: {
          shop: session.shop,
          sectionId: dbSection.id,
          themeId: activeTheme.id.toString()
        },
        update: {}
      });
    }
    return { success: true, themeId: activeTheme == null ? void 0 : activeTheme.id };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
};
function SectionDetail() {
  const { section } = useLoaderData();
  const actionData = useActionData();
  const [showPreview, setShowPreview] = useState(false);
  return /* @__PURE__ */ jsx(
    Page,
    {
      title: section.title,
      backAction: { content: "Explore", url: "/app/explore" },
      children: /* @__PURE__ */ jsxs(Layout, { children: [
        (actionData == null ? void 0 : actionData.success) && /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Banner, { tone: "success", title: "Section installed", children: /* @__PURE__ */ jsxs(Text, { as: "p", variant: "bodyMd", children: [
          section.title,
          " has been purchased and added to your active theme. Open the theme editor to place it on a page."
        ] }) }) }),
        (actionData == null ? void 0 : actionData.error) && /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Banner, { tone: "critical", title: "Installation failed", children: /* @__PURE__ */ jsx(Text, { as: "p", variant: "bodyMd", children: actionData.error }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: section.image,
              alt: section.title,
              style: {
                width: "100%",
                height: "360px",
                objectFit: "cover",
                borderRadius: "8px"
              }
            }
          ),
          section.isPro && /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: 16, right: 16 }, children: /* @__PURE__ */ jsx(Badge, { tone: "info", children: "Pro" }) })
        ] }) }) }),
        /* @__PURE__ */ jsx(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: section.price === 0 ? "Free" : `$${section.price}` }),
          /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "p", tone: "subdued", children: "One-time purchase. No recurring fees." }),
          /* @__PURE__ */ jsx(Form, { method: "post", children: /* @__PURE__ */ jsx(Button, { submit: true, primary: true, fullWidth: true, children: section.price === 0 ? "Add to theme" : "Buy & Install" }) }),
          /* @__PURE__ */ jsx(Button, { fullWidth: true, onClick: () => setShowPreview((p) => !p), children: showPreview ? "Hide preview" : "Live preview" })
        ] }) }) }),
        showPreview && /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Live preview" }),
          /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "p", tone: "subdued", children: "The live preview would open the section on the demo store. This is a placeholder until the storefront preview URL is wired up." })
        ] }) })
      ] })
    }
  );
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$3,
  default: SectionDetail,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
const loader$6 = async ({ request }) => {
  await authenticate.admin(request);
  return json({ sections: getSectionsWithoutLiquid(), categories });
};
const sortOptions = [
  { label: "Best selling", value: "best" },
  { label: "Newest", value: "newest" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" }
];
function ExploreSections() {
  const { sections: sections2, categories: categories2 } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("q") || "";
  const sortBy = searchParams.get("sort") || "best";
  const [bundle, setBundle] = useState([]);
  const filtered = useMemo(() => {
    let list = sections2.filter((s) => {
      const matchesCategory = activeCategory === "all" || s.groups.includes(activeCategory);
      const matchesSearch = !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.handle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    if (sortBy === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "newest") list = [...list].sort((a, b) => b.handle.localeCompare(a.handle));
    return list;
  }, [sections2, activeCategory, searchQuery, sortBy]);
  const tabs = [
    { id: "all", content: `All (${sections2.length})`, accessibilityLabel: "All" },
    ...categories2.map((c) => ({
      id: c.handle,
      content: `${c.title} (${c.count})`,
      accessibilityLabel: c.title
    }))
  ];
  const handleTabChange = (selectedTabIndex) => {
    const tab = tabs[selectedTabIndex];
    const next = new URLSearchParams(searchParams);
    next.set("category", tab.id);
    setSearchParams(next, { replace: true });
  };
  const updateSearch = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };
  const updateSort = (value) => {
    const next = new URLSearchParams(searchParams);
    next.set("sort", value);
    setSearchParams(next, { replace: true });
  };
  const activeTabIndex = tabs.findIndex((t) => t.id === activeCategory) ?? 0;
  const toggleBundle = (id) => {
    setBundle(
      (prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  return /* @__PURE__ */ jsx(Page, { title: "Explore Sections", children: /* @__PURE__ */ jsxs(Layout, { children: [
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs("div", { style: { display: "grid", gap: "1rem" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "1rem", alignItems: "center" }, children: [
        /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(
          TextField,
          {
            label: "Search sections",
            labelHidden: true,
            placeholder: "Search for sections",
            prefix: "🔍",
            value: searchQuery,
            onChange: updateSearch,
            autoComplete: "off"
          }
        ) }),
        /* @__PURE__ */ jsx("div", { style: { width: "200px" }, children: /* @__PURE__ */ jsx(
          Select,
          {
            label: "Sort",
            labelHidden: true,
            options: sortOptions,
            value: sortBy,
            onChange: updateSort
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx(
        Tabs,
        {
          tabs,
          selected: activeTabIndex,
          onSelect: handleTabChange,
          fitted: true
        }
      ),
      filtered.length === 0 ? /* @__PURE__ */ jsx(
        EmptyState,
        {
          heading: "No sections found",
          image: "https://cdn.shopify.com/s/files/1/0262/9627/4458/files/empty-state.svg",
          children: /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "p", children: "Try a different search or category." })
        }
      ) : /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1rem"
          },
          children: filtered.map((section) => /* @__PURE__ */ jsxs(Card, { padding: "0", children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                to: `/app/explore/${section.handle}`,
                style: { textDecoration: "none", color: "inherit" },
                children: [
                  /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
                    /* @__PURE__ */ jsx(
                      "img",
                      {
                        src: section.image,
                        alt: section.title,
                        style: {
                          width: "100%",
                          height: "180px",
                          objectFit: "cover",
                          borderRadius: "8px 8px 0 0"
                        }
                      }
                    ),
                    section.isPro && /* @__PURE__ */ jsx(
                      "div",
                      {
                        style: { position: "absolute", top: 8, right: 8 },
                        children: /* @__PURE__ */ jsx(Badge, { tone: "info", children: "Pro" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx("div", { style: { padding: "1rem" }, children: /* @__PURE__ */ jsx(Text, { variant: "headingSm", as: "h3", children: section.title }) })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  padding: "0 1rem 1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                },
                children: [
                  /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "p", fontWeight: "bold", children: section.price === 0 ? "Free" : `$${section.price}` }),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      size: "slim",
                      onClick: () => toggleBundle(section.handle),
                      variant: bundle.includes(section.handle) ? "primary" : "secondary",
                      children: bundle.includes(section.handle) ? "Added" : "+ Add to Bundle"
                    }
                  )
                ]
              }
            )
          ] }, section.handle))
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "My Store" }),
      /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "p", children: bundle.length === 0 ? "No sections added yet." : `${bundle.length} section${bundle.length === 1 ? "" : "s"} in bundle` }),
      bundle.length > 0 && /* @__PURE__ */ jsxs("div", { style: { marginTop: "1rem" }, children: [
        bundle.map((id) => {
          const item = sections2.find((s) => s.handle === id);
          return item ? /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                padding: "0.25rem 0"
              },
              children: [
                /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "span", children: item.title }),
                /* @__PURE__ */ jsxs(Text, { variant: "bodyMd", as: "span", fontWeight: "bold", children: [
                  "$",
                  item.price
                ] })
              ]
            },
            id
          ) : null;
        }),
        /* @__PURE__ */ jsx("div", { style: { marginTop: "1rem" }, children: /* @__PURE__ */ jsx(Button, { fullWidth: true, primary: true, children: "Checkout bundle" }) })
      ] })
    ] }) })
  ] }) });
}
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ExploreSections,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
const loader$5 = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const config = await getShopMetafield(
    admin,
    "section_factory_plus",
    "cart_drawer"
  );
  return {
    enabled: (config == null ? void 0 : config.enabled) ?? false,
    heading: (config == null ? void 0 : config.heading) ?? "Your cart",
    upsellText: (config == null ? void 0 : config.upsell_text) ?? "Add this recommended item."
  };
};
const action$2 = async ({ request }) => {
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
function CartDrawer() {
  const { enabled: initialEnabled, heading: initialHeading, upsellText: initialUpsell } = useLoaderData();
  const actionData = useActionData();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [heading, setHeading] = useState(initialHeading);
  const [upsellText, setUpsellText] = useState(initialUpsell);
  return /* @__PURE__ */ jsx(Page, { title: "Cart Drawer", children: /* @__PURE__ */ jsxs(Layout, { children: [
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Cart Drawer" }),
      /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "p", tone: "subdued", children: "Create a global cart drawer with order upsells, discount codes, reward bars and more." }),
      /* @__PURE__ */ jsx("div", { style: { marginTop: "1rem" }, children: /* @__PURE__ */ jsxs(ButtonGroup, { children: [
        /* @__PURE__ */ jsx(Button, { url: "/app/conversion-blocks", children: "Conversion Blocks" }),
        /* @__PURE__ */ jsx(Button, { url: "/app/bundles", children: "Bundles / Quantity Breaks" }),
        /* @__PURE__ */ jsx(Button, { primary: true, children: "Cart Drawer" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(Card, { children: [
      (actionData == null ? void 0 : actionData.success) && /* @__PURE__ */ jsx(Banner, { tone: "success", title: "Cart drawer settings saved" }),
      /* @__PURE__ */ jsx(Form, { method: "post", children: /* @__PURE__ */ jsxs("div", { style: { display: "grid", gap: "1rem" }, children: [
        /* @__PURE__ */ jsx(
          TextField,
          {
            label: "Drawer heading",
            name: "heading",
            value: heading,
            onChange: setHeading,
            autoComplete: "off"
          }
        ),
        /* @__PURE__ */ jsx(
          TextField,
          {
            label: "Upsell text",
            name: "upsellText",
            value: upsellText,
            onChange: setUpsellText,
            autoComplete: "off"
          }
        ),
        /* @__PURE__ */ jsx(
          Checkbox,
          {
            label: "Enable cart drawer on all pages",
            name: "enabled",
            checked: enabled,
            onChange: setEnabled,
            value: "on"
          }
        ),
        /* @__PURE__ */ jsx(Button, { submit: true, primary: true, children: "Save cart drawer" })
      ] }) })
    ] }) })
  ] }) });
}
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: CartDrawer,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
const loader$4 = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  let settings = await prisma.shopSettings.findUnique({
    where: { shop: session.shop }
  });
  if (!settings) {
    settings = await prisma.shopSettings.create({
      data: { shop: session.shop }
    });
  }
  return {
    plusEnabled: settings.plusEnabled,
    supportEmail: "help@example.com"
  };
};
const action$1 = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const plusEnabled = form.get("plusEnabled") === "on";
  await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    create: { shop: session.shop, plusEnabled },
    update: { plusEnabled }
  });
  return { success: true, plusEnabled };
};
function Settings() {
  const { plusEnabled: initialPlus, supportEmail: initialEmail } = useLoaderData();
  const actionData = useActionData();
  const [plusEnabled, setPlusEnabled] = useState(initialPlus);
  const [supportEmail, setSupportEmail] = useState(initialEmail);
  return /* @__PURE__ */ jsx(Page, { title: "Settings", children: /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Store Settings" }),
    (actionData == null ? void 0 : actionData.success) && /* @__PURE__ */ jsx(Banner, { tone: "success", title: "Settings saved" }),
    /* @__PURE__ */ jsxs(Form, { method: "post", children: [
      /* @__PURE__ */ jsx("div", { style: { marginTop: "1rem" }, children: /* @__PURE__ */ jsx(
        TextField,
        {
          label: "Support email",
          name: "supportEmail",
          value: supportEmail,
          onChange: setSupportEmail,
          autoComplete: "email"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { style: { marginTop: "1rem" }, children: /* @__PURE__ */ jsx(
        Checkbox,
        {
          label: "Enable Section Store Plus features (cart drawer, bundles, conversion blocks)",
          name: "plusEnabled",
          checked: plusEnabled,
          onChange: setPlusEnabled,
          value: "on"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { style: { marginTop: "1rem" }, children: /* @__PURE__ */ jsx(Button, { submit: true, primary: true, children: "Save settings" }) })
    ] })
  ] }) }) }) });
}
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: Settings,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
const loader$3 = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const config = await getShopMetafield(
    admin,
    "section_factory_plus",
    "bundles"
  );
  return {
    enabled: (config == null ? void 0 : config.enabled) ?? false,
    tiers: (config == null ? void 0 : config.tiers) ?? [
      { quantity: 2, discount: 10 },
      { quantity: 3, discount: 15 }
    ]
  };
};
const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const form = await request.formData();
  const enabled = form.get("enabled") === "on";
  const tier1Qty = Number(form.get("tier1Qty") || 2);
  const tier1Discount = Number(form.get("tier1Discount") || 10);
  const tier2Qty = Number(form.get("tier2Qty") || 3);
  const tier2Discount = Number(form.get("tier2Discount") || 15);
  const tiers = [
    { quantity: tier1Qty, discount: tier1Discount },
    { quantity: tier2Qty, discount: tier2Discount }
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
function BundlesAndQuantityBreaks() {
  const { enabled: initialEnabled, tiers: initialTiers } = useLoaderData();
  const actionData = useActionData();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [tier1Qty, setTier1Qty] = useState(String(initialTiers[0].quantity));
  const [tier1Discount, setTier1Discount] = useState(
    String(initialTiers[0].discount)
  );
  const [tier2Qty, setTier2Qty] = useState(String(initialTiers[1].quantity));
  const [tier2Discount, setTier2Discount] = useState(
    String(initialTiers[1].discount)
  );
  return /* @__PURE__ */ jsx(Page, { title: "Bundles / Quantity Breaks", children: /* @__PURE__ */ jsxs(Layout, { children: [
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Bundles / Quantity Breaks" }),
      /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "p", tone: "subdued", children: "Create volume discounts and bundle offers to increase your average order value." }),
      /* @__PURE__ */ jsx("div", { style: { marginTop: "1rem" }, children: /* @__PURE__ */ jsxs(ButtonGroup, { children: [
        /* @__PURE__ */ jsx(Button, { url: "/app/conversion-blocks", children: "Conversion Blocks" }),
        /* @__PURE__ */ jsx(Button, { primary: true, children: "Bundles / Quantity Breaks" }),
        /* @__PURE__ */ jsx(Button, { url: "/app/cart-drawer", children: "Cart Drawer" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(Card, { children: [
      (actionData == null ? void 0 : actionData.success) && /* @__PURE__ */ jsx(Banner, { tone: "success", title: "Bundle settings saved" }),
      /* @__PURE__ */ jsx(Form, { method: "post", children: /* @__PURE__ */ jsxs("div", { style: { display: "grid", gap: "1rem" }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "1rem" }, children: [
          /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(
            TextField,
            {
              label: "Tier 1 quantity",
              name: "tier1Qty",
              value: tier1Qty,
              onChange: setTier1Qty,
              autoComplete: "off",
              type: "number"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(
            TextField,
            {
              label: "Tier 1 discount %",
              name: "tier1Discount",
              value: tier1Discount,
              onChange: setTier1Discount,
              autoComplete: "off",
              type: "number"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "1rem" }, children: [
          /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(
            TextField,
            {
              label: "Tier 2 quantity",
              name: "tier2Qty",
              value: tier2Qty,
              onChange: setTier2Qty,
              autoComplete: "off",
              type: "number"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsx(
            TextField,
            {
              label: "Tier 2 discount %",
              name: "tier2Discount",
              value: tier2Discount,
              onChange: setTier2Discount,
              autoComplete: "off",
              type: "number"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx(
          Checkbox,
          {
            label: "Enable bundles / quantity breaks on product pages",
            name: "enabled",
            checked: enabled,
            onChange: setEnabled,
            value: "on"
          }
        ),
        /* @__PURE__ */ jsx(Button, { submit: true, primary: true, children: "Save bundle settings" })
      ] }) })
    ] }) })
  ] }) });
}
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: BundlesAndQuantityBreaks,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const loader$2 = async ({ request }) => {
  await authenticate.admin(request);
  return redirect("/app/explore");
};
const route13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$2
}, Symbol.toStringTag, { value: "Module" }));
const loader$1 = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
const bundleTiers = [
  { count: 3, discount: 10 },
  { count: 5, discount: 15 },
  { count: 10, discount: 25 }
];
function BundleAndSave() {
  return /* @__PURE__ */ jsx(Page, { title: "Bundle & Save", children: /* @__PURE__ */ jsxs(Layout, { children: [
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Build Your Custom Bundle" }),
      /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "p", tone: "subdued", children: "Purchase multiple sections together at a discounted price." })
    ] }) }),
    /* @__PURE__ */ jsx(Layout.Section, { variant: "oneThird", children: /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Bundle Discounts" }),
      /* @__PURE__ */ jsx("div", { style: { display: "grid", gap: "0.5rem", marginTop: "1rem" }, children: bundleTiers.map((tier) => /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.75rem",
            border: "1px solid #e3e3e3",
            borderRadius: "8px"
          },
          children: [
            /* @__PURE__ */ jsxs(Text, { variant: "bodyMd", as: "span", children: [
              "Add ",
              tier.count,
              " sections"
            ] }),
            /* @__PURE__ */ jsxs(Badge, { tone: "success", children: [
              "Save ",
              tier.discount,
              "%"
            ] })
          ]
        },
        tier.count
      )) })
    ] }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsx(
      EmptyState,
      {
        heading: "Your bundle is empty",
        image: "https://cdn.shopify.com/s/files/1/0262/9627/4458/files/empty-state.svg",
        action: { content: "Explore Sections", url: "/app/explore" },
        children: /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "p", children: "Add sections from the catalog to unlock discounts." })
      }
    ) })
  ] }) });
}
const route14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: BundleAndSave,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
const faqs = [
  {
    q: "Can I try the section first?",
    a: "Yes, many sections are free or have live demo stores you can preview before purchasing."
  },
  {
    q: "Can I use Section Store with any Shopify theme?",
    a: "Yes. Sections are added directly to your theme and edited with Shopify's native theme editor."
  },
  {
    q: "Do I need to know how to code?",
    a: "No coding is required. Browse, purchase and add sections in a few clicks."
  },
  {
    q: "Will adding sections slow down my website?",
    a: "Our sections are built to be lightweight and fast, replacing bloated third-party apps."
  },
  {
    q: "What happens if I don't like a section I added?",
    a: "You can remove the section from your theme at any time. Purchases are one-time charges."
  },
  {
    q: "Can I get a refund?",
    a: "Refunds are handled on a case-by-case basis. Contact support with your purchase details."
  },
  {
    q: "The section I added shows on all pages?",
    a: "You can control section visibility using Shopify's theme editor templates and visibility settings."
  },
  {
    q: "I can't add sections into my product page?",
    a: "Product page support depends on your theme. Use the theme editor or contact support for help."
  },
  {
    q: "Can you help me customise the sections?",
    a: "Yes — reach out to support for customisation help or check the setup guides."
  }
];
function HelpAndResources() {
  return /* @__PURE__ */ jsx(Page, { title: "Help & Resources", children: /* @__PURE__ */ jsxs(Layout, { children: [
    /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Frequently asked questions" }),
      /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "p", tone: "subdued", children: "Still have questions? Reach out to our support at help@example.com." })
    ] }) }),
    /* @__PURE__ */ jsx(Layout.Section, { children: faqs.map((faq, index) => /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(Text, { variant: "headingSm", as: "h3", children: faq.q }),
      /* @__PURE__ */ jsx(Text, { variant: "bodyMd", as: "p", tone: "subdued", children: faq.a })
    ] }, index)) })
  ] }) });
}
const route15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: HelpAndResources,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-DA910jug.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-DUp91Uk2.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-qoLyrn9W.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-DUp91Uk2.js"], "css": [] }, "routes/webhooks.app.scopes_update": { "id": "routes/webhooks.app.scopes_update", "parentId": "root", "path": "webhooks/app/scopes_update", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.scopes_update-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/webhooks.app.uninstalled": { "id": "routes/webhooks.app.uninstalled", "parentId": "root", "path": "webhooks/app/uninstalled", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks.app.uninstalled-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-C6d-v1ok.js", "imports": [], "css": [] }, "routes/auth.$": { "id": "routes/auth.$", "parentId": "root", "path": "auth/*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth._-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/health": { "id": "routes/health", "parentId": "root", "path": "health", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/health-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/app": { "id": "routes/app", "parentId": "root", "path": "app", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/app-BL8m7GDD.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-DUp91Uk2.js", "/assets/context-COik2VfW.js", "/assets/context-Dqc0DVKX.js"], "css": [] }, "routes/app.conversion-blocks": { "id": "routes/app.conversion-blocks", "parentId": "routes/app", "path": "conversion-blocks", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.conversion-blocks-C0FNgmhx.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-DUp91Uk2.js", "/assets/Page-CpLxfhV7.js", "/assets/Banner-BNcS6qZV.js", "/assets/Select-GiB873p6.js", "/assets/Checkbox-B-LhmOnx.js", "/assets/context-COik2VfW.js", "/assets/XIcon.svg-DU7TFdkq.js"], "css": [] }, "routes/app.explore.$handle": { "id": "routes/app.explore.$handle", "parentId": "routes/app", "path": "explore/:handle", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.explore._handle-D4cKvsaG.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-DUp91Uk2.js", "/assets/Page-CpLxfhV7.js", "/assets/Banner-BNcS6qZV.js", "/assets/context-COik2VfW.js", "/assets/XIcon.svg-DU7TFdkq.js"], "css": [] }, "routes/app.explore._index": { "id": "routes/app.explore._index", "parentId": "routes/app", "path": "explore", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.explore._index-b3FCircT.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-DUp91Uk2.js", "/assets/Page-CpLxfhV7.js", "/assets/Select-GiB873p6.js", "/assets/context-COik2VfW.js", "/assets/context-Dqc0DVKX.js", "/assets/XIcon.svg-DU7TFdkq.js", "/assets/EmptyState-C7CAvQ-Z.js"], "css": [] }, "routes/app.cart-drawer": { "id": "routes/app.cart-drawer", "parentId": "routes/app", "path": "cart-drawer", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.cart-drawer-Q33Jk7uL.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-DUp91Uk2.js", "/assets/Page-CpLxfhV7.js", "/assets/Banner-BNcS6qZV.js", "/assets/Checkbox-B-LhmOnx.js", "/assets/context-COik2VfW.js", "/assets/XIcon.svg-DU7TFdkq.js"], "css": [] }, "routes/app.settings": { "id": "routes/app.settings", "parentId": "routes/app", "path": "settings", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.settings-DLsuaZmg.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-DUp91Uk2.js", "/assets/Page-CpLxfhV7.js", "/assets/Banner-BNcS6qZV.js", "/assets/Checkbox-B-LhmOnx.js", "/assets/context-COik2VfW.js", "/assets/XIcon.svg-DU7TFdkq.js"], "css": [] }, "routes/app.bundles": { "id": "routes/app.bundles", "parentId": "routes/app", "path": "bundles", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.bundles-CRsWkVT8.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/components-DUp91Uk2.js", "/assets/Page-CpLxfhV7.js", "/assets/Banner-BNcS6qZV.js", "/assets/Checkbox-B-LhmOnx.js", "/assets/context-COik2VfW.js", "/assets/XIcon.svg-DU7TFdkq.js"], "css": [] }, "routes/app._index": { "id": "routes/app._index", "parentId": "routes/app", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app._index-l0sNRNKZ.js", "imports": [], "css": [] }, "routes/app.bundle": { "id": "routes/app.bundle", "parentId": "routes/app", "path": "bundle", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.bundle-C5qpv9Pi.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/Page-CpLxfhV7.js", "/assets/EmptyState-C7CAvQ-Z.js", "/assets/context-COik2VfW.js"], "css": [] }, "routes/app.help": { "id": "routes/app.help", "parentId": "routes/app", "path": "help", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.help-Dnw6_jf-.js", "imports": ["/assets/index-OtPSfN_w.js", "/assets/Page-CpLxfhV7.js", "/assets/context-COik2VfW.js"], "css": [] } }, "url": "/assets/manifest-61e30d78.js", "version": "61e30d78" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": true, "v3_singleFetch": false, "v3_lazyRouteDiscovery": true, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/webhooks.app.scopes_update": {
    id: "routes/webhooks.app.scopes_update",
    parentId: "root",
    path: "webhooks/app/scopes_update",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/webhooks.app.uninstalled": {
    id: "routes/webhooks.app.uninstalled",
    parentId: "root",
    path: "webhooks/app/uninstalled",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route3
  },
  "routes/auth.$": {
    id: "routes/auth.$",
    parentId: "root",
    path: "auth/*",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/health": {
    id: "routes/health",
    parentId: "root",
    path: "health",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/app": {
    id: "routes/app",
    parentId: "root",
    path: "app",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/app.conversion-blocks": {
    id: "routes/app.conversion-blocks",
    parentId: "routes/app",
    path: "conversion-blocks",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/app.explore.$handle": {
    id: "routes/app.explore.$handle",
    parentId: "routes/app",
    path: "explore/:handle",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/app.explore._index": {
    id: "routes/app.explore._index",
    parentId: "routes/app",
    path: "explore",
    index: true,
    caseSensitive: void 0,
    module: route9
  },
  "routes/app.cart-drawer": {
    id: "routes/app.cart-drawer",
    parentId: "routes/app",
    path: "cart-drawer",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/app.settings": {
    id: "routes/app.settings",
    parentId: "routes/app",
    path: "settings",
    index: void 0,
    caseSensitive: void 0,
    module: route11
  },
  "routes/app.bundles": {
    id: "routes/app.bundles",
    parentId: "routes/app",
    path: "bundles",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "routes/app",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route13
  },
  "routes/app.bundle": {
    id: "routes/app.bundle",
    parentId: "routes/app",
    path: "bundle",
    index: void 0,
    caseSensitive: void 0,
    module: route14
  },
  "routes/app.help": {
    id: "routes/app.help",
    parentId: "routes/app",
    path: "help",
    index: void 0,
    caseSensitive: void 0,
    module: route15
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
