import { DateTime, Driver } from "neo4j-driver";
import * as yup from "yup";

interface DocumentInput {
  title: string;
  text: string;
  url: string;
  topic: string;
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
          topic: yup.string().required(),
          title: yup.string().required(),
        })
        .required()
    )
    .required(),
});

export default async function CreateDocuments(
  _s: undefined,
  args: DocumentInputs,
  context: {
    driver: Driver;
  }
): Promise<
  {
    title: string;
    text: string;
    url: string;
    createdOn: DateTime;
    updatedOn: DateTime;
  }[]
> {
  try {
    const { inputs } = await DocumentInputsSchema.validate(args);
    const createDocumentCypher = `
        UNWIND $inputs AS input
        OPTIONAL MATCH (t: Topic {name: input.topic})
        WITH t, input CALL apoc.do.when(
          t IS NULL, 'CREATE (nt: Topic {name: topic, id: apoc.create.uuid()})<-[:EXEMPLIFIES]-(d: Docuemnt {title: title, text: text, url: url, id: apoc.create.uuid(), createdOn: DateTime(), updateOn: DateTime(), verified: FALSE, deleted: FALSE}) RETURN d AS node', 
          'CREATE (t)<-[:EXEMPLIFIES]-(d: Docuemnt {title: title, text: text, url: url, id: apoc.create.uuid(), createdOn: DateTime(), updateOn: DateTime(), verified: FALSE, deleted: FALSE}) RETURN d AS node',
          {topic: input.topic, title: input.title, text: input.text, url: input.url}
        ) YIELD value 
        RETURN value.node AS doc
      `;
    const { driver } = context;
    const session = driver.session();
    const result = await session.run(createDocumentCypher, { inputs });
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
    throw new Error("No document created");
  } catch (err) {
    console.error(err);
    throw err;
  }
}
