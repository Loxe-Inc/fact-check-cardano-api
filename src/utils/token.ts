import { ForbiddenError } from "apollo-server";
import jwt from "jsonwebtoken";
import { DateTime } from "luxon";
import { Driver } from "neo4j-driver-core";
import { JWTSet, LoginState, UserProperties } from "types";

const { RSA_KEY_B64 } = process.env;

const DECODED_PRV = RSA_KEY_B64
  ? Buffer.from(RSA_KEY_B64, "base64").toString("ascii")
  : "super-secret";

const Method = RSA_KEY_B64 ? "RS256" : "HS256";

export const generateJWTFromRT = async (
  refresh_token: string,
  driver: Driver
): Promise<LoginState> => {
  const payload = jwt.verify(refresh_token, DECODED_PRV, {
    algorithms: [Method],
  }) as { email: string };
  if ("email" in payload) {
    const session = driver.session();
    const cypher = `
    MATCH (u:User {email:$email})
    OPTIONAL MATCH (o:Org)<-[:MEMBER_OF]-(u)
    RETURN u,o`;
    const result = await session.run(cypher, { email: payload.email });
    if (result.records?.length) {
      const user = result.records[0].get("u");
      const org = result.records[0].get("o")?.properties;
      const userProperties = user.properties as UserProperties;
      if (userProperties.roles.includes("info_reader")) {
        const tokenSet = generateJWT(userProperties);
        const { name, roles, id, email } = userProperties;
        return {
          tokenSet,
          name,
          email,
          id,
          roles,
          org: org?.id as string,
        } as LoginState;
      }
    }
  }
  throw new ForbiddenError("Incorrect or expired token");
};

export function generateJWT(userProperties: UserProperties): JWTSet {
  const { email, roles, id } = userProperties;
  const now = DateTime.utc();
  try {
    const access_token = jwt.sign(
      {
        id: id,
        sub: email,
        roles,
      },
      DECODED_PRV,
      {
        algorithm: Method,
        expiresIn: "30m",
      }
    );
    const refresh_token = jwt.sign({ email }, DECODED_PRV, {
      algorithm: Method,
      expiresIn: "1day",
    });
    return {
      access_token,
      refresh_token,
      access_token_exp: now.plus({ hours: 1 }).toISO(),
      refresh_token_exp: now.plus({ days: 1 }).toISO(),
    };
  } catch (err) {
    console.log("%ccreateJWT.ts line:41 err", "color: #007acc;", err);
    return {
      access_token: "",
      refresh_token: "",
      access_token_exp: now.plus({ hours: 1 }).toISO(),
      refresh_token_exp: now.plus({ days: 1 }).toISO(),
    };
  }
}
