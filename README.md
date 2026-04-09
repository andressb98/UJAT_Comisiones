# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

```
UjatComisiones
├─ .npmrc
├─ .prettierignore
├─ .prettierrc
├─ dev.db
├─ eslint.config.js
├─ estructura.txt
├─ package-lock.json
├─ package.json
├─ prisma
│  ├─ migrations
│  │  ├─ 20260120161343_init
│  │  │  └─ migration.sql
│  │  ├─ 20260121140015_nueva_tabla_sesiones
│  │  │  └─ migration.sql
│  │  ├─ 20260122042606_nueva_columna_activo
│  │  │  └─ migration.sql
│  │  ├─ 20260122052406_nueva_columna
│  │  │  └─ migration.sql
│  │  ├─ 20260122125335_clave_unica_tipo_comision
│  │  │  └─ migration.sql
│  │  ├─ 20260122132626_otracolumna
│  │  │  └─ migration.sql
│  │  ├─ 20260123025142_cmabio
│  │  │  └─ migration.sql
│  │  ├─ 20260124134803_nosesilacague
│  │  │  └─ migration.sql
│  │  ├─ 20260124135945_ss
│  │  │  └─ migration.sql
│  │  ├─ 20260127002438_nueva_relacion_administrador_division_con_unidad_administrativa
│  │  │  └─ migration.sql
│  │  ├─ 20260127152320_nueva_tabla_secretaria_division
│  │  │  └─ migration.sql
│  │  ├─ 20260127230049_nueva_relacion_tabla_comision
│  │  │  └─ migration.sql
│  │  ├─ 20260128232924_nueva_tabla_servicio_social
│  │  │  └─ migration.sql
│  │  ├─ 20260204185803_nueva_columna_folio_en_tabla_comisiones
│  │  │  └─ migration.sql
│  │  ├─ 20260204190550_cambio_de_nombre_secretaria_division_a_secretaria_unidad
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts
├─ README.md
├─ src
│  ├─ app.d.ts
│  ├─ app.html
│  ├─ hooks.server.ts
│  ├─ lib
│  │  ├─ assets
│  │  │  └─ favicon.svg
│  │  ├─ components
│  │  │  ├─ botones
│  │  │  │  └─ botonExportar.svelte
│  │  │  ├─ filtros
│  │  │  │  ├─ filtrosReportes.svelte
│  │  │  │  └─ TablaReportes.svelte
│  │  │  ├─ forms
│  │  │  │  └─ FormAlert.svelte
│  │  │  ├─ layout
│  │  │  │  ├─ Sidebar.svelte
│  │  │  │  └─ TopNav.svelte
│  │  │  └─ modales
│  │  │     └─ ModalCrearDivisionRapida.svelte
│  │  ├─ config
│  │  │  └─ menuConfig.ts
│  │  ├─ index.ts
│  │  ├─ schemas
│  │  │  ├─ comision.schema.ts
│  │  │  ├─ division.schema.ts
│  │  │  ├─ docente.schema.ts
│  │  │  ├─ lugar.schema.ts
│  │  │  ├─ tipoComision.schema.ts
│  │  │  ├─ unidadAdministrativa.schema.ts
│  │  │  └─ usuario.schema.ts
│  │  ├─ server
│  │  │  ├─ audit
│  │  │  │  └─ auditContext.ts
│  │  │  ├─ auth
│  │  │  │  ├─ auth.schema.ts
│  │  │  │  └─ auth.service.ts
│  │  │  ├─ prisma.ts
│  │  │  └─ services
│  │  │     ├─ bitacora.service.ts
│  │  │     ├─ comision.service.ts
│  │  │     ├─ division.services.ts
│  │  │     ├─ docente.service.ts
│  │  │     ├─ lugar.service.ts
│  │  │     ├─ tipoComision.service.ts
│  │  │     ├─ unidadAdministrativa.service.ts
│  │  │     └─ usuario.service.ts
│  │  ├─ stores
│  │  │  └─ menuStore.ts
│  │  ├─ styles
│  │  │  ├─ main.scss
│  │  │  ├─ _base.scss
│  │  │  ├─ _bulma-overrides.scss
│  │  │  ├─ _layout.scss
│  │  │  ├─ _tokens.scss
│  │  │  └─ _variables.scss
│  │  └─ utils
│  │     ├─ clave.ts
│  │     ├─ clave_comisiones.ts
│  │     ├─ comisiones
│  │     │  └─ pdfGenerator.ts
│  │     ├─ forms
│  │     │  ├─ actionFail.ts
│  │     │  └─ field.ts
│  │     └─ permisos.ts
│  └─ routes
│     ├─ (app)
│     │  ├─ +layout.server.ts
│     │  ├─ +layout.svelte
│     │  ├─ captura
│     │  │  ├─ +page.server.ts
│     │  │  └─ +page.svelte
│     │  ├─ dashboard
│     │  │  ├─ +page.server.ts
│     │  │  └─ +page.svelte
│     │  ├─ divisiones
│     │  │  ├─ +page.server.ts
│     │  │  └─ +page.svelte
│     │  ├─ docentes
│     │  │  ├─ +page.server.ts
│     │  │  └─ +page.svelte
│     │  ├─ lugares
│     │  │  ├─ +page.server.ts
│     │  │  └─ +page.svelte
│     │  ├─ permisos
│     │  ├─ reportes
│     │  │  └─ +page.svelte
│     │  ├─ tipos-comisiones
│     │  │  ├─ +page.server.ts
│     │  │  └─ +page.svelte
│     │  ├─ unidadesAdministrativas
│     │  │  ├─ +page.server.ts
│     │  │  └─ +page.svelte
│     │  └─ usuarios
│     │     ├─ +page.server.ts
│     │     └─ +page.svelte
│     ├─ (auth)
│     │  ├─ +layout.server.ts
│     │  ├─ +layout.svelte
│     │  └─ login
│     │     ├─ +page.server.ts
│     │     └─ +page.svelte
│     ├─ +layout.server.ts
│     ├─ +layout.svelte
│     ├─ +page.server.ts
│     ├─ api
│     │  ├─ comisiones
│     │  │  └─ [id]
│     │  │     └─ +server.ts
│     │  ├─ filtros-comisiones
│     │  │  └─ +server.ts
│     │  └─ reportes-comisiones
│     │     └─ +server.ts
│     └─ logout
│        └─ +server.ts
├─ static
│  └─ robots.txt
├─ svelte.config.js
├─ tsconfig.json
├─ vite.config.ts
└─ x.txt

```
```
UjatComisiones
├─ .npmrc
├─ .prettierignore
├─ .prettierrc
├─ dev.db
├─ eslint.config.js
├─ estructura.txt
├─ package-lock.json
├─ package.json
├─ prisma
│  ├─ migrations
│  │  ├─ 20260120161343_init
│  │  │  └─ migration.sql
│  │  ├─ 20260121140015_nueva_tabla_sesiones
│  │  │  └─ migration.sql
│  │  ├─ 20260122042606_nueva_columna_activo
│  │  │  └─ migration.sql
│  │  ├─ 20260122052406_nueva_columna
│  │  │  └─ migration.sql
│  │  ├─ 20260122125335_clave_unica_tipo_comision
│  │  │  └─ migration.sql
│  │  ├─ 20260122132626_otracolumna
│  │  │  └─ migration.sql
│  │  ├─ 20260123025142_cmabio
│  │  │  └─ migration.sql
│  │  ├─ 20260124134803_nosesilacague
│  │  │  └─ migration.sql
│  │  ├─ 20260124135945_ss
│  │  │  └─ migration.sql
│  │  ├─ 20260127002438_nueva_relacion_administrador_division_con_unidad_administrativa
│  │  │  └─ migration.sql
│  │  ├─ 20260127152320_nueva_tabla_secretaria_division
│  │  │  └─ migration.sql
│  │  ├─ 20260127230049_nueva_relacion_tabla_comision
│  │  │  └─ migration.sql
│  │  ├─ 20260128232924_nueva_tabla_servicio_social
│  │  │  └─ migration.sql
│  │  ├─ 20260204185803_nueva_columna_folio_en_tabla_comisiones
│  │  │  └─ migration.sql
│  │  ├─ 20260204190550_cambio_de_nombre_secretaria_division_a_secretaria_unidad
│  │  │  └─ migration.sql
│  │  └─ migration_lock.toml
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts
├─ README.md
├─ src
│  ├─ app.d.ts
│  ├─ app.html
│  ├─ hooks.server.ts
│  ├─ lib
│  │  ├─ assets
│  │  │  └─ favicon.svg
│  │  ├─ components
│  │  │  ├─ botones
│  │  │  │  └─ botonExportar.svelte
│  │  │  ├─ filtros
│  │  │  │  ├─ filtrosReportes.svelte
│  │  │  │  └─ TablaReportes.svelte
│  │  │  ├─ forms
│  │  │  │  └─ FormAlert.svelte
│  │  │  ├─ layout
│  │  │  │  ├─ Sidebar.svelte
│  │  │  │  └─ TopNav.svelte
│  │  │  └─ modales
│  │  │     └─ ModalCrearDivisionRapida.svelte
│  │  ├─ config
│  │  │  └─ menuConfig.ts
│  │  ├─ index.ts
│  │  ├─ schemas
│  │  │  ├─ comision.schema.ts
│  │  │  ├─ division.schema.ts
│  │  │  ├─ docente.schema.ts
│  │  │  ├─ lugar.schema.ts
│  │  │  ├─ tipoComision.schema.ts
│  │  │  ├─ unidadAdministrativa.schema.ts
│  │  │  └─ usuario.schema.ts
│  │  ├─ server
│  │  │  ├─ audit
│  │  │  │  └─ auditContext.ts
│  │  │  ├─ auth
│  │  │  │  ├─ auth.schema.ts
│  │  │  │  └─ auth.service.ts
│  │  │  ├─ prisma.ts
│  │  │  └─ services
│  │  │     ├─ bitacora.service.ts
│  │  │     ├─ comision.service.ts
│  │  │     ├─ division.services.ts
│  │  │     ├─ docente.service.ts
│  │  │     ├─ lugar.service.ts
│  │  │     ├─ tipoComision.service.ts
│  │  │     ├─ unidadAdministrativa.service.ts
│  │  │     └─ usuario.service.ts
│  │  ├─ stores
│  │  │  └─ menuStore.ts
│  │  ├─ styles
│  │  │  ├─ main.scss
│  │  │  ├─ _base.scss
│  │  │  ├─ _bulma-overrides.scss
│  │  │  ├─ _layout.scss
│  │  │  ├─ _tokens.scss
│  │  │  └─ _variables.scss
│  │  └─ utils
│  │     ├─ clave.ts
│  │     ├─ clave_comisiones.ts
│  │     ├─ comisiones
│  │     │  └─ pdfGenerator.ts
│  │     ├─ forms
│  │     │  ├─ actionFail.ts
│  │     │  └─ field.ts
│  │     └─ permisos.ts
│  └─ routes
│     ├─ (app)
│     │  ├─ +layout.server.ts
│     │  ├─ +layout.svelte
│     │  ├─ captura
│     │  │  ├─ +page.server.ts
│     │  │  └─ +page.svelte
│     │  ├─ dashboard
│     │  │  ├─ +page.server.ts
│     │  │  └─ +page.svelte
│     │  ├─ divisiones
│     │  │  ├─ +page.server.ts
│     │  │  └─ +page.svelte
│     │  ├─ docentes
│     │  │  ├─ +page.server.ts
│     │  │  └─ +page.svelte
│     │  ├─ lugares
│     │  │  ├─ +page.server.ts
│     │  │  └─ +page.svelte
│     │  ├─ permisos
│     │  ├─ reportes
│     │  │  └─ +page.svelte
│     │  ├─ tipos-comisiones
│     │  │  ├─ +page.server.ts
│     │  │  └─ +page.svelte
│     │  ├─ unidadesAdministrativas
│     │  │  ├─ +page.server.ts
│     │  │  └─ +page.svelte
│     │  └─ usuarios
│     │     ├─ +page.server.ts
│     │     └─ +page.svelte
│     ├─ (auth)
│     │  ├─ +layout.server.ts
│     │  ├─ +layout.svelte
│     │  └─ login
│     │     ├─ +page.server.ts
│     │     └─ +page.svelte
│     ├─ +layout.server.ts
│     ├─ +layout.svelte
│     ├─ +page.server.ts
│     ├─ api
│     │  ├─ comisiones
│     │  │  └─ [id]
│     │  │     └─ +server.ts
│     │  ├─ filtros-comisiones
│     │  │  └─ +server.ts
│     │  └─ reportes-comisiones
│     │     └─ +server.ts
│     └─ logout
│        └─ +server.ts
├─ static
│  └─ robots.txt
├─ svelte.config.js
├─ tsconfig.json
├─ vite.config.ts
└─ x.txt

```