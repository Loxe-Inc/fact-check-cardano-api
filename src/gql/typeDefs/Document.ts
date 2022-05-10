import { gql } from "apollo-server";

export default gql`
  input DocumentCreateInput {
    title: String!
    text: String!
    url: String!
    topic: [String!]!
  }

  input DocumentUpdateInput {
    title: String!
    text: String!
    url: String!
    id: String
  }

  type Mutation {
    CreateDocuments(inputs: [DocumentCreateInput!]!): [Document!]!
    UpdateDocuments(inputs: [DocumentUpdateInput!]!): [Document!]!
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
          allow: { createdBy: "$jwt.id" }
        }
      ]
    ) {
    id: ID! @id
    title: String!
    text: String!
    url: String!
    topic: Topic! @relationship(type: "EXEMPLIFIES", direction: IN)
    verified: Boolean!
      @auth(rules: [{ operations: [CREATE, UPDATE, DELETE], roles: ["admin"] }])
    deleted: Boolean!
      @auth(rules: [{ operations: [CREATE, UPDATE, DELETE], roles: ["admin"] }])
    createdOn: DateTime!
    updatedOn: DateTime!
    createdBy: User! @relationship(type: "CREATED_BY", direction: IN)
  }
`;
