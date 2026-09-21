import { collection } from "firebase/firestore";
import { db } from "./firebase";

export { db };

/** users/{uid}/<name> — every document in the app is owned by one account. */
export function userCol(userId: string, name: string) {
  return collection(db, "users", userId, name);
}
