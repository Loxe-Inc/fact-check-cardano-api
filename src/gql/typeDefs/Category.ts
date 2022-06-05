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
          allow: { createdBy: { id: "$jwt.id" } }
        }
      ]
    ) {
    id: ID! @id
    name: String!
    createdBy: User! @relationship(type: "CAT_CREATED_BY", direction: IN)
    topics: [Topic!]! @relationship(type: "CATEGORIZES", direction: IN)
  }

  input CategoryCreateInputM {
    name: String!
  }

  type Mutation {
    CreateCategory(inputs: [CategoryCreateInputM!]!): [Category!]!
      @cypher(
        statement: """
        MATCH (u:User {id: $auth.jwt.id})
        UNWIND $inputs AS input
        MERGE (c: Category {name: input.name})<-[:CAT_CREATED_BY]-(u)
        ON CREATE SET c+={id:apoc.create.uuid()}
        RETURN c
        """
      )
      @auth(rules: [{ roles: ["info_creator"] }])
  }
`;
