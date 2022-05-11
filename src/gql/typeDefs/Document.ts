import { gql } from "apollo-server";
import { DateTime } from "luxon";

export default gql`
  input DocumentCreateInputM {
    title: String!
    text: String!
    url: String!
    topics: [String!]!
  }

  input DocumentUpdateInputM {
    title: String!
    text: String!
    url: String!
    id: String
  }

  type Mutation {
    CreateDocuments(inputs: [DocumentCreateInputM!]!): [Document!]!
    UpdateDocuments(inputs: [DocumentUpdateInputM!]!): [Document!]!
  }

  type Document
    @auth(
      rules: [
        { roles: ["admin"] }
        { roles: ["owner"] }
        { operations: [READ], roles: ["info_reader"] }
        { operations: [CREATE, CONNECT], roles: ["info_creator"] }
        {
          operations: [UPDATE]
          roles: ["info_creator"]
          allow: { createdBy: { id: "$jwt.id" } }
        }
      ]
    ) {
    id: ID! @id
    title: String!
    text: String!
    url: String!
    topics: [Topic!]! @relationship(type: "EXEMPLIFIES", direction: IN)
    verified: Boolean!
      @default(value: false)
      @auth(rules: [{ operations: [CREATE, UPDATE, DELETE], roles: ["admin"] }])
    deleted: Boolean!
      @default(value: false)
      @auth(rules: [{ operations: [CREATE, UPDATE, DELETE], roles: ["admin"] }])
    createdOn: DateTime! @default(value: 0)
    updatedOn: DateTime! @default(value: 0)
    createdBy: User! @relationship(type: "CREATED_BY", direction: IN)
  }
`;
