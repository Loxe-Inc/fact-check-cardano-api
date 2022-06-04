import { Driver } from "neo4j-driver-core";

export default async function UpdateUserAsInfoCreator(
  driver: Driver,
  id: string
) {
  const session = driver.session();
  const updateCypher = `
    MATCH (u:User {id:$id}) SET u.roles=["info_reader", "info_creator"]
  `;
  await session.run(updateCypher, { id });
}
