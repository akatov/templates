import { Effect, Stream } from "effect";
import { HelpDoc, ValidationError } from "@effect/cli";
import {
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { NodeSink } from "@effect/platform-node";
import * as Tar from "tar";

import type { TemplateConfig } from "./Cli.js";

const REPO = "akatov/templates";
const CODELOAD_BASE_URL = "https://codeload.github.com";

export class GitHub extends Effect.Service<GitHub>()("app/GitHub", {
  accessors: true,
  effect: Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;

    const codeloadClient = client.pipe(
      HttpClient.filterStatusOk,
      HttpClient.mapRequest(HttpClientRequest.prependUrl(CODELOAD_BASE_URL)),
    );

    const downloadTemplate = (config: TemplateConfig) =>
      codeloadClient.get(`/${REPO}/tar.gz/main`).pipe(
        HttpClientResponse.stream,
        Stream.run(
          NodeSink.fromWritable(
            () =>
              Tar.extract({
                cwd: config.projectName,
                strip: 2 + config.projectType.template.split("/").length,
                filter: (path) =>
                  path.includes(
                    `templates-main/templates/${config.projectType.template}`,
                  ),
              }),
            () =>
              ValidationError.invalidValue(
                HelpDoc.p(
                  `Failed to download template ${config.projectType.template}`,
                ),
              ),
          ),
        ),
      );

    return {
      downloadTemplate,
    } as const;
  }),
}) {}
