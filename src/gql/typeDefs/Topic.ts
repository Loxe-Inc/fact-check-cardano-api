import { gql } from "apollo-server";

export default gql`
  type Topic {
    id: ID! @id
    name: String!
    category: String!
    subCategory: String!
  }
`;
