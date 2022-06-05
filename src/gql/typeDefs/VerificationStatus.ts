import { gql } from "apollo-server";

export default gql`
  enum EnumVerificationStatus {
    PENDING
    VERIFIED
    REJECTED
  }

  type VerificationStatus
    @auth(
      rules: [
        { operations: [READ, CONNECT, CREATE, UPDATE], roles: ["owner"] }
        { operations: [READ, CONNECT], roles: ["admin"] }
        { operations: [READ], roles: ["info_reader"] }
      ]
    ) {
    id: ID! @id
    status: EnumVerificationStatus!
    documents: [Document!]!
      @relationship(
        type: "HAS_VERIFICATION_STATUS"
        properties: HAS_VERIFICATION_STATUS
        direction: IN
      )
  }

  interface HAS_VERIFICATION_STATUS {
    by: String! # User.id
    org: String! # Org.id
    at: DateTime!
  }

  type Mutation {
    CreateVerificationStatus(
      status: EnumVerificationStatus!
    ): VerificationStatus!
      @cypher(
        statement: """
        MATCH (u:User {id: $jwt.id})
        MERGE (s: VerificationStatus {status: $status})
        ON CREATE SET s.id=apoc.create.uuid()
        RETURN s
        """
      )
      @auth(rules: [{ roles: ["owner"] }])
  }
`;
