import { gql } from "apollo-server";

export default gql`
  type Topic
    @auth(
      rules: [
        { roles: ["admin"] }
        { roles: ["owner"] }
        { operations: [CREATE, CONNECT], roles: ["info_creator"] }
      ]
    ) {
    id: ID! @id
    createdBy: User! @relationship(type: "TOPIC_CREATED_BY", direction: IN)
    managedBy: Org! @relationship(type: "MANAGED_BY", direction: IN)
    name: String!
      @unique
      @auth(
        rules: [
          { roles: ["admin"] }
          { roles: ["owner"] }
          {
            operations: [UPDATE]
            roles: ["info_creator"]
            allow: { managedBy: { id: "$jwt.org" } }
          }
        ]
      )
    category: Category! @relationship(type: "CATEGORIZES", direction: OUT)
    documents: [Document!]! @relationship(type: "EXEMPLIFIES", direction: IN)
  }
  input TopicCreateInputM {
    name: String!
    category: ID!
  }
  type Mutation {
    CreateTopic(inputs: [TopicCreateInputM!]!): [Topic!]!
      @cypher(
        statement: """
        MATCH (u:User {id: $auth.jwt.id})
        UNWIND $inputs AS input
        MATCH (c:Category {id: input.category})
        MERGE (c)<-[:CATEGORIZES]-(t: Topic {name: input.name})<-[:TOPIC_CREATED_BY]-(u)
        ON CREATE SET t+={id:apoc.create.uuid()}
        RETURN t
        """
      )
  }
`;
