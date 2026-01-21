import { Array, Effect, pipe } from "effect";
import { describe, expect, it } from "@effect/vitest";

import { validateProjectName } from "./Utils.js";

describe(validateProjectName, () => {
  const expectSuccess = (name: string) =>
    validateProjectName(name).pipe(
      Effect.map((result) => expect(result).toBe(name)),
    );
  const expectFailure = (name: string) =>
    Effect.flip(validateProjectName(name)).pipe(
      Effect.map((error) => expect(error).toBeDefined()),
    );

  it.effect("accepts valid project names", () =>
    pipe(
      ["my-project", "project123", "@scope/package", "@my-scope/my-package"],
      Array.map(expectSuccess),
      Effect.all,
    ),
  );

  it.effect("rejects empty string", () => expectFailure(""));

  it.effect("rejects names longer than 214 characters", () =>
    expectFailure("a".repeat(215)),
  );

  it.effect("rejects names with capital letters", () =>
    expectFailure("MyProject"),
  );

  it.effect("rejects names with leading whitespace", () =>
    expectFailure(" project"),
  );

  it.effect("rejects names with trailing whitespace", () =>
    expectFailure("project "),
  );

  it.effect("rejects names starting with a period", () =>
    expectFailure(".project"),
  );

  it.effect("rejects names starting with an underscore", () =>
    expectFailure("_project"),
  );

  it.effect("rejects names with special characters ~'!()*", () =>
    pipe(
      ["~", "'", "!", "(", ")", "*"],
      Array.map((char) => expectFailure(`project${char}`)),
      Effect.all,
    ),
  );

  it.effect("rejects Node.js builtin module names", () =>
    pipe(
      ["fs", "path", "http", "crypto", "buffer"],
      Array.map(expectFailure),
      Effect.all,
    ),
  );

  it.effect("rejects blocked names", () =>
    pipe(["node_modules", "favicon.ico"], Array.map(expectFailure), Effect.all),
  );

  it.effect("rejects names with non-URL-friendly characters", () =>
    expectFailure("project name"),
  );

  it.effect("rejects scoped packages with invalid scope", () =>
    expectFailure("@invalid scope/package"),
  );

  it.effect("rejects scoped packages with invalid package name", () =>
    expectFailure("@scope/invalid package"),
  );
});
