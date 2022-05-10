import { gql, ApolloClient, NormalizedCacheObject } from "@apollo/client";

const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    Login(email: $email, password: $password) {
      id
      tokenSet {
        access_token
      }
    }
  }
`;

export default async function LoginUser(
  client: ApolloClient<NormalizedCacheObject>,
  email: string,
  password: string
): Promise<{ access_token: string; id: string }> {
  const { data } = await client.mutate({
    mutation: LOGIN_USER,
    variables: { email, password },
  });
  console.log(data);
  return {
    access_token: data.Login.tokenSet.access_token,
    id: data.Login.id,
  };
}
