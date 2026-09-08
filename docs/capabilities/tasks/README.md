# Capability: Tareas

> **Fuente de verdad de las reglas de negocio:** [`openspec/specs/tasks/spec.md`](../../../openspec/specs/tasks/spec.md). Este documento no las repite — enlaza a sus requirements. Si algo de aquí y de la spec se contradice, manda la spec.

## Qué hace

Da al equipo una lista de trabajo única y compartida: todas las tareas del espacio, visibles igual para cualquier cuenta, sin vistas personales ni señales de presencia. Apuntar algo cuesta escribir un título; el responsable y el estado se leen sin abrir la tarea. Opcionalmente, una tarea puede llevar una fecha de vencimiento, y el sistema resuelve si está vencida en el momento de cada consulta, contra el día de quien mira (no el del servidor).

Backend en `backend/app/{controllers,models,transformers,validators}/`; pantallas en `frontend/src/pages/{tasks-page,task-page}.tsx`, con el filtro en `frontend/src/components/task-filter.tsx` y la fila de la lista en `frontend/src/components/task-item.tsx`.

## Endpoints

Todos bajo `/api/v1/tasks`, todos exigen sesión (`Authorization: Bearer <token>`, guard `api` — ver [Requirement: Las tareas exigen sesión](../../../openspec/specs/tasks/spec.md#requirement-las-tareas-exigen-sesión)). El contrato completo, con parámetros, cuerpos y códigos de respuesta, está servido en vivo: con el backend arrancado, la interfaz interactiva vive en `http://localhost:3333/api` y el documento crudo en `http://localhost:3333/api.json`.

| Método | Ruta | Controlador | Reglas de negocio relevantes |
|---|---|---|---|
| `POST` | `/tasks` | `TasksController.store` | [Creación con solo el título](../../../openspec/specs/tasks/spec.md#requirement-creación-de-una-tarea-con-solo-el-título), [Ninguna tarea sin título](../../../openspec/specs/tasks/spec.md#requirement-ninguna-tarea-sin-título), [Título demasiado largo](../../../openspec/specs/tasks/spec.md#requirement-aviso-ante-un-título-demasiado-largo) |
| `GET` | `/tasks` | `TasksController.index` | [Una sola lista compartida](../../../openspec/specs/tasks/spec.md#requirement-una-sola-lista-compartida-del-espacio), [Lo que muestra del responsable](../../../openspec/specs/tasks/spec.md#requirement-lo-que-cada-tarea-muestra-de-su-responsable), [Acotar por estado](../../../openspec/specs/tasks/spec.md#requirement-acotar-la-lista-por-estado), [Estado inválido se rechaza](../../../openspec/specs/tasks/spec.md#requirement-un-estado-que-no-existe-se-rechaza-no-se-responde-vacío), [La lista no lleva vencimiento](../../../openspec/specs/tasks/spec.md#requirement-la-lista-no-lleva-el-vencimiento) |
| `GET` | `/tasks/:id` | `TasksController.show` | [Consulta de una tarea suelta](../../../openspec/specs/tasks/spec.md#requirement-consulta-de-una-tarea-suelta), [Cuándo está vencida](../../../openspec/specs/tasks/spec.md#requirement-cuándo-una-tarea-está-vencida), [El día de referencia lo pone quien mira](../../../openspec/specs/tasks/spec.md#requirement-el-día-de-referencia-lo-pone-quien-mira) |
| `PATCH` | `/tasks/:id/status` | `TaskStatusesController.update` | [Tres estados fijos](../../../openspec/specs/tasks/spec.md#requirement-tres-estados-fijos), [Cambio de estado de cualquier tarea](../../../openspec/specs/tasks/spec.md#requirement-cambio-de-estado-de-cualquier-tarea) |
| `PUT` | `/tasks/:id/due-date` | `TaskDueDatesController.update` | [Fecha opcional](../../../openspec/specs/tasks/spec.md#requirement-fecha-de-vencimiento-opcional), [Fijar, cambiar y retirar la fecha](../../../openspec/specs/tasks/spec.md#requirement-fijar-cambiar-y-retirar-la-fecha-de-vencimiento) |

`GET /tasks/:id` y `PUT /tasks/:id/due-date` exigen además el parámetro `today` (`AAAA-MM-DD`): sin él, o si no es una fecha válida, responden `422`.

## Reglas de negocio

Viven enteras en la spec; aquí solo se agrupan por tema para navegar hasta el requirement exacto:

- **Título:** [creación con solo el título](../../../openspec/specs/tasks/spec.md#requirement-creación-de-una-tarea-con-solo-el-título), [título obligatorio](../../../openspec/specs/tasks/spec.md#requirement-ninguna-tarea-sin-título), [límite de 200 caracteres](../../../openspec/specs/tasks/spec.md#requirement-aviso-ante-un-título-demasiado-largo).
- **Alcance de la lista:** [una sola lista compartida](../../../openspec/specs/tasks/spec.md#requirement-una-sola-lista-compartida-del-espacio), [filtro por estado](../../../openspec/specs/tasks/spec.md#requirement-acotar-la-lista-por-estado), [filtro válido sin resultados](../../../openspec/specs/tasks/spec.md#requirement-un-filtro-válido-sin-resultados-es-una-lista-vacía-legítima), [estado inventado se rechaza](../../../openspec/specs/tasks/spec.md#requirement-un-estado-que-no-existe-se-rechaza-no-se-responde-vacío).
- **Estados:** [tres estados fijos](../../../openspec/specs/tasks/spec.md#requirement-tres-estados-fijos), [cambio libre entre ellos](../../../openspec/specs/tasks/spec.md#requirement-cambio-de-estado-de-cualquier-tarea).
- **Responsable:** [qué se muestra de él](../../../openspec/specs/tasks/spec.md#requirement-lo-que-cada-tarea-muestra-de-su-responsable) (nombre e iniciales, nunca el email).
- **Vencimiento:** [fecha opcional](../../../openspec/specs/tasks/spec.md#requirement-fecha-de-vencimiento-opcional), [fijar/cambiar/retirar](../../../openspec/specs/tasks/spec.md#requirement-fijar-cambiar-y-retirar-la-fecha-de-vencimiento), [cuándo está vencida](../../../openspec/specs/tasks/spec.md#requirement-cuándo-una-tarea-está-vencida), [el día de referencia lo pone quien mira](../../../openspec/specs/tasks/spec.md#requirement-el-día-de-referencia-lo-pone-quien-mira), [la lista no lo incluye](../../../openspec/specs/tasks/spec.md#requirement-la-lista-no-lleva-el-vencimiento).
- **Sesión:** [las tareas exigen sesión](../../../openspec/specs/tasks/spec.md#requirement-las-tareas-exigen-sesión) para listar, crear, consultar y cambiar cualquier tarea.
- **Interfaz — lista:** [pantalla de la lista](../../../openspec/specs/tasks/spec.md#requirement-pantalla-de-la-lista-del-equipo), [espacio sin tareas](../../../openspec/specs/tasks/spec.md#requirement-el-espacio-sin-tareas), [crear desde la lista](../../../openspec/specs/tasks/spec.md#requirement-crear-una-tarea-desde-la-lista), [cambiar estado desde la fila](../../../openspec/specs/tasks/spec.md#requirement-cambiar-el-estado-desde-la-propia-fila), [una sola vista, sin presencia](../../../openspec/specs/tasks/spec.md#requirement-una-sola-vista-de-tareas-sin-señales-de-presencia).
- **Interfaz — filtro:** [el control](../../../openspec/specs/tasks/spec.md#requirement-el-control-para-acotar-la-lista), [en la URL, no guardado](../../../openspec/specs/tasks/spec.md#requirement-el-filtro-se-pide-en-la-dirección-de-la-lista), [una lista vacía no siempre significa lo mismo](../../../openspec/specs/tasks/spec.md#requirement-una-lista-sin-filas-no-significa-siempre-lo-mismo), [lo que sale de la vista no se pierde](../../../openspec/specs/tasks/spec.md#requirement-lo-que-sale-de-la-vista-no-se-pierde).
- **Interfaz — pantalla de una tarea:** [pantalla propia](../../../openspec/specs/tasks/spec.md#requirement-pantalla-de-una-tarea), [poner/quitar fecha ahí](../../../openspec/specs/tasks/spec.md#requirement-poner-y-quitar-la-fecha-desde-la-pantalla-de-la-tarea), [aviso de fecha inválida](../../../openspec/specs/tasks/spec.md#requirement-aviso-ante-una-fecha-que-no-vale), [señal de vencida](../../../openspec/specs/tasks/spec.md#requirement-la-señal-de-tarea-vencida), [sin fecha no se penaliza](../../../openspec/specs/tasks/spec.md#requirement-no-tener-fecha-no-se-penaliza).

## Cómo se prueba en local

Arranque (ver [`CLAUDE.md`](../../../CLAUDE.md) para la puesta a punto completa):

```bash
cd backend
npm run dev            # http://localhost:3333
```

**Automatizado.** La suite `functional` cubre hoy un único fichero de tasks, `tests/functional/tasks/assignee.spec.ts` (3 tests, sobre el requirement "Lo que cada tarea muestra de su responsable"); el resto de la capability no tiene tests todavía.

```bash
node ace test --files=assignee   # solo ese fichero
node ace test functional         # toda la suite functional (incluye auth)
```

Cada test aísla sus escrituras con `testUtils.db().withGlobalTransaction()`: sin eso, las suites functional escriben sobre el mismo `tmp/db.sqlite3` que usa `npm run dev` (ver la nota de `CLAUDE.md` sobre la base de datos en tests).

**Manual, contra la API real.** Con el backend arrancado y un token de `POST /api/v1/auth/login` o `/signup`:

```bash
TOKEN="..." # token de login/signup

# Crear
curl -s -X POST http://localhost:3333/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Revisar el informe"}'

# Listar (por defecto, pendientes + en curso)
curl -s http://localhost:3333/api/v1/tasks -H "Authorization: Bearer $TOKEN"

# Acotar por estado
curl -s "http://localhost:3333/api/v1/tasks?status=done" -H "Authorization: Bearer $TOKEN"

# Cambiar estado
curl -s -X PATCH http://localhost:3333/api/v1/tasks/1/status \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'

# Consultar una tarea (today es obligatorio)
curl -s "http://localhost:3333/api/v1/tasks/1?today=2026-09-07" -H "Authorization: Bearer $TOKEN"

# Fijar fecha de vencimiento
curl -s -X PUT http://localhost:3333/api/v1/tasks/1/due-date \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"dueDate":"2026-09-30","today":"2026-09-07"}'
```

O explorando desde `http://localhost:3333/api` (Scalar), que trae ya el body y las respuestas de cada endpoint tipadas.

**Interfaz.** Con el backend arrancado, `cd frontend && npm run dev` (`http://localhost:5173`), inicia sesión y entra en `/tasks` (lista) o `/tasks/:id` (una tarea). No hay runner de tests en el frontend; se verifica a mano.
