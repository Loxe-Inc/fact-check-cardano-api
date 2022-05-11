import { gql } from "apollo-server";

export default gql`
  type Topic
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
    category: Category! @relationship(type: "CATEGORIZES", direction: IN)
    documents: [Document!]! @relationship(type: "EXEMPLIFIES", direction: OUT)
  }
`;
