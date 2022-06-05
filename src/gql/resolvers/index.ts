/***********
 * ## Login and Refresh are functions (you can look at the signature of the functions in mediators backend)
 * import Login from "./Login"
 * import Refresh from "./Refresh"
 * export default {Login}
 */
import Login from "./Login";
import CreateUser from "./CreateUser";
import RefreshToken from "./RefreshToken";
import ChangeRole from "./ChangeRole";

export const resolvers = {
  Mutation: {
    Login,
    CreateUser,
    RefreshToken,
    ChangeRole,
  },
};
