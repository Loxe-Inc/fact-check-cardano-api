import { ApolloError, UserInputError, ForbiddenError } from "apollo-server";
import { Driver } from "neo4j-driver";
import * as yup from "yup";
import { generateJWTFromRT } from "utils/token";
import { LoginState, UserNotFoundError, UserNotVerifiedError } from "types";

interface UserRefreshTokenArgs {
  refresh_token: string;
}

const LoginSchema = yup.object({
  refresh_token: yup.string().required("refresh_token:Required field"),
});

export default async function RefreshToken(
  _s: undefined,
  args: UserRefreshTokenArgs,
  context: {
    driver: Driver;
  }
): Promise<LoginState> {
  const { driver } = context;
  const errors: Record<string, string[]> = {};
  try {
    const { refresh_token } = await LoginSchema.validate(args, {
      abortEarly: false,
    });
    return await generateJWTFromRT(refresh_token, driver);
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      for (const innerErr of err.inner) {
        const [key, message] = innerErr.message.split(":", 2);
        if (!(key in errors)) {
          errors[key] = [];
        }
        errors[key].push(message);
      }
      throw new UserInputError(JSON.stringify(errors));
    } else if (
      err instanceof UserNotVerifiedError ||
      err instanceof UserNotFoundError
    ) {
      const [key, message] = err.message.split(":", 2);
      errors[key] = [message];
      console.error(err);
      throw new ForbiddenError(JSON.stringify(errors));
    }
    throw new ApolloError(
      "Something unexpected happened, try again later",
      "INTERNAL_SERVER_ERROR"
    );
  }
}
