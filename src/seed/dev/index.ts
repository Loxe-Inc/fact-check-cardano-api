import CreateOrg from "./CreateOrg";
import { driver, auth } from "neo4j-driver";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import fetch from "cross-fetch";
import { DateTime } from "luxon";
import * as dotenv from "dotenv";
import CreateUser from "./CreateUser";
import LoginUser from "./LoginUser";
import UpdateUserAsInfoCreator from "./UpdateUserAsInfoCreator";
import CreateCategory from "./CreateCategory";
import CreateTopic from "./CreateTopic";
import CreateDocument from "./CreateDocument";
dotenv.config();

const {
  GRAPHQL_SERVER_HOST: host = "localhost",
  GRAPHQL_SERVER_PORT: port = "4000",
  GRAPHQL_SERVER_PATH: path = "/graphql",
  GRAPHQL_SERVER_PROT: protocol = "http",
} = process.env;

const uri = `${protocol}://${host}:${port}${path}`;

const client = new ApolloClient({
  link: new HttpLink({ uri, fetch }),
  cache: new InMemoryCache(),
});

const neoDriver = driver(
  "bolt://localhost:7687",
  auth.basic("neo4j", process.env.NEO4J_PASSWORD || "thyraedwards")
);

(async () => {
  try {
    const orgId = await CreateOrg(neoDriver, "Loxe Inc.", ["loxeinc.com"]);
    const { id } = await CreateUser(
      client,
      "darya.leylian@loxeinc.com",
      "somelongpassword",
      "Darya"
    );
    await UpdateUserAsInfoCreator(neoDriver, id);
    const { access_token } = await LoginUser(
      client,
      "darya.leylian@loxeinc.com",
      "somelongpassword"
    );
    client.setLink(
      new HttpLink({
        uri,
        fetch,
        headers: { Authorization: `Bearer ${access_token}` },
      })
    );
    const catIds = await CreateCategory(client, access_token, [
      {
        createdBy: id,
        name: "blockchain",
        topics: [],
      },
    ]);
    console.log(catIds);
    const topicIds = await CreateTopic(client, access_token, [
      {
        createdBy: id,
        name: "topicOne",
        category: { connect: { where: { node: { id: catIds[0] } } } },
        documents: [],
      },
    ]);
    console.log(topicIds);
    const docsIds = await CreateDocument(client, access_token, [
      {
        title: "First Document",
        text: "First document text",
        url: "https://hello.com",
        topics: ["topicOne"],
      },
    ]);
  } catch (err) {
    console.error(err);
  }
})();
