import { gql } from "apollo-server";

export default gql`
  type Org {
    id: ID! @id
    name: String!
  }
`;
