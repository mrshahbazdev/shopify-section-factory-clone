import type { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  TextField,
  Button,
  Checkbox,
} from "@shopify/polaris";
import { useState } from "react";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return { plusEnabled: false, supportEmail: "help@example.com" };
};

export default function Settings() {
  const { plusEnabled: initialPlus, supportEmail: initialEmail } =
    useLoaderData<typeof loader>();
  const [plusEnabled, setPlusEnabled] = useState(initialPlus);
  const [supportEmail, setSupportEmail] = useState(initialEmail);

  return (
    <Page title="Settings">
      <Layout>
        <Layout.Section>
          <Card>
            <Text variant="headingMd" as="h2">
              Store Settings
            </Text>
            <Form method="post">
              <div style={{ marginTop: "1rem" }}>
                <TextField
                  label="Support email"
                  value={supportEmail}
                  onChange={setSupportEmail}
                  autoComplete="email"
                />
              </div>
              <div style={{ marginTop: "1rem" }}>
                <Checkbox
                  label="Enable Section Store Plus features (cart drawer, bundles, conversion blocks)"
                  checked={plusEnabled}
                  onChange={setPlusEnabled}
                />
              </div>
              <div style={{ marginTop: "1rem" }}>
                <Button submit primary>
                  Save settings
                </Button>
              </div>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
