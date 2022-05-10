import { gql, ApolloClient, NormalizedCacheObject } from "@apollo/client";

const CREATE_USER = gql`
  mutation CreateUser($email: String!, $password: String!, $name: String!) {
    CreateUser(email: $email, password: $password, name: $name) {
      id
      tokenSet {
        access_token
      }
    }
  }
`;

export default async function CreateUser(
  client: ApolloClient<NormalizedCacheObject>,
  email: string,
  password: string,
  name: string
): Promise<{ access_token: string; id: string }> {
  const { data } = await client.mutate({
    mutation: CREATE_USER,
    variables: { email, password, name },
  });
  console.log(data);
  return {
    access_token: data.CreateUser.tokenSet.access_token,
    id: data.CreateUser.id,
  };
}
