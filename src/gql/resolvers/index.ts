/***********
 * ## Login and Refresh are functions (you can look at the signature of the functions in mediators backend)
 * import Login from "./Login"
 * import Refresh from "./Refresh"
 * export default {Login}
 */
import Login from "./Login";
import CreateUser from "./CreateUser";
import RefreshToken from "./RefreshToken";
import CreateDocuments from "./CreateDocuments";
import UpdateDocuments from "./UpdateDocuments";

export const resolvers = {
  Mutation: {
    Login,
    CreateUser,
    RefreshToken,
    CreateDocuments,
    UpdateDocuments,
  },
};
