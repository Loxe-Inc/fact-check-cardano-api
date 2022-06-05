import { gql } from "apollo-server";

export default gql`
  type Org
    @auth(rules: [{ operations: [CREATE, UPDATE, DELETE], roles: ["admin"] }]) {
    id: ID! @id
    name: String!
    emailEndings: [String!]!
    users: [User!]! @relationship(type: "MEMBER_OF", direction: IN)
  }
  input CreateOrgInputM {
    name: String!
    emailEndings: [String!]!
  }
  type Mutation {
    CreateOrg(inputs: [CreateOrgInputM]!): Org!
      @auth(rules: [{ roles: ["owner"] }])
      @cypher(
        statement: """
        UNWIND $inputs AS input
        MERGE (o: Org {name: input.name, emailEndings: input.emailEndings})
        ON CREATE SET o+={id:apoc.create.uuid()}
        RETURN o
        """
      )
  }
`;
