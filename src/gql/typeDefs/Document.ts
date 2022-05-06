import { gql } from "apollo-server";

export default gql`
  input DocumentInput {
    title: String!
    text: String!
    url: String!
    topic: String
    id: String
  }

  type Mutation {
    CreateDocuments(inputs: [DocumentInput!]!): [Document!]!
    UpdateDocuments(inputs: [DocumentInput!]!): [Document!]!
  }

  type Document
    @auth(
      rules: [
        {
          operations: [READ]
          roles: ["info_reader"]
          where: {
            OR: [{ createdBy: { email: "$jwt.sub" } }, { verified: true }]
          }
        }
        {
          operations: [CREATE, UPDATE]
          roles: ["info_creator"]
          where: { createdBy: { email: "$jwt.sub" } }
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
    createdBy: User! @relationship(type: "CREATED_BY", direction: IN)
  }
`;
