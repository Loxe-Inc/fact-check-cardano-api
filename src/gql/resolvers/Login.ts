import { ApolloError, UserInputError, ForbiddenError } from "apollo-server";
import { Driver } from "neo4j-driver";
import {
  LoginState,
  UserNotFoundError,
  UserNotVerifiedError,
  UserProperties,
} from "types";
import * as yup from "yup";
import argon2 from "argon2";
import { generateJWT } from "utils/token";

interface UserLoginArgs {
  email: string;
  pasword: string;
}

const LoginSchema = yup.object({
  email: yup
    .string()
    .lowercase()
    .email("email:Must be email")
    .required("email:Required field"),
  password: yup
    .string()
    .min(12, "password:Must be 12+ characters")
    .required("password:Required field"),
});

export default async function Login(
  _s: undefined,
  args: UserLoginArgs,
  context: {
    driver: Driver;
  }
): Promise<LoginState> {
  const { driver } = context;
  const session = driver.session();
  try {
    const { email: userEmail, password } = await LoginSchema.validate(args, {
      abortEarly: false,
    });
    const check = `MATCH (u:User {email:$email}) RETURN u`;
    const checkResult = await session.run(check, { email: userEmail });
    if (checkResult.records.length) {
      // user exists
      const user = checkResult.records[0].get("u");
      const userProperties = user.properties as UserProperties;
      if (!userProperties.password) {
        throw new UserNotVerifiedError(
          `toast:${userEmail} is not verified yet. Please check your email.`
        );
      }
      if (await argon2.verify(userProperties.password, password)) {
        const { name, id, roles, email } = userProperties;
        const jwtSet = generateJWT(userProperties);
        const userResponse: LoginState = {
          id,
          email,
          roles,
          name,
          tokenSet: jwtSet,
        };
        return userResponse;
      }
      throw new UserNotFoundError(
        `toast:Username password combination does not exist`
      );
    } else {
      // user doe not exist
      throw new UserNotFoundError("toast:User not found");
    }
  } catch (err) {
    const errors: Record<string, string[]> = {};
    if (err instanceof yup.ValidationError) {
      for (const innerErr of err.inner) {
        const [key, message] = innerErr.message.split(":", 2);
        if (key in errors) {
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
