/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as calls from "../calls.js";
import type * as chat from "../chat.js";
import type * as community from "../community.js";
import type * as companions from "../companions.js";
import type * as flags from "../flags.js";
import type * as http from "../http.js";
import type * as journal from "../journal.js";
import type * as profiles from "../profiles.js";
import type * as router from "../router.js";
import type * as twilioHelper from "../twilioHelper.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  calls: typeof calls;
  chat: typeof chat;
  community: typeof community;
  companions: typeof companions;
  flags: typeof flags;
  http: typeof http;
  journal: typeof journal;
  profiles: typeof profiles;
  router: typeof router;
  twilioHelper: typeof twilioHelper;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
