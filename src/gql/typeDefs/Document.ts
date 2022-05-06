import { gql } from "apollo-server";

export default gql`
  input DocumentInput {
    title: String!
    text: String!
    url: String!
    topic: String!
    id: String
  }

  type Mutation {
    CreateDocuments(inputs: [DocumentInput!]!): [Document!]!
    UpdateDocuments(inputs: [DocumentInput!]!): [Document!]!
  }

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
    title: String!
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
