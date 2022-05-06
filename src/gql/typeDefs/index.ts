/*********
 * Each type should have its own file here and should be imported in this
 * index.ts and exported as an array of the imported names
 *
 * import User from "./User"
 * export default [User]
 */

import Document from "./Document";
import User from "./User";
import Topic from "./Topic";
import Org from "./Org";
import Category from "./Category";

export default [User, Document, Topic, Org, Category];
