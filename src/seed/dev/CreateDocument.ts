import { gql, ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { DateTime } from "luxon";

const CREATE_DOCUMENT = gql`
  mutation CreateDocument($input: [DocumentCreateInputM!]!) {
    CreateDocuments(input: $input) {
      id
    }
  }
`;

export default async function CreateDocument(
  client: ApolloClient<NormalizedCacheObject>,
  access_token: string,
  input: {
    title: string;
    text: string;
    topics: string[];
    url: string;
  }[]
): Promise<string[]> {
  console.log(access_token);
  const { data } = await client.mutate({
    mutation: CREATE_DOCUMENT,
    variables: { input },
  });
  console.log(data);
  return data.CreateDocuments.map((c: { id: string }) => c.id);
}
