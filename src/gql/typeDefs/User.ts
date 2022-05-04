import { gql } from "apollo-server";

export default gql`
  type Mutation {
    Login(email: String!, password: String!): UserLogin!
    CreateUser(email: String!, password: String!, name: String!): UserLogin!
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
    email: String! @unique
    roles: [String!]!
  }
`;
