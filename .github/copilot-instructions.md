# Rosoftlab Workspace - AI Coding Agent Instructions

## Architecture Overview
This is an Angular monorepo containing multiple libraries for enterprise application development:
- **@rosoftlab/core**: Core services, auth (OIDC), datastore, base models, translations, and common utilities
- **@rosoftlab/rdict**: Dictionary/data management components
- **@rosoftlab/formly**: Formly-based form components
- **@rosoftlab/material**: Angular Material UI components
- **@rosoftlab/ionic**: Ionic UI components
- **@rosoftlab/kendo**: Kendo UI components
- **@rosoftlab/statemachine**: State machine functionality
- **@rosoftlab/shared-ui**: Shared UI utilities

## Key Patterns & Conventions

### Dependency Injection & Providers
Use functional providers like `provideAuth()` from `auth/provide-auth.ts` for configuring services:
```typescript
export function provideAuth(settings: UserManagerSettings, guest_settings?: UserManagerSettings): Provider[] {
  return [
    { provide: OIDC_CLIENT_SETTINGS, useValue: settings },
    { provide: OIDC_GUEST_CLIENT_SETTINGS, useValue: guest_settings },
    provideOidcUserManager()
  ];
}
```

### Base Classes & Inheritance
- Extend `BaseService<T>` for CRUD operations with datastore integration
- Extend `BaseModel` for data models with metadata support
- Use `RslBaseModule.forRoot(config)` to configure the core module

### Model Decorators
Use `@Attribute()` decorator on model properties for serialization and validation:
```typescript
@Attribute({ required: true, serializedName: 'user_name' })
name: string;
```
Supports converters for dates and custom types.

### Datastore Pattern
Services use `DatastorePort` interface for data access. `DatastoreCore` implements HTTP client with caching. Configure via `Configurations` (apiVersion, baseUrl).

### Build & Publishing
- Run `npm run build` to build all libraries with synchronized versions
- Use `npm run publish` to publish to npm
- Custom build scripts in `build/` directory handle version management and peer dependencies

### Development Workflows
- `npm run watch-core` for core library development
- `npm run demo-rdict` to serve rdict-example app
- Build scripts like `build_core_dev_and_deploy.sh` copy built libs to external projects

### Testing
Use standard Angular testing with Karma. Services test basic instantiation and functionality.

### External Integrations
- **Auth**: OIDC Client TS for authentication
- **UI**: Kendo UI, Angular Material, Ionic, ngx-formly
- **Real-time**: Socket.io client
- **Internationalization**: ngx-translate
- **Forms**: ReactiveFormsModule with custom validators

## Key Files
- [projects/rosoftlab/core/src/lib/rsl-base-module.ts](projects/rosoftlab/core/src/lib/rsl-base-module.ts): Main module setup
- [projects/rosoftlab/core/src/lib/services/base.service.ts](projects/rosoftlab/core/src/lib/services/base.service.ts): Base service pattern
- [projects/rosoftlab/core/src/lib/models/base.model.ts](projects/rosoftlab/core/src/lib/models/base.model.ts): Base model with metadata
- [build/build.ts](build/build.ts): Custom build orchestration