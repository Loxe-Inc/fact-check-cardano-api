import { gql } from "apollo-server";
/* eslint-disable */
export default gql`
  type Mutation {
    Login(email: String!, password: String!): UserLogin!
    CreateUser(email: String!, password: String!, name: String!): UserLogin!
    RefreshToken(refresh_token: String!): UserLogin!
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

  type User {
    id: ID! @id
    name: String!
    password: String!
      @auth(
        rules: [
          { operations: [READ], where: { id: "$jwt.id" } },
        ]
      )
    email: String! @unique
    roles: [String!]!
    createdDocuments: [Document!]!
      @relationship(type: "CREATED_BY", direction: OUT)
  }
`;
