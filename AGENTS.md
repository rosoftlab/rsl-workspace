# Rosoftlab Workspace - Codex Instructions

## Project overview
- Angular monorepo of libraries under `projects/rosoftlab/*`.
- Core libraries: `@rosoftlab/core`, `@rosoftlab/rdict`, `@rosoftlab/formly`, `@rosoftlab/material`,
  `@rosoftlab/ionic`, `@rosoftlab/kendo`, `@rosoftlab/statemachine`, `@rosoftlab/shared-ui`.
- Auth uses OIDC Client TS with DI providers (see `projects/rosoftlab/core/src/lib/auth/`).

## Repo layout
- Library sources live in `projects/rosoftlab/<lib>/src`.
- Build scripts and version orchestration in `build/`.
- Examples/apps: `rdict-example`, `ionic-example-app`, `example` (see `angular.json` and scripts).

## Common patterns
- Dependency injection prefers functional providers, e.g. `provideAuth()` in
  `projects/rosoftlab/core/src/lib/auth/provide-auth.ts`.
- Base classes:
  - `BaseService<T>` for CRUD + datastore integration.
  - `BaseModel` for metadata and serialization.
- Model decorators:
  - Use `@Attribute()` to control serialization and validation on models.
- Datastore:
  - Services should target `DatastorePort`; `DatastoreCore` implements HTTP + caching.
  - Configure via `Configurations` (e.g. apiVersion, baseUrl).

## Build, test, and dev
- Build all libs: `npm run build`.
- Build dev libs: `npm run builddev`.
- Watch core: `npm run watch-core`.
- Test: `npm run test` (Karma).
- Build scripts in `build/` manage versions and peer dependencies for publish.

## Editing guidance
- Keep public APIs stable (this repo publishes libraries).
- Match Angular and RxJS patterns already used in the target package.
- Prefer updating or extending base services/models before creating new patterns.

## Key references
- Core module: `projects/rosoftlab/core/src/lib/rsl-base-module.ts`
- Base service: `projects/rosoftlab/core/src/lib/services/base.service.ts`
- Base model: `projects/rosoftlab/core/src/lib/models/base.model.ts`
- Auth providers: `projects/rosoftlab/core/src/lib/auth/provide-auth.ts`
