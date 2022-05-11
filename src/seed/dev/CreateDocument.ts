import { gql, ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { DateTime } from "luxon";

const CREATE_DOCUMENT = gql`
  mutation CreateDocument($input: [DocumentCreateInput!]!) {
    createDocuments(input: $input) {
      documents {
        id
      }
    }
  }
`;

export default async function CreateDocument(
  client: ApolloClient<NormalizedCacheObject>,
  access_token: string,
  input: {
    createdBy: string;
    title: string;
    text: string;
    topic: string[];
    url: string;
    createdOn: DateTime;
    updatedOn: DateTime;
  }[]
): Promise<string[]> {
  console.log(access_token);
  const { data } = await client.mutate({
    mutation: CREATE_DOCUMENT,
    variables: { input },
  });
  console.log(data);
  return data.createDocuments.documents.map((c: { id: string }) => c.id);
}
