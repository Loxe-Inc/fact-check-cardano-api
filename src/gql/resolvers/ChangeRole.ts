import { Context } from "@neo4j/graphql/dist/types";
import { DateTime, session } from "neo4j-driver";
import * as yup from "yup";
import { ForbiddenError } from "apollo-server";
interface ChangeRoleInput {
  email: string;
  role: string;
}

interface ChangeRoleInputs {
  inputs: ChangeRoleInput[];
}

const ChangeRoleInputsSchema = yup.object({
  inputs: yup
    .array(
      yup
        .object({
          email: yup.string().email().required(),
          role: yup
            .string()
            .oneOf(["info_reader", "info_creator", "admin", "owner"])
            .required(),
        })
        .required()
    )
    .required(),
});
interface ChangeRoleResponse {
  id: string;
  email: string;
  roles: string[];
}

const roles = ["info_reader", "info_creator", "admin", "owner"];
export default async function ChangeRole(
  _s: undefined,
  args: ChangeRoleInputs,
  context: Context
): Promise<ChangeRoleResponse[]> {
  try {
    const { driver } = context;
    const session = driver.session();
    const { inputs } = await ChangeRoleInputsSchema.validate(args);
    if (
      !context.auth?.isAuthenticated ||
      !context.auth.roles.includes("admin")
    ) {
      throw new ForbiddenError("Must be at least admin to use ChangeRole");
    }
    const completed: ChangeRoleResponse[] = [];
    for (const input of inputs) {
      if (
        (context.auth.roles.includes("owner") &&
          ["admin", "info_creator", "info_reader"].includes(input.role)) ||
        (context.auth.roles.includes("admin") &&
          ["info_creator", "info_reader"].includes(input.role))
      ) {
        const rolesToAdd = roles.slice(0, roles.indexOf(input.role) + 1);
        const changeRole = `
        MATCH (u:User {email: $email})
        SET u.roles = $rolesToAdd
        RETURN u
        `;
        const result = await session.run(changeRole, {
          rolesToAdd,
          email: input.email,
        });
        if (result.records.length) {
          const record = result.records[0];
          const user = record.get("u")?.properties;
          if (user) {
            completed.push({
              id: user.id,
              email: user.email,
              roles: user.roles,
            });
          }
        }
      }
    }
    return completed;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
