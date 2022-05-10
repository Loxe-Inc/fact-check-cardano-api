import { Driver } from "neo4j-driver-core";

export default async function CreateOrg(
  driver: Driver,
  name = "Loxe Inc.",
  emailEndings = ["loxeinc.com"]
): Promise<string> {
  const session = driver.session();
  const createOrg = `
    MERGE (o:Org {name:$name}) 
    ON CREATE SET o.id=apoc.create.uuid(), o.emailEndings=$emailEndings
    RETURN o
    `;
  const result = await session.run(createOrg, { name, emailEndings });
  if (result.records?.length) {
    return result.records[0].get("o").properties.id;
  } else {
    throw new Error("Could not create org");
  }
}
