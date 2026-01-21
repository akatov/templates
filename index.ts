#!/usr/bin/env -S npx tsx
import { Effect, Layer, Logger, LogLevel } from "effect";
import { CliConfig } from "@effect/cli";
import {
  NodeContext,
  NodeHttpClient,
  NodeRuntime,
} from "@effect/platform-node";
import { Ansi, AnsiDoc } from "@effect/printer-ansi";

import { cli } from "./src/Cli.js";
import { GitHub } from "./src/GitHub.js";
import { AnsiDocLogger } from "./src/Logger.js";

const MainLive = GitHub.Default.pipe(
  Layer.provideMerge(
    Layer.mergeAll(
      Logger.replace(Logger.defaultLogger, AnsiDocLogger),
      Logger.minimumLogLevel(LogLevel.Info),
      CliConfig.layer({ showBuiltIns: false }),
      NodeContext.layer,
      NodeHttpClient.layerUndici,
    ),
  ),
);

cli(process.argv).pipe(
  Effect.catchTags({
    QuitException: () =>
      Effect.logError(
        AnsiDoc.cat(
          AnsiDoc.hardLine,
          AnsiDoc.text("Exiting...").pipe(AnsiDoc.annotate(Ansi.red)),
        ),
      ),
  }),
  Effect.orDie,
  Effect.provide(MainLive),
  NodeRuntime.runMain({
    disablePrettyLogger: true,
    disableErrorReporting: true,
  }),
);
