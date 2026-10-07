# Hallazgos

Aquí van **las tres líneas** del ejercicio, una por cada punto de abajo. Es lo único que hay que
traer hecho: un cambio de motor a medias con estas tres líneas escritas vale más que lo contrario,
porque lo que se discute en el directo es dónde te chocaste.

Escribe **una sola línea por punto**, con tus palabras y con lo que mediste, no con lo que suponías.

## 1. Las filas que cambian y la rama

## Cuántas filas cambian de valor en tu cambio de esquema, medido con una consulta, y en qué rama del árbol de reversibilidad cae. Si tu migración no toca datos, dilo tal cual: también es una respuesta.

**Cero filas cambian de valor: este cambio no toca datos.** No añade ninguna migración, no modifica las existentes, y la base PostgreSQL se ha creado vacía, aplicando las cuatro migraciones de siempre desde cero.

Lo he medido con estas consultas:

| | `users` | `auth_access_tokens` | `tasks` | `adonis_schema` |
|---|---|---|---|---|
| SQLite antiguo (`tmp/db.sqlite3`, abierto en solo lectura) | 4 | 4 | 0 | 4 |
| PostgreSQL de desarrollo (`flowsync_dev`) | 0 | 0 | 0 | 4 |

En PostgreSQL, `adonis_schema` registra las cuatro migraciones de siempre, todas en el lote 1, y ninguna nueva.

En la tabla se ve algo que conviene anotar: **las filas no han cambiado, pero tampoco se han traído**. Las 4 cuentas y los 4 tokens del SQLite de desarrollo no están en PostgreSQL, porque no he copiado datos de un motor al otro. No se han perdido: `tmp/db.sqlite3` sigue en disco y sin tocar. Además, `tasks` estaba vacía, así que ninguna fila con `due_date` pasó por la conversión de tipo que vimos antes.

**Sobre la rama del árbol de reversibilidad:** ese árbol no está definido en el repo; solo se menciona en `README.md` y `HALLAZGOS.md`. Imagino que viene de la lección, así que no voy a inventar el nombre de sus ramas. Para que la ubiques tú:
- No hay ninguna transformación de datos que deshacer.
- El origen sigue intacto: volver atrás es revertir los commits `8260120` y `e29baff`, y el SQLite sigue donde estaba.
- No se ha borrado ni sobrescrito nada.

**No he tocado `backups/produccion-2026-10-02.dump`.** Es un volcado de PostgreSQL, y el commit que lo trajo dice que es para otro ejercicio (la Demo 3) y que «no se abre, se carga seudonimizada». Contar filas sobre esos datos queda fuera de esta pregunta.

## 2. Lo que la batería de pruebas no podía ver

## Una cosa que la batería de pruebas no podía ver. Si no encontraste ninguna, escribe qué buscaste y dónde.

Sí encontré una: **la fecha de vencimiento leída de vuelta desde PostgreSQL**.

**Qué pasaba:** el driver `pg` convierte las columnas `date` en un `Date` de JS. Por eso, al pedir una tarea con `GET /api/v1/tasks/:id`, la API devolvía `"dueDate": "2026-08-21T00:00:00.000Z"` en lugar de `"2026-08-21"`. Además, `isOverdueOn` comparaba un `Date` con un texto, eso da `NaN`, y una tarea con vencimiento el 21 consultada el 22 salía con `isOverdue: false`. **Ninguna tarea salía vencida nunca.**

**Por qué la batería no podía verlo:**
- **Ningún test leía la fecha desde la base.** El único test de `tasks` (`assignee.spec.ts`) no usa fechas. Las respuestas que devuelven fecha al guardarla salen del modelo en memoria, donde `dueDate` sigue siendo el texto que puso el controlador.
- **Los tipos no lo reflejan.** `schema.ts` declara `dueDate: string | null` porque así lo fija `schema_rules.ts`, con cualquier motor. El typecheck seguía en verde y el diff de `schema.ts` salía vacío.
- **El fallo no lanzaba nada.** `Date < string` devuelve `false` sin dar error.

Lo detecté con una sonda temporal: crear una tarea, ponerle vencimiento, volver a leerla con `GET` y mirar qué traía el modelo. Ahora lo cubre `tests/functional/tasks/due_date.spec.ts`, que **falla sin el parser** de `config/database.ts` y pasa con él.

> Con `pg`, `due_date` vuelve de la base como `Date` y no como texto: la API devolvía un instante y `isOverdueOn` (`Date < string` → `NaN`) nunca marcaba una tarea vencida; ningún test leía la fecha de la base, `schema.ts` seguía diciendo `string` y el typecheck salía en verde.

## 3. Tu duda

## De qué dudaste, o qué no pudiste comprobar.

Esto es de lo que dudé o no pude comprobar, ordenado por lo que más pesa:

1. **No pude comprobar el job de OpenAPI en CI.** `npm run openapi:check` falla con «Invalid command exported from "openapi_check.js" file. Invalid URL», y falla igual sobre `HEAD` sin mis cambios. Mi cambio añade variables `DB_*` obligatorias. Supongo que CI las recibe porque fija `NODE_ENV=test` y `backend/.env.test` está versionado, pero solo lo he deducido leyendo el loader de `@adonisjs/env`: no lo he visto funcionar.

2. **El fallo de la comprobación de salud lo razoné, pero no lo reproduje.** Que `pg_isready` por socket dé la base por lista mientras el entrypoint aún la está creando lo deduje de cómo arranca la imagen. Sí vi que `--wait` funciona y que `make test` migra bien tras un `db-down` (base nueva cada vez). Pero no vi fallar la versión por socket, así que no he demostrado que mi versión arregle algo que de verdad rompía.

3. **El arreglo de `due_date` sirve para todas las columnas `date` del proceso, no solo para esa.** Hoy no hay otra columna `date`, pero cualquier columna futura de ese tipo llegará como texto aunque quien la escriba espere un `Date`. Tampoco probé las columnas `timestamptz` con un huso distinto de UTC. `.env` fija `TZ=UTC`, pero en CI, donde no hay `.env`, el huso es el del runner.

4. **No sé si había que traer los datos.** Las 4 cuentas y los 4 tokens de `tmp/db.sqlite3` se quedaron en SQLite. Lo di por bueno porque son datos de desarrollo y nadie pidió conservarlos, pero no lo pregunté. Por eso «0 filas cambian» es cierto en parte porque no se movió ninguna.

5. **No sé si se equivoca el código o el comentario.** El comentario de `isOverdueOn` dice que una tarea hecha no cuenta como vencida, y el código no mira `status`. No consulté la spec.

6. **No lo probé de punta a punta.** No arranqué el frontend contra el backend nuevo, no ejecuté `make setup` desde un clon limpio y no corrí `make clean`. Mi verificación son los 25 tests y la sonda contra la API.

7. **Hice una suposición sobre los finales de línea.** Casi todo el árbol aparecía modificado solo por CRLF. Supuse que la versión buena es la de `HEAD` (LF) y normalicé a LF los ficheros que toqué, sin averiguar de dónde venía el ruido.

8. **No pude clasificar el cambio en el árbol de reversibilidad**, porque ese árbol no está definido en el repo.

> No pude verificar que el job de OpenAPI de CI siga en verde con las variables `DB_*` nuevas (el comando ya fallaba antes del cambio), ni vi fallar el `pg_isready` por socket que la comprobación de salud por TCP pretende evitar: las dos cosas las deduje leyendo código, no las observé.

