import { Neo4jGraphQL } from "@neo4j/graphql";
import { driver, auth } from "neo4j-driver";
import { ApolloServer } from "apollo-server";
import { resolvers } from "gql/resolvers";
import typeDefs from "gql/typeDefs";
import { Neo4jGraphQLAuthJWTPlugin } from "@neo4j/graphql-plugin-auth";
const { RSA_KEY_B64 } = process.env;
const neoDriver = driver(
  process.env.NEO4J_URI || "",
  auth.basic("neo4j", process.env.NEO4J_PASSWORD || "")
);

const neoSchema = new Neo4jGraphQL({
  typeDefs,
  resolvers,
  driver: neoDriver,
  plugins: {
    auth: new Neo4jGraphQLAuthJWTPlugin({
      secret: RSA_KEY_B64
        ? Buffer.from(RSA_KEY_B64, "base64").toString("ascii")
        : "super-secret",
    }),
  },
});

(async function main() {
  const schema = await neoSchema.getSchema();

  const server = new ApolloServer({
    schema,
    context: ({ req }) => ({ req }),
  });

  await server.listen(4000);

  console.log("Online");
})();
