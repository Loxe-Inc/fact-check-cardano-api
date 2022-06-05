import { gql } from "apollo-server";
export default gql`
  type ChangeRoleResponse {
    id: ID!
    email: String!
    roles: [String!]!
  }
  input ChangeRoleInput {
    email: String!
    role: String!
  }
  type Mutation {
    Login(email: String!, password: String!): UserLogin!
    CreateUser(email: String!, password: String!, name: String!): UserLogin!
    RefreshToken(refresh_token: String!): UserLogin!
    ChangeRole(inputs: [ChangeRoleInput!]!): [ChangeRoleResponse!]!
    AddUserToOrg(email: String!, orgId: ID!): User!
      @cypher(
        statement: """
        MATCH (u:User {email: $email})
        MATCH (o:Org {id: $orgId})<-[:MEMBER_OF]-(a:User {id: $auth.jwt.id})
        MERGE (u)-[:MEMBER_OF {}]->(o)
        RETURN u
        """
      )
      @auth(rules: [{ roles: ["admin"] }])
    RemoveUserFromOrg(email: String!, orgId: ID!): User!
      @cypher(
        statement: """
        MATCH (u:User {email: $email})-[r:MEMBER_OF]->(o:Org {id: $orgId})<-[:MEMBER_OF]-(a:User {id: $auth.jwt.id})
        DELETE r
        RETURN u
        """
      )
      @auth(rules: [{ roles: ["admin"] }])
  }
  type TokenSet {
    access_token: String!
    refresh_token: String!
    access_token_exp: String!
    refresh_token_exp: String!
  }

  type UserLogin {
    id: String!
    email: String!
    roles: [String!]!
    tokenSet: TokenSet!
    name: String!
  }

  type User
    @auth(
      rules: [
        { operations: [CONNECT], roles: ["info_creator"] }
        { operations: [READ], allowUnauthenticated: true }
      ]
    ) { # owners, admin, have info_creator
    id: ID! @id
    name: String!
    password: String!
      @auth(
        rules: [
          { operations: [UPDATE], roles: ["admin"] } # owners have admin role
          { operations: [READ], allow: { id: "$jwt.id" } }
        ]
      )
    email: String!
      @unique
      @auth(rules: [{ operations: [READ], isAuthenticated: true }])
    roles: [String!]! @auth(rules: [{ roles: ["admin"] }, { roles: ["owner"] }])
    createdDocuments: [Document!]!
      @relationship(type: "CREATED_BY", direction: OUT)
    org: Org @relationship(type: "MEMBER_OF", direction: OUT)
  }
`;
