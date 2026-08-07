import type { AdminApiContext } from "@shopify/shopify-app-remix/server";

export async function getShopGid(admin: AdminApiContext): Promise<string> {
  const response = await admin.graphql(
    `
    query getShop {
      shop {
        id
      }
    }
  `
  );
  const data = (await response.json()) as { data: { shop: { id: string } } };
  return data.data.shop.id;
}

export async function setShopMetafield(
  admin: AdminApiContext,
  namespace: string,
  key: string,
  value: unknown,
  type = "json"
) {
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
            type,
          },
        ],
      },
    }
  );
  const result = (await response.json()) as {
    data: { metafieldsSet: { metafields: { id: string }[]; userErrors: { field: string; message: string }[] } };
  };
  if (result.data.metafieldsSet.userErrors.length > 0) {
    throw new Error(result.data.metafieldsSet.userErrors[0].message);
  }
  return result.data.metafieldsSet.metafields;
}

export async function getShopMetafield(
  admin: AdminApiContext,
  namespace: string,
  key: string
): Promise<unknown | null> {
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
      variables: { ownerId, namespace, key },
    }
  );
  const result = (await response.json()) as {
    data: { metafield: { value: string; type: string } | null };
  };
  if (!result.data.metafield) return null;
  if (result.data.metafield.type === "json") {
    return JSON.parse(result.data.metafield.value);
  }
  return result.data.metafield.value;
}
