import { gql } from "apollo-server";

export default gql`
  type Document
    @auth(
      rules: [
        { operations: [READ], roles: ["info_reader"] }
        {
          operations: [CREATE, UPDATE]
          roles: ["info_creator"]
          bind: { creator: { id: "$jwt.sub" } }
        }
        { operations: [CREATE, UPDATE, DELETE], roles: ["admin"] }
      ]
    ) {
    id: ID! @id
    text: String!
    url: String!
    topic: Topic!
    verified: Boolean!
      @auth(rules: [{ operations: [CREATE, UPDATE, DELETE], roles: ["admin"] }])
    deleted: Boolean!
      @auth(rules: [{ operations: [CREATE, UPDATE, DELETE], roles: ["admin"] }])
    createdOn: DateTime!
    updatedOn: DateTime!
  }
`;
