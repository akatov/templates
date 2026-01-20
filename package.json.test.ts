import {
  Array,
  Effect,
  HashMap,
  Layer,
  Match,
  Option,
  pipe,
  Record,
  Schema,
} from "effect";
import { FileSystem, Path } from "@effect/platform";
import { NodeFileSystem, NodePath } from "@effect/platform-node";
import { describe, it } from "@effect/vitest";

const PackageName = Schema.String.pipe(Schema.brand("Packagename"));
type PackageName = typeof PackageName.Type;
const PackageVersion = Schema.String.pipe(Schema.brand("PackageVersion"));
type PackageVersion = typeof PackageVersion.Type;

const Dependencies = Schema.Record({
  key: PackageName,
  value: PackageVersion,
});
type Dependencies = typeof Dependencies.Type;

const PackageJson = Schema.Struct({
  name: PackageName,
  dependencies: Dependencies.pipe(
    Schema.optionalWith({ default: () => Dependencies.make({}) }),
  ),
  devDependencies: Dependencies.pipe(
    Schema.optionalWith({ default: () => Dependencies.make({}) }),
  ),
});
type PackageJson = typeof PackageJson.Type;

const WorkspacePackageJsons = Schema.Struct({
  root: PackageJson,
  workspacePackages: Schema.Array(PackageJson),
});
type WorkspacePackageJsons = typeof WorkspacePackageJsons.Type;

const VersionDefinitions = Schema.HashMapFromSelf({
  key: PackageName,
  value: Schema.HashMapFromSelf({
    key: PackageVersion,
    value: Schema.Array(PackageName), // the name of the workspace packages
  }),
});
type VersionDefinitions = typeof VersionDefinitions.Type;

const assertAllUniqueVersions = (defs: VersionDefinitions) =>
  Effect.all(
    Array.map(HashMap.toEntries(defs), ([dependencyName, versionMap]) =>
      Match.value(HashMap.size(versionMap)).pipe(
        Match.when(1, () => Effect.void),
        Match.orElse((n) =>
          Effect.fail(
            `dependency ${dependencyName} has ${
              n
            } different versions in packages ${Array.fromIterable(
              HashMap.values(versionMap),
            )}`,
          ),
        ),
      ),
    ),
  ).pipe(Effect.as(Effect.void));

const VersionDefinitionsFromWorkspacePackageJsons = WorkspacePackageJsons.pipe(
  Schema.transform(VersionDefinitions, {
    strict: false,
    decode: ({ root, workspacePackages }) =>
      pipe(
        workspacePackages,
        Array.prepend(root),
        Array.reduce(
          HashMap.empty<
            PackageName,
            HashMap.HashMap<PackageVersion, ReadonlyArray<PackageName>>
          >(),
          (
            definitions,
            { name: workspacePackageName, dependencies, devDependencies },
          ) =>
            pipe(
              Record.toEntries(dependencies),
              Array.appendAll(Record.toEntries(devDependencies)),
              Array.reduce(
                definitions,
                (definitions, [dependencyName, dependencyVersion]) =>
                  HashMap.modifyAt(
                    definitions,
                    dependencyName,
                    (maybeVersionMap) =>
                      maybeVersionMap.pipe(
                        Option.getOrElse(() =>
                          HashMap.empty<
                            PackageVersion,
                            ReadonlyArray<PackageName>
                          >(),
                        ),
                        (versionMap) =>
                          HashMap.modifyAt(
                            versionMap,
                            dependencyVersion,
                            (maybeWorkspacePackages) =>
                              maybeWorkspacePackages.pipe(
                                Option.getOrElse(() =>
                                  Array.empty<PackageName>(),
                                ),
                                Array.append(workspacePackageName),
                                Option.some,
                              ),
                          ),
                        Option.some,
                      ),
                  ),
              ),
            ),
        ),
      ),

    encode: () => {
      throw new Error("not implemented");
    },
  }),
);

const PACKAGE_JSON = "package.json" as const;
const WORKSPACES_DIRECTORY = "templates/devcontainer/packages" as const;

describe("package.json", () => {
  it.effect("should have the same dependency versions everywhere", () =>
    Effect.all({
      FileSystem: FileSystem.FileSystem,
      Path: Path.Path,
    })
      .pipe(
        Effect.flatMap(({ FileSystem, Path }) =>
          Effect.gen(function* () {
            const packagesDir = Path.resolve(WORKSPACES_DIRECTORY);

            const potentialEntries =
              yield* FileSystem.readDirectory(packagesDir);

            const potentialWorkspaceDirectories = yield* pipe(
              potentialEntries,
              Effect.filter(($) =>
                FileSystem.stat(Path.join(packagesDir, $)).pipe(
                  Effect.map(({ type }) => type === "Directory"),
                ),
              ),
            );

            const potentialPackagesPaths = potentialWorkspaceDirectories.map(
              (entry) => Path.join(packagesDir, entry, PACKAGE_JSON),
            );

            const packagesPaths = yield* pipe(
              potentialPackagesPaths,
              Effect.filter(($) => FileSystem.exists($)),
            );

            const rootJson: object = yield* FileSystem.readFileString(
              PACKAGE_JSON,
            ).pipe(Effect.map(($) => JSON.parse($)));

            const packagesJson: Array<object> = yield* Effect.all(
              Array.map(packagesPaths, (path) =>
                FileSystem.readFileString(path).pipe(
                  Effect.map(($) => JSON.parse($)),
                ),
              ),
            );

            const s = yield* Schema.decodeUnknown(WorkspacePackageJsons)({
              root: rootJson,
              workspacePackages: packagesJson,
            });

            const t = yield* Schema.decode(
              VersionDefinitionsFromWorkspacePackageJsons,
            )(s);

            yield* assertAllUniqueVersions(t);
          }),
        ),
      )
      .pipe(
        Effect.provide(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
      ),
  );
});
