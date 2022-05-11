import { Context } from "@neo4j/graphql/dist/types";
import { DateTime } from "neo4j-driver";
import * as yup from "yup";
import { ForbiddenError } from "apollo-server";
interface DocumentCreateInput {
  title: string;
  text: string;
  url: string;
  topics: string[];
}

interface DocumentCreateInputs {
  inputs: DocumentCreateInput[];
}

const DocumentCreateInputsSchema = yup.object({
  inputs: yup
    .array(
      yup
        .object({
          text: yup.string().required(),
          url: yup.string().url().required(),
          topics: yup.array(yup.string().required()).required(),
          title: yup.string().required(),
        })
        .required()
    )
    .required(),
});

export default async function CreateDocuments(
  _s: undefined,
  args: DocumentCreateInputs,
  context: Context
): Promise<
  {
    id: string;
    title: string;
    text: string;
    url: string;
    createdOn: DateTime;
    updatedOn: DateTime;
  }[]
> {
  try {
    const { inputs } = await DocumentCreateInputsSchema.validate(args);
    if (
      !context.auth?.isAuthenticated ||
      !context.auth.roles.includes("info_creator")
    ) {
      throw new ForbiddenError("Must be info creator to create documents");
    }
    const createDocumentCypher = `
        MATCH (u:User {email: $sub})
        WITH u, datetime() as dt
        UNWIND $inputs AS input
        MERGE (d: Document {title: input.title, text: input.text, url: input.url, createdOn: dt, updateOn: dt, verified: FALSE, deleted: FALSE})<-[:CREATED_BY]-(u)
        ON CREATE SET d.id=apoc.create.uuid()
        WITH d,input UNWIND input.topics as topic
        WITH d,topic 
        MERGE (nt: Topic {name: topic})
        ON CREATE SET nt.id=apoc.create.uuid()
        MERGE (nt)-[:EXEMPLIFIES]->(d) 
        RETURN d
      `;
    const { driver } = context;
    const session = driver.session();
    const result = await session.run(createDocumentCypher, {
      inputs,
      sub: context.auth.jwt?.sub,
    });
    if (result?.records?.length) {
      const docsToReturn = result.records
        .map((doc) => {
          const properties = doc?.get("d")?.properties;
          return properties;
        })
        .filter((e) => e);
      console.log(docsToReturn[0].title);
      return docsToReturn;
    }
    throw new Error("No document created");
  } catch (err) {
    console.error(err);
    throw err;
  }
}
