import { gql, ApolloClient, NormalizedCacheObject } from "@apollo/client";

const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: [CategoryCreateInput!]!) {
    createCategories(input: $input) {
      categories {
        id
      }
    }
  }
`;

export default async function CreateCategory(
  client: ApolloClient<NormalizedCacheObject>,
  access_token: string,
  input: { createdBy: string; name: string; topics: string[] }[]
): Promise<string[]> {
  console.log(access_token);
  const { data } = await client.mutate({
    mutation: CREATE_CATEGORY,
    variables: { input },
  });
  console.log(data);
  return data.createCategories.categories.map((c: { id: string }) => c.id);
}
