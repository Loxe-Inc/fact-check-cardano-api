import { DateTime, Driver } from "neo4j-driver";
import * as yup from "yup";

interface DocumentInput {
  title: string;
  text: string;
  url: string;
  topic: string;
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
          topic: yup.string().required(),
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
    id: string;
  }[]
> {
  try {
    const { inputs } = await DocumentInputsSchema.validate(args);
    const createDocumentCypher = `
        UNWIND $inputs AS input
        MATCH (d: Document {id: input.id})
        SET d.updatedOn = DateTime(), d.title = input.title, d.text = input.text, d.url = input.url
        RETURN d AS doc
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
    throw new Error("Couldn't update document");
  } catch (err) {
    console.error(err);
    throw err;
  }
}
