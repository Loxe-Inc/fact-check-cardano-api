import { Context } from "@neo4j/graphql/dist/types";
import { ForbiddenError } from "apollo-server";
import { DateTime, Driver } from "neo4j-driver";
import * as yup from "yup";

interface DocumentInput {
  title: string;
  text: string;
  url: string;
  id: string;
}

interface DocumentInputs {
  inputs: DocumentInput[];
}

const DocumentInputsSchema = yup.object({
  inputs: yup
    .array(
      yup
        .object({
          text: yup.string().required(),
          url: yup.string().url().required(),
          title: yup.string().required(),
          id: yup.string().required(),
        })
        .required()
    )
    .required(),
});

export default async function UpdateDocuments(
  _s: undefined,
  args: DocumentInputs,
  context: Context
): Promise<
  {
    title: string;
    text: string;
    url: string;
    createdOn: DateTime;
    updatedOn: DateTime;
    id: string;
  }[]
> {
  try {
    if (
      !context.auth?.isAuthenticated ||
      !context.auth.roles.includes("info_creator")
    ) {
      throw new ForbiddenError("Must be info creator to create documents");
    }

    const { inputs } = await DocumentInputsSchema.validate(args);
    const createDocumentCypher = `
        UNWIND $inputs AS input
        MATCH (d: Document {id: input.id})<-[:CREATED_BY]-(u:User {email: $sub})
        SET d.updatedOn = DateTime(), d.title = input.title, d.text = input.text, d.url = input.url
        RETURN d AS doc
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
          const properties = doc?.get("doc")?.properties;
          return properties;
        })
        .filter((e) => e);
      console.log(docsToReturn);
      return docsToReturn;
    }
    throw new Error("Couldn't update document");
  } catch (err) {
    console.error(err);
    throw err;
  }
}
