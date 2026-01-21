#!/usr/bin/env -S npx tsx
import { EventEmitter } from "events";
import { Effect, Layer, Logger, LogLevel } from "effect";
import { CliConfig } from "@effect/cli";
import {
  NodeContext,
  NodeHttpClient,
  NodeRuntime,
} from "@effect/platform-node";
import { Ansi, AnsiDoc } from "@effect/printer-ansi";

import cli from "./src/Cli.js";
import GitHub from "./src/GitHub.js";
import AnsiDocLogger from "./src/Logger.js";

// otherwise there's a MaxListenersExceededWarning warning on OSX
EventEmitter.defaultMaxListeners = 20;

const MainLive = Layer.mergeAll(
  GitHub.Default,
  Logger.replace(Logger.defaultLogger, AnsiDocLogger),
  Logger.minimumLogLevel(LogLevel.Info),
  CliConfig.layer({ showBuiltIns: false }),
  NodeContext.layer,
).pipe(Layer.provide(NodeHttpClient.layerUndici));

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
