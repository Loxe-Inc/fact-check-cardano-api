import { Neo4jGraphQL } from "@neo4j/graphql";
import { driver, auth } from "neo4j-driver";
import { ApolloServer } from "apollo-server";
import { resolvers } from "gql/resolvers";
import typeDefs from "gql/typeDefs";
import { Neo4jGraphQLAuthJWTPlugin } from "@neo4j/graphql-plugin-auth";
import { ApolloServerPluginSchemaReporting, ApolloServerPluginLandingPageGraphQLPlayground, PluginDefinition } from "apollo-server-core";
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
      rolesPath: "https://loxeinc\\.com/claims.https://loxeinc\\.com/roles",
      noVerify: false,
    }),

  },
  config: {
    enableDebug: true,
  },
});

(async function main() {
  const schema = await neoSchema.getSchema();
  await neoSchema.assertIndexesAndConstraints({ options: { create: true } });
  const plugins: PluginDefinition[] = [ApolloServerPluginSchemaReporting()]
  if (process.env.NODE_ENV === "development") {
    plugins.push(ApolloServerPluginLandingPageGraphQLPlayground());
  }
  const server = new ApolloServer({
    schema,
    context: ({ req }) => ({ req }),
    debug: true,
    apollo: {
      graphRef: "fact-check-api@current",
    },
    plugins,
  });

  await server.listen(4000);

  console.log("Online");
})();
