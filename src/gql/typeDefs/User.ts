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

  type User @auth(rules: [{ operations: [CONNECT], roles: ["info_creator"] }]) {
    id: ID! @id
    name: String!
    password: String!
      @auth(
        rules: [
          { roles: ["admin"] }
          { roles: ["owner"] }
          { allow: { id: "$jwt.id" } }
        ]
      )
    email: String! @unique
    roles: [String!]! @auth(rules: [{ roles: ["admin"] }, { roles: ["owner"] }])
    createdDocuments: [Document!]!
      @relationship(type: "CREATED_BY", direction: OUT)
    organization: Org! @relationship(type: "MEMBER_OF", direction: OUT)
  }
`;
