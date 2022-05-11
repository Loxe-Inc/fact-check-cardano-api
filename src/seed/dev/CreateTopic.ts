import { gql, ApolloClient, NormalizedCacheObject } from "@apollo/client";

const CREATE_TOPIC = gql`
  mutation CreateTopic($input: [TopicCreateInput!]!) {
    createTopics(input: $input) {
      topics {
        id
      }
    }
  }
`;

export default async function CreateTopic(
  client: ApolloClient<NormalizedCacheObject>,
  access_token: string,
  input: {
    createdBy: string;
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category: any;
    documents: string[];
  }[]
): Promise<string[]> {
  console.log(access_token);
  const { data } = await client.mutate({
    mutation: CREATE_TOPIC,
    variables: { input },
  });
  console.log(data);
  return data.createTopics.topics.map((t: { id: string }) => t.id);
}
