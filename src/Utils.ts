import { isBuiltin } from "node:module";
import { Array, Effect, Option, pipe, Predicate, Schema, String } from "effect";
import { HelpDoc } from "@effect/cli";

const SCOPED_PACKAGE_REGEX = /^(?:@([^/]+?)[/])?([^/]+?)$/;

const BLOCK_LIST = ["node_modules", "favicon.ico"] as const;

const isUrlFriendly: Predicate.Predicate<string> = (s: string) =>
  encodeURIComponent(s) === s;
const isNotUrlFriendly = Predicate.not(isUrlFriendly);

export const ProjectName = Schema.String.pipe(
  Schema.nonEmptyString({
    message: () => "Project name must be a non-empty string",
  }),
  Schema.maxLength(214, {
    message: () => "Project name must not contain more than 214 characters",
  }),
  Schema.lowercased({
    message: () => "Project name must not contain capital letters",
  }),
  Schema.trimmed({
    message: () =>
      "Project name must not contain leading or trailing whitespace",
  }),
  Schema.pattern(/^[^.]/, {
    message: () => "Project name must not start with a period",
  }),
  Schema.pattern(/^[^_]/, {
    message: () => "Project name must not start with an underscore",
  }),
  Schema.filter((name) => !/[~'!()*]/.test(name.split("/").slice(-1)[0]!), {
    message: () =>
      "Project name must not contain the special characters ~'!()*",
  }),
  Schema.filter((name) => !isBuiltin(name), {
    message: () => "Project name must not be a NodeJS built-in module name",
  }),
  Schema.filter(
    (name) => !Array.contains(BLOCK_LIST, String.toLowerCase(name)),
    {
      message: (issue) => `Project name '${issue.actual}' is blocked from use`,
    },
  ),

  Schema.filter(
    (name) =>
      pipe(
        name,
        Option.liftPredicate(isNotUrlFriendly),
        Option.flatMap(String.match(SCOPED_PACKAGE_REGEX)),
        Option.map(([, user, pkg]) => [user!, pkg!] as const),
        Option.filter(Array.some(isNotUrlFriendly)),
        Option.isNone,
      ),
    {
      message: () => "Project name must only contain URL-friendly characters",
    },
  ),
);

export const validateProjectName = (name: string) =>
  pipe(
    name,
    Schema.decode(ProjectName),
    Effect.mapError((parseError) => HelpDoc.p(parseError.message)),
  );
