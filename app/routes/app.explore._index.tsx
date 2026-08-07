import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams, Link } from "@remix-run/react";
import { useState, useMemo } from "react";
import {
  Page,
  Layout,
  TextField,
  Select,
  Card,
  Button,
  Badge,
  Tabs,
  Text,
  EmptyState,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import sections from "../data/sections.json";
import categories from "../data/categories.json";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return { sections, categories };
};

const sortOptions = [
  { label: "Best selling", value: "best" },
  { label: "Newest", value: "newest" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
];

export default function ExploreSections() {
  const { sections, categories } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("q") || "";
  const sortBy = searchParams.get("sort") || "best";

  const [bundle, setBundle] = useState<string[]>([]);

  const filtered = useMemo(() => {
    let list = sections.filter((s) => {
      const matchesCategory =
        activeCategory === "all" || s.groups.includes(activeCategory);
      const matchesSearch =
        !searchQuery ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.handle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    if (sortBy === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === "newest") list = [...list].sort((a, b) => b.handle.localeCompare(a.handle));

    return list;
  }, [sections, activeCategory, searchQuery, sortBy]);

  const tabs = [
    { id: "all", content: `All (${sections.length})`, accessibilityLabel: "All" },
    ...categories.map((c) => ({
      id: c.handle,
      content: `${c.title} (${c.count})`,
      accessibilityLabel: c.title,
    })),
  ];

  const handleTabChange = (selectedTabIndex: number) => {
    const tab = tabs[selectedTabIndex];
    const next = new URLSearchParams(searchParams);
    next.set("category", tab.id);
    setSearchParams(next, { replace: true });
  };

  const updateSearch = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  const updateSort = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("sort", value);
    setSearchParams(next, { replace: true });
  };

  const activeTabIndex = tabs.findIndex((t) => t.id === activeCategory) ?? 0;

  const toggleBundle = (id: string) => {
    setBundle((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <Page title="Explore Sections">
      <Layout>
        <Layout.Section>
          <div style={{ display: "grid", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <TextField
                  label="Search sections"
                  labelHidden
                  placeholder="Search for sections"
                  prefix="🔍"
                  value={searchQuery}
                  onChange={updateSearch}
                  autoComplete="off"
                />
              </div>
              <div style={{ width: "200px" }}>
                <Select
                  label="Sort"
                  labelHidden
                  options={sortOptions}
                  value={sortBy}
                  onChange={updateSort}
                />
              </div>
            </div>

            <Tabs
              tabs={tabs}
              selected={activeTabIndex}
              onSelect={handleTabChange}
              fitted
            />

            {filtered.length === 0 ? (
              <EmptyState
                heading="No sections found"
                image="https://cdn.shopify.com/s/files/1/0262/9627/4458/files/empty-state.svg"
              >
                <Text variant="bodyMd" as="p">
                  Try a different search or category.
                </Text>
              </EmptyState>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "1rem",
                }}
              >
                {filtered.map((section) => (
                  <Card key={section.handle} padding="0">
                    <Link
                      to={`/app/explore/${section.handle}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div style={{ position: "relative" }}>
                        <img
                          src={section.image}
                          alt={section.title}
                          style={{
                            width: "100%",
                            height: "180px",
                            objectFit: "cover",
                            borderRadius: "8px 8px 0 0",
                          }}
                        />
                        {section.isPro && (
                          <div
                            style={{ position: "absolute", top: 8, right: 8 }}
                          >
                            <Badge tone="info">Pro</Badge>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "1rem" }}>
                        <Text variant="headingSm" as="h3">
                          {section.title}
                        </Text>
                      </div>
                    </Link>
                    <div
                      style={{
                        padding: "0 1rem 1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text variant="headingMd" as="p" fontWeight="bold">
                        {section.price === 0 ? "Free" : `$${section.price}`}
                      </Text>
                      <Button
                        size="slim"
                        onClick={() => toggleBundle(section.handle)}
                        variant={
                          bundle.includes(section.handle)
                            ? "primary"
                            : "secondary"
                        }
                      >
                        {bundle.includes(section.handle)
                          ? "Added"
                          : "+ Add to Bundle"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <Text variant="headingMd" as="h2">
              My Store
            </Text>
            <Text variant="bodyMd" as="p">
              {bundle.length === 0
                ? "No sections added yet."
                : `${bundle.length} section${bundle.length === 1 ? "" : "s"} in bundle`}
            </Text>
            {bundle.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                {bundle.map((id) => {
                  const item = sections.find((s) => s.handle === id);
                  return item ? (
                    <div
                      key={id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.25rem 0",
                      }}
                    >
                      <Text variant="bodyMd" as="span">
                        {item.title}
                      </Text>
                      <Text variant="bodyMd" as="span" fontWeight="bold">
                        ${item.price}
                      </Text>
                    </div>
                  ) : null;
                })}
                <div style={{ marginTop: "1rem" }}>
                  <Button fullWidth primary>
                    Checkout bundle
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
