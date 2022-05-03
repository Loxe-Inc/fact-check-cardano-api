import { gql } from "apollo-server";

export default gql`
  type User {
    id: ID! @id
    name: String!
    password: String!
    admin: boolean!
  }
`;
