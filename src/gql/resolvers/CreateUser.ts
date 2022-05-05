import { ApolloError, UserInputError, ForbiddenError } from "apollo-server";
import { Driver } from "neo4j-driver";
import {
  LoginState,
  UserAlreadyExists,
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
  name: string;
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
  name: yup.string().required(),
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
    const {
      email: userEmail,
      password,
      name,
    } = await LoginSchema.validate(args, {
      abortEarly: false,
    });
    const check = `MATCH (u:User {email:$email}) RETURN u`;
    const checkResult = await session.run(check, { email: userEmail });
    if (checkResult.records.length) {
      // user exists
      throw new UserAlreadyExists("User already exists");
    } else {
      const passwordHash = await argon2.hash(password);
      const roles = ["info_reader"];
      const emailEnding = userEmail.split("@")[1];
      console.log(userEmail, password, roles, typeof name, emailEnding);
      const create = ` 
        OPTIONAL MATCH (o:Org) WHERE any(ending IN o.emailEndings WHERE ending = $emailEnding)
        WITH o CALL apoc.do.when(
          o IS NOT NULL,
          'CREATE (org)<-[:MEMBER_OF]-(u:User {email:email, password:password, roles:roles, name:name, id:apoc.create.uuid()}) RETURN u as node',
          'CREATE (u:User {email:email, password:password, roles:roles, name:$name, id:apoc.create.uuid()}) RETURN u as node',
          {email:$email, password:$password, roles:$roles, name:$name, o:o}
        ) YIELD value
        RETURN value.node AS user
      `;
      const createResult = await session.run(create, {
        email: userEmail,
        password: passwordHash,
        roles,
        name,
        emailEnding,
      });
      if (createResult?.records?.length) {
        const userProperties = createResult.records[0].get("user")
          ?.properties as UserProperties;
        if (!userProperties) {
          throw new UserNotFoundError(`toast:User could not be created`);
        }
        const jwtSet = generateJWT(userProperties);
        const userResponse: LoginState = {
          id: userProperties.id,
          email: userEmail,
          roles,
          name,
          tokenSet: jwtSet,
        };
        return userResponse;
      } else {
        throw new UserNotFoundError(`toast:User could not be created`);
      }
    }
  } catch (err) {
    console.error(err);
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
      err instanceof UserNotFoundError ||
      err instanceof UserAlreadyExists
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
