import { gql } from "apollo-server";
import { DateTime } from "luxon";

export default gql`
  input DocumentCreateInputM {
    title: String!
    text: String!
    url: String
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
      @cypher(
        statement: """
        MATCH (u:User {id: $auth.jwt.id})
        UNWIND $inputs AS input
        MERGE (d: Document {title: input.title})<-[:CREATED_BY]-(u)
        ON CREATE SET d+={id:apoc.create.uuid(), createdOn:datetime(), updatedOn:datetime(), text: input.text, url: input.url, verified: FALSE, deleted: FALSE}
        WITH d,input UNWIND input.topics as topic
        WITH d,topic MERGE (nt: Topic {name: topic})
        ON CREATE SET nt.id=apoc.create.uuid()
        WITH d,nt MERGE (nt)<-[:EXEMPLIFIES]-(d)
        RETURN d
        """
      )
    UpdateDocuments(inputs: [DocumentUpdateInputM!]!): [Document!]!
      @cypher(
        statement: """
        UNWIND $inputs AS input
        MATCH (d: Document {id: input.id})<-[:CREATED_BY]-(u:User {id: $auth.jwt.id})
        SET d += {title:$title, text:$text, url:$url, updatedOn:datetime()}
        RETURN d
        """
      )
    VerifyDocuments(inputs: [ID!]!): [Document!]!
      @cypher(
        statement: """
        UNWIND $inputs AS input
        MATCH (d: Document {id: input})-[:EXEMPLIFIES]->(t:Topic)-[:MANAGED_BY]->(o:Org)<-[:MEMBER_OF]-(u:User {id: $auth.jwt.id})

        RETURN d
        """
      )
  }

  type Document
    @auth(
      rules: [
        { roles: ["admin"] }
        { roles: ["owner"] }
        { operations: [READ], allowUnauthenticated: true }
        { operations: [CREATE, CONNECT], roles: ["info_creator"] }
        {
          operations: [UPDATE]
          roles: ["info_creator"]
          allow: { createdBy: { id: "$jwt.id" } }
        }
      ]
    ) {
    id: ID! @id
    title: String! @unique
    text: String!
    url: String @unique
    topics: [Topic!]! @relationship(type: "EXEMPLIFIES", direction: OUT)
    verified: Boolean!
      @default(value: false)
      @auth(rules: [{ operations: [CREATE, UPDATE, DELETE], roles: ["admin"] }])
    deleted: Boolean!
      @default(value: false)
      @auth(rules: [{ operations: [CREATE, UPDATE, DELETE], roles: ["admin"] }])
    createdOn: DateTime!
    updatedOn: DateTime!
    createdBy: User! @relationship(type: "CREATED_BY", direction: IN)
  }
`;
