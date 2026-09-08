# Arquitectura — Diagrama de contenedores (C4)

Este diagrama muestra los contenedores que componen FlowSync y cómo se comunican, a partir de lo que existe hoy en el código: una SPA de React que consume una única API REST (AdonisJS), que a su vez persiste en SQLite a través de Lucid ORM. No se representan colas, cachés, servicios externos ni otros backends porque no hay nada de eso en el repo — `config/database.ts` solo define la conexión `sqlite`, y `frontend/src/lib/api.ts` es el único punto de contacto con el backend.

```mermaid
flowchart TB
    persona["👤 Miembro del equipo<br/><i>Persona</i><br/>Usa FlowSync para gestionar sus tareas"]

    subgraph flowsync["FlowSync"]
        spa["React SPA<br/><i>Contenedor: React 19 + Vite 8</i><br/>Login, registro, perfil y gestión de tareas.<br/>Guarda el token en localStorage (flowsync.token)"]
        api["API AdonisJS<br/><i>Contenedor: AdonisJS 7 + Lucid 22</i><br/>Expone /api/v1 (auth, account, tasks).<br/>Autenticación por access tokens (guard api)"]
        db[("SQLite<br/><i>Contenedor: better-sqlite3</i><br/>tmp/db.sqlite3<br/>Tablas: users, tasks")]
    end

    persona -- "Usa (navegador, HTTPS)" --> spa
    spa -- "Llama a /api/v1/*<br/>JSON + Authorization: Bearer &lt;token&gt;" --> api
    api -- "Lee/escribe vía Lucid ORM" --> db

    style persona fill:#08427b,color:#fff,stroke:#052e56
    style spa fill:#1168bd,color:#fff,stroke:#0b4884
    style api fill:#1168bd,color:#fff,stroke:#0b4884
    style db fill:#438dd5,color:#fff,stroke:#2e6295
    style flowsync fill:none,stroke:#999,stroke-dasharray: 4 3
```

## Contenedores

- **React SPA** (`frontend/`) — puerto `5173` en desarrollo. Páginas de login, registro, perfil y tareas (`src/pages/`), con `lib/api.ts` como único cliente HTTP hacia el backend y `auth/auth-provider.tsx` gestionando el token de sesión.
- **API AdonisJS** (`backend/`) — puerto `3333`. Rutas bajo `/api/v1` (`start/routes.ts`): `auth/signup`, `auth/login`, `account/profile`, `account/logout` y el recurso `tasks` (listar, crear, ver detalle, cambiar estado, fijar fecha de vencimiento). Los controladores (`app/controllers/`) usan validadores VineJS, transformers (`app/transformers/`) para serializar la respuesta y los modelos Lucid `User` y `Task` (`app/models/`) para acceder a los datos.
- **SQLite** — fichero `tmp/db.sqlite3`, accedido mediante Lucid ORM (`config/database.ts`), con las tablas `users` y `tasks` (la relación `Task.assignee → User` está declarada en `app/models/task.ts`).
