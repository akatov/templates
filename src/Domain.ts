import * as Data from "effect/Data"
import type { Template } from "./internal/templates.js"

export type ProjectType = Data.TaggedEnum<{
  readonly Template: {
    readonly template: Template
    readonly withChangesets: boolean
    readonly withNixFlake: boolean
    readonly withESLint: boolean
    readonly withWorkflows: boolean
  }
}>

export const ProjectType = Data.taggedEnum<ProjectType>()
