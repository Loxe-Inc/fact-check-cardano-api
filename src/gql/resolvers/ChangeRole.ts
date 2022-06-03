import { Context } from "@neo4j/graphql/dist/types";
import { DateTime } from "neo4j-driver";
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

export default async function CreateDocuments(
  _s: undefined,
  args: ChangeRoleInputs,
  context: Context
): Promise<
  {
    id: string;
    roles: string[];
  }[]
> {
  try {
    const { inputs } = await ChangeRoleInputsSchema.validate(args);
    if (
      !context.auth?.isAuthenticated ||
      !context.auth.roles.includes("admin")
    ) {
      throw new ForbiddenError("Must be at least admin to user ChangeRole");
    }
    for (input) 
  } catch (err) {
    console.error(err);
    throw err;
  }
}
