import { gql } from "apollo-server";

export default gql`
  type Org
    @auth(rules: [{ operations: [CREATE, UPDATE, DELETE], roles: ["admin"] }]) {
    id: ID! @id
    name: String!
    emailEndings: [String!]!
    users: [String!]! @relationship(type: "BELONGS_TO", direction: IN)
  }
`;
