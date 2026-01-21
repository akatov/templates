import { Data } from "effect";

/** @internal */
export type Template = "devcontainer";

/** @internal */
export const templates = ["devcontainer"] as const;

export type ProjectType = Data.TaggedEnum<{
  readonly Template: {
    readonly template: Template;
    readonly withChangesets: boolean;
    readonly withNixFlake: boolean;
    readonly withESLint: boolean;
    readonly withWorkflows: boolean;
  };
}>;

export const ProjectType = Data.taggedEnum<ProjectType>();
