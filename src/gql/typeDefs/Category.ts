import { gql } from "apollo-server";

export default gql`
  type Category
    @auth(
      rules: [
        { roles: ["admin"] }
        { roles: ["owner"] }
        { operations: [CREATE, CONNECT], roles: ["info_creator"] }
        {
          operations: [UPDATE]
          roles: ["info_creator"]
          allow: { createdBy: "$jwt.id" }
        }
      ]
    ) {
    createdBy: String!
    id: ID! @id
    name: String! @unique
    topics: [Topic!]! @relationship(type: "CATEGORIZES", direction: OUT)
  }
`;
