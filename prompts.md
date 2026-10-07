
---

**Fecha y hora:** 2026-10-06 17:34:03 CST · **Herramienta:** Claude Code · **Modelo:** claude-opus-5-5 · **Esfuerzo:** por defecto · **Sesión:** `895c9f1d-0799-41f8-a3bd-ffeffd8119df`

## Prompt # 1

<pasted_content id="1c5b">
Crea un Hook que permita guardar todos y cada uno de los prompts que te solicitaré en esta sesión, incluyendo este prompt y en adelante. 
Cada una de los prompts  deberán tener la siguiente información:  
    (Primera línea) - Fecha y Hora de Solicitud, Herramienta (Claude, Cursor, etc), Modelo (LLM), Nivel de Esfuerzo, ID de Sesión. 
    (Segunda línea) - Titulo, ejemplo "Prompt # 1", por cada petición se incrementa el secuencial.
El hook también deberá guardar todas y cada una de las respuestas que me des en esta sesión, incluyendo la respuesta de este prompt y en adelante. 
Cada respuesta deberá tener la siguiente información:  
    (Primera línea) - Titulo, ejemplo "Respuesta a Prompt # 1", por cada petición se incrementa el secuencial.
El hook deberá guardar la información en el archivo "prompts.md" en la raíz del proyecto, si el archivo no existe, se crea, si existe, no borra el contenido sino agrega información a la ya existente.
El archivo "prompts.md" deberá tener un formato tipo Markdown.
</pasted_content id="1c5b">

## Respuesta a Prompt # 1

`prompts.md` ya existe. Lo miro antes de añadirle nada.

Está vacío (y versionado), así que lo uso tal cual. Ahora escribo el script del hook.

Ahora registro los dos hooks en `.claude/settings.json`.

Lo pruebo contra una copia de `prompts.md` y el transcript real de esta sesión:

Ya está montado: desde ahora cada prompt y cada respuesta se van añadiendo al final de `prompts.md`, en la raíz del proyecto.

**Cómo funciona:**
- El script es `.claude/hooks/registrar-prompts.sh` y está registrado en `.claude/settings.json` para dos eventos:
  - **`UserPromptSubmit`**: cada vez que envías un mensaje, guarda una línea con fecha y hora, herramienta (Claude Code), modelo, nivel de esfuerzo e ID de sesión. Debajo pone el título `## Prompt # N` y el texto de tu mensaje.
  - **`Stop`**: cuando termino de responder, guarda `## Respuesta a Prompt # N` con todo el texto que te he escrito en ese turno, sacado del transcript de la sesión.
- El número `N` se calcula a partir del último `Prompt #` que ya hay en el fichero, así que la cuenta sigue aunque cambies de sesión.
- El fichero solo crece: si no existe se crea, y si existe se escribe al final. Si un turno termina más de una vez, la respuesta no se duplica.
- El hook nunca bloquea tus prompts.

**Dos limitaciones:**
- **El nivel de esfuerzo sale como "por defecto".** El hook no recibe el esfuerzo de la sesión: lo busca en la variable `CLAUDE_CODE_EFFORT_LEVEL` o en `effortLevel` de los ficheros de settings, y ahora mismo no está en ninguno de los dos sitios.
- **Solo se guarda texto.** Las llamadas a herramientas y sus resultados no entran en `prompts.md`, solo lo que te escribo. Los prompts se guardan tal cual llegan, así que el texto que pegas aparece con sus etiquetas `<pasted_content>` alrededor.

**No he hecho commit.** La respuesta de este turno se añade a `prompts.md` justo cuando termino, así que un commit ahora quedaría incompleto. Además, `.claude/settings.json` ya tenía cambios de fin de línea (CRLF) en todo el fichero antes de que yo lo tocara, y entrarían en el mismo commit. Si quieres que lo haga, dímelo en el próximo prompt.

---

**Fecha y hora:** 2026-10-06 17:36:33 CST · **Herramienta:** Claude Code · **Modelo:** claude-opus-5-5 · **Esfuerzo:** por defecto · **Sesión:** `895c9f1d-0799-41f8-a3bd-ffeffd8119df`

## Prompt # 2

haz el commit

## Respuesta a Prompt # 2

Hecho: commit `efbabac` en la rama `motor-jccc` con `chore(claude): hook que registra prompts y respuestas en prompts.md`. El hook de seguridad de los commits lo dejó pasar.

Incluye:
- **El script nuevo:** `.claude/hooks/registrar-prompts.sh`.
- **`.claude/settings.json`:** los hooks `UserPromptSubmit` y `Stop`. También entra el cambio de fin de línea que el fichero ya tenía antes de que yo lo tocara.
- **`prompts.md`:** queda solo con lo que va escribiendo el hook, como elegiste, y la plantilla del ejercicio se ha quitado.

**Hay que reiniciar la sesión para que el registro empiece a funcionar.** Claude Code no recargó `settings.json` en caliente: en `prompts.md` no está la respuesta al prompt 1 ni este último prompt. Eso tampoco se podrá recuperar con el hook, porque cuando arranque solo registrará lo que venga después.

No he tocado `.claude/hooks/datos-que-no-salen.sh`, que ya estaba modificado antes de empezar y sigue sin commitear.

---

**Fecha y hora:** 2026-10-06 17:41:02 CST · **Herramienta:** Claude Code · **Modelo:** claude-opus-5-5 · **Esfuerzo:** por defecto · **Sesión:** `895c9f1d-0799-41f8-a3bd-ffeffd8119df`

## Prompt # 3

Registra las respuestas que me has dado previamente en esta sesion en el archivo prompts.md

## Respuesta a Prompt # 3

`prompts.md` ya tiene registradas las respuestas de esta sesión, sacadas del transcript:

- **Respuesta a Prompt # 1**, la de la creación del hook.
- **Prompt # 2** ("haz el commit") y su respuesta.
- **Prompt # 3**, este, y esta misma respuesta.

Como la sesión todavía no tiene el hook activo, la fecha y hora de cada prompt es la del transcript. El esfuerzo sale como "por defecto", igual que lo escribiría el hook. La primera pregunta, sobre qué hace `UserPromptSubmit`, no la he añadido: es anterior al prompt que pidió el registro "incluyendo este prompt y en adelante". Si la quieres, dímelo.

No he hecho commit de este cambio. Además, para que el registro sea automático hay que reiniciar la sesión.

---

**Fecha y hora:** 2026-10-06 17:47:04 CST · **Herramienta:** Claude Code · **Modelo:** desconocido · **Esfuerzo:** por defecto · **Sesión:** `34dc59ee-852d-4fe4-aaf2-62c6c789aa3d`

## Prompt # 4

que hooks tienes activos en esta sesion?

## Respuesta a Prompt # 4

En esta sesión hay 4 hooks activos. Todos están en `.claude/settings.json` del proyecto. Ni `.claude/settings.local.json` ni `~/.claude/settings.json` definen hooks, y `~/.claude/settings.local.json` no existe.

| Evento | Matcher | Qué hace |
|---|---|---|
| **PreToolUse** | `Bash` | Ejecuta `.claude/hooks/datos-que-no-salen.sh`. Revisa cada `git commit` (y lo que un `git add` del mismo comando mete en el índice). Lo bloquea si entran secretos con forma reconocible, correos de dominios que no sean `example.*` ni `github.com`, o ficheros `.env`. Cada bloqueo queda anotado en `docs/seguridad/registro-de-bloqueos.md`. |
| **UserPromptSubmit** | todos | Ejecuta `.claude/hooks/registrar-prompts.sh prompt`, que guarda cada prompt tuyo en `prompts.md`. |
| **Stop** | todos | Ejecuta `.claude/hooks/registrar-prompts.sh respuesta`, que guarda mis respuestas en `prompts.md` cuando termino cada turno. |
| **PostToolUse** | `Write\|Edit` | Si el fichero editado está bajo `frontend/`, le pasa Prettier (`prettier --write --ignore-unknown`). Si falla, no da error. |

Esta lista sale de los ficheros de settings. La configuración que realmente cargó la sesión puedes confirmarla con `/hooks`, que también enseña los hooks que añaden los plugins, si hay alguno.


---
---
---


# 📋 La tarea

## 🅰 Parte A: cambia el motor

---

**Fecha y hora:** 2026-10-06 17:57:00 CST · **Herramienta:** Claude Code · **Modelo:** claude-opus-5-5 · **Esfuerzo:** por defecto · **Sesión:** `34dc59ee-852d-4fe4-aaf2-62c6c789aa3d`

## Prompt # 5

<pasted_content id="2bec">
Dentro de este proyecto, migra el proyecto de SQLite a PostgreSQL corriendo en Docker, con dos bases de datos: una de desarrollo y otra de pruebas.

Las restricciones son estas, y no son negociables:

El fichero de Compose se llama compose.yaml y los dos servicios se llaman db y db-test.

La imagen es pgvector/pgvector:pg17. Es la imagen oficial de PostgreSQL con la extensión de vectores ya dentro.

Los puertos son 54410 para desarrollo y 54411 para pruebas. No el 5432.

La base de pruebas va en memoria, sin volumen. Es efímera a propósito: una batería de pruebas que depende de lo que dejó la anterior no es una batería de pruebas.

Los dos servicios llevan comprobación de salud, y el arranque espera a que estén sanos. La propia imagen avisa de que, la primera vez, crea la base y no acepta conexiones mientras tanto, y de que eso rompe a quien levanta varios contenedores a la vez.

Sin la clave version: en el fichero de Compose: está obsoleta y Docker imprime un aviso.

La batería de pruebas apunta a la otra base por su propio fichero de entorno, que el framework carga solo cuando el entorno es de pruebas.

Y deja atajos en el Makefile para levantar las bases, pararlas, migrar las dos y correr las pruebas.

Ninguna migración existente se toca. Si tu agente propone cambiar una, párate y anótalo: es un hallazgo, y de los buenos.
</pasted_content id="2bec">


## Respuesta a Prompt # 5

Voy a revisar el hook de datos antes de escribir credenciales y, después, a montar `compose.yaml` y la conexión `pg`.

Ahora el `compose.yaml`:

Las dos bases arrancan sanas y `db-test` no crea volumen. Ahora la configuración del backend:

Ahora migro las dos bases:

23 de 23 en verde. Compruebo que la batería ha ido de verdad contra `db-test` y no contra `db`:

Arreglado. Convierto la sonda en un test de regresión de verdad y borro la temporal:

El test falla sin el arreglo y pasa con él. Ahora el Makefile:

Del Makefile funciona todo: `db-down` → `test` (levanta las bases, migra la de pruebas desde vacío y deja 25 de 25 en verde) → `migrate`. Paso a typecheck, lint y documentación.

Typecheck y lint, limpios. Actualizo la documentación que hablaba de SQLite:

Compruebo que el check de OpenAPI de CI sigue pasando con las nuevas variables obligatorias y luego hago el commit.

Falla incluso con `.env`, y el error («Invalid URL» al cargar los metadatos del comando) no parece venir de la base de datos. Compruebo si ya fallaba antes de mis cambios:

`openapi:check` ya fallaba igual en `HEAD`, sin mis cambios, así que el fallo es previo y no lo toco. Preparo el commit con la skill del proyecto, solo con mis ficheros:

El proyecto ya corre sobre PostgreSQL en Docker, con una base de desarrollo y otra de pruebas. Está en el commit 8260120 de motor-jccc. La batería pasa entera (25 de 25), y he comprobado que va contra db-test y no toca la de desarrollo.

Restricciones cumplidas:
- Compose: compose.yaml con los servicios db (puerto 54410, con volumen) y db-test (puerto 54411, en memoria y sin volumen). Los dos usan pgvector/pgvector:pg17, no hay clave version: y docker compose config lo valida sin avisos.
- Comprobación de salud: los dos servicios la llevan, y make db-up hace docker compose up -d --wait, que no vuelve hasta que están sanos. La comprobación va por TCP (pg_isready -h 127.0.0.1) a propósito. La primera vez, la imagen crea la base con un servidor temporal que solo escucha por socket, así que un pg_isready por socket la daría por lista antes de que acepte conexiones.
- Pruebas: backend/.env.test redirige las variables DB_* a db-test. Lo he comprobado en el código de Adonis: ese fichero solo se carga con NODE_ENV=test, que es lo que pone node ace test.
- Makefile: atajos nuevos db-up, db-down, migrate (migra las dos bases) y test (migra la de pruebas, que llega vacía, y corre la batería). start ahora levanta antes las bases.
- Migraciones: ninguna se ha tocado ni ha hecho falta proponer un cambio. Se aplican tal cual en las dos bases, y el database/schema.ts que se regenera es idéntico al anterior.

Un fallo que la batería no veía, ya corregido: el driver de PostgreSQL devuelve las columnas date como objeto Date de JS, mientras que SQLite las daba como texto. Lo probé leyendo una tarea de vuelta desde la base:
- GET /tasks/:id devolvía "dueDate": "2026-08-21T00:00:00.000Z" en lugar de "2026-08-21".
- Ninguna tarea salía nunca vencida, porque isOverdueOn comparaba un Date con un texto.

Los tests no lo detectaban porque solo miraban la respuesta del PUT, que sale del modelo en memoria y no de la base. Lo he arreglado en config/database.ts, haciendo que el driver devuelva las fechas como texto, sin tocar ninguna migración. He añadido tests/functional/tasks/due_date.spec.ts, y he comprobado que falla sin el arreglo y pasa con él. Te puede servir para el punto 2 de HALLAZGOS.md; no lo he rellenado porque pide tus palabras. Para el punto 1: el cambio no modifica ninguna fila.

Otros cambios:
- Cambié la dependencia better-sqlite3 por pg y añadí @types/pg.
- Actualicé CLAUDE.md, docs/architecture.md, el README de tasks y un comentario de signup.spec.ts que todavía hablaban de SQLite.
- make clean ahora borra también el volumen de desarrollo (docker compose down -v), igual que antes borraba el fichero SQLite.

Pendiente:
- npm run openapi:check falla con «Invalid command exported from "openapi_check.js" file. Invalid URL». No lo provoca este cambio: falla igual sobre HEAD sin mis cambios, en un worktree temporal. Puede romper el workflow de CI.
- Casi todo el árbol de trabajo aparece modificado solo por finales de línea CRLF. Ese ruido ya estaba y lo he dejado fuera del commit; en los ficheros que he tocado solo va el cambio real.
- prompts.md, que escribe tu hook, tampoco va en el commit.
- No he abierto el PR ni he pasado el adversarial-reviewer; según CLAUDE.md eso va al cerrar la unidad de trabajo. Dime cuándo la das por terminada.

---

## 🅰 Parte B: averigua qué se ha perdido


---

**Fecha y hora:** 2026-10-06 18:29:01 CST · **Herramienta:** Claude Code · **Modelo:** claude-opus-5-5 · **Esfuerzo:** por defecto · **Sesión:** `34dc59ee-852d-4fe4-aaf2-62c6c789aa3d`

## Prompt # 6

## 1.- Corre la comprobación de tipos ((cd backend && npm run typecheck)) y di si está en verde o en rojo. Las dos respuestas son normales, y las dos enseñan algo.

## Respuesta a Prompt # 6

**En verde:** `tsc --noEmit` termina con código 0 y sin errores.

Que esté en verde no demuestra que el cambio de motor sea correcto. El fallo de `due_date` habría pasado igual esta comprobación. El esquema generado declara `dueDate: string | null` porque así lo fija `database/schema_rules.ts` (`tsType: 'string'`), y TypeScript se fía de esa declaración. El driver `pg` devolvía un `Date` en ejecución, y `tsc` no tiene forma de verlo: los tipos dicen lo que el código promete, no lo que la base de datos entrega. Ese fallo solo apareció al leer una tarea de vuelta desde la base, y por eso el test de regresión es lo que lo protege.

Sí estuvo en rojo durante la migración, justo después de instalar `pg`:

```
config/database.ts(1,16): error TS7016: Could not find a declaration file for module 'pg'.
config/database.ts(12,49): error TS7006: Parameter 'value' implicitly has an 'any' type.
```

Ese rojo sí apuntaba a algo real: `pg` no trae sus propios tipos, y sin ellos el parser de fechas habría quedado sin tipar. Se arregló añadiendo `@types/pg`. Así que el typecheck detecta lo que el código dice de sí mismo, pero no lo que la base de datos le devuelve.

---

**Fecha y hora:** 2026-10-06 18:31:50 CST · **Herramienta:** Claude Code · **Modelo:** claude-opus-5-5 · **Esfuerzo:** por defecto · **Sesión:** `34dc59ee-852d-4fe4-aaf2-62c6c789aa3d`

## Prompt # 7

## 2.- Mira el diff del fichero de tipos generado (backend/database/schema.ts) entre la rama de partida y lo que tienes ahora. Ninguna migración ha cambiado, y ese fichero sí. Di qué declaraciones han cambiado de tipo, y de qué a qué.

## Respuesta a Prompt # 7

La premisa no se cumple: **`backend/database/schema.ts` no ha cambiado**, así que ninguna declaración ha cambiado de tipo.

Lo he comprobado así:
- **Frente a la rama de partida:** `git diff s10/start -- backend/database/schema.ts` sale vacío. `s10/start` es ancestro de `motor-jccc`, y ningún commit entre las dos toca el fichero.
- **Regenerado otra vez:** acabo de correr `node ace migration:run` contra la base PostgreSQL, que vuelve a escribir el fichero, y el diff sigue vacío. No es que el fichero se haya quedado sin regenerar: el generador produce exactamente lo mismo a partir de las tablas de PostgreSQL que a partir de las de SQLite.
- **Frente a `main`:** ahí sí hay diff, pero viene de las ramas anteriores del curso (la tabla `tasks` y su `due_date`), no del cambio de motor.

Los tipos coinciden porque el generador los saca de categorías amplias, no de los tipos concretos del motor:
- `integer` y `serial` → `number`
- `varchar` y `text` → `string`
- `timestamp with time zone` (en PostgreSQL) y el `datetime` de SQLite → `DateTime`
- `due_date` y `status` no los infiere el generador: los fija `database/schema_rules.ts` (`string` y `'pending' | 'in_progress' | 'done'`), así que darían lo mismo con cualquier motor.

Esto conecta con lo anterior: el fichero de tipos declara `dueDate: string | null` tanto antes como después, pero en PostgreSQL ese valor llegaba como `Date` hasta que añadí el parser. El cambio de motor no aparece en los tipos generados; solo se ve al leer los valores en ejecución.

---

**Fecha y hora:** 2026-10-06 18:35:04 CST · **Herramienta:** Claude Code · **Modelo:** claude-opus-5-5 · **Esfuerzo:** por defecto · **Sesión:** `34dc59ee-852d-4fe4-aaf2-62c6c789aa3d`

## Prompt # 8

## 3.- Busca cómo decide el proyecto si una tarea está vencida y léelo con el diff delante. Hay un comentario en ese código que explica por qué la comparación funciona. Di si ese comentario sigue siendo verdad.

## Respuesta a Prompt # 8

Hoy el comentario es verdad, pero solo gracias a una línea de otro fichero que el comentario no menciona. Con el cambio de motor tal cual, sin esa línea, era falso.

**El código** (`app/models/task.ts:52`):

```ts
isOverdueOn(referenceDay: string): boolean {
  if (this.dueDate === null) return false
  return this.dueDate < referenceDay
}
```

El comentario dice: «Se compara texto contra texto porque dos fechas ISO comparadas así **son** la comparación de días del calendario: no hay hora, ni huso, ni instante intermedio donde se cuele un día de más».

**Con SQLite era verdad sin más.** `due_date` llegaba de la base como `'2026-08-21'`. `referenceDay` sale de `toCalendarDay()` (`yyyy-MM-dd`). Comparar dos textos con ese formato equivale a comparar días.

**Con solo cambiar el motor, era falso por partida doble:**
- **No era texto contra texto.** `pg` devolvía `due_date` como un `Date`. Con `Date < string`, JavaScript convierte el `Date` en número (milisegundos) y el texto `'2026-08-22'` en `NaN`. Cualquier comparación con `NaN` da `false`, así que **ninguna tarea salía vencida nunca**. No lanzaba ningún error.
- **Sí había hora y huso.** Ese `Date` era la medianoche del 21 en el huso del proceso Node. Funciona por casualidad porque `.env` fija `TZ=UTC`; con otro huso, el día se habría podido desplazar.

**Con el commit vuelve a ser verdad, pero por un motivo que no está en el comentario.** Lo sostiene `pg.types.setTypeParser(pg.types.builtins.DATE, …)` en `config/database.ts`. Ni el comentario ni los tipos generados lo reflejan: `schema.ts` declara `dueDate: string | null` con o sin esa línea, como vimos antes. Si alguien la borra, el comentario sigue sonando correcto, el typecheck sigue en verde y vuelve el fallo. Lo único que lo detectaría es `tests/functional/tasks/due_date.spec.ts`.

**Una discrepancia más en el mismo comentario, sin relación con el motor.** Dice «Tres condiciones y ninguna más: hay fecha, esa fecha es anterior al día de referencia, y la tarea no está hecha». El método solo comprueba las dos primeras, porque no mira `status`. `TaskDetailTransformer` tampoco lo filtra: llama a `isOverdueOn` sin más. Según el comentario, una tarea `done` con fecha pasada no debería salir vencida, pero hoy sí sale. Esto ya estaba así antes de la migración.

Si quieres, actualizo el comentario para que diga de qué depende. Lo de `status` lo dejo a tu decisión: hay que mirar la spec para saber si se equivoca el código o el comentario.

---

**Fecha y hora:** 2026-10-06 18:40:48 CST · **Herramienta:** Claude Code · **Modelo:** claude-opus-5-5 · **Esfuerzo:** por defecto · **Sesión:** `34dc59ee-852d-4fe4-aaf2-62c6c789aa3d`

## Prompt # 9

actualiza el comentario para que diga de qué depende

## Respuesta a Prompt # 9

He actualizado el comentario y está en el commit `e29baff`. Al párrafo de «texto contra texto» de `app/models/task.ts` le he añadido esto:

```ts
   * Que `dueDate` sea texto cuando viene de la base **no** lo garantiza el tipo:
   * lo garantiza el parser de `DATE` que registra `config/database.ts`. Sin él,
   * el driver `pg` entrega un `Date`, `Date < string` compara contra `NaN` y
   * esto devuelve siempre `false` sin lanzar nada, con el typecheck en verde.
   * Quien lo vigila es `tests/functional/tasks/due_date.spec.ts`.
```

Solo cambia el comentario, no el código. Lint y Prettier pasan.

No he tocado la otra discrepancia del mismo comentario: dice que una tarea hecha no cuenta como vencida, pero el método no mira `status`. Esa decisión sigue siendo tuya.

---

**Fecha y hora:** 2026-10-06 18:43:07 CST · **Herramienta:** Claude Code · **Modelo:** claude-opus-5-5 · **Esfuerzo:** por defecto · **Sesión:** `34dc59ee-852d-4fe4-aaf2-62c6c789aa3d`

## Prompt # 10

## Cuántas filas cambian de valor en tu cambio de esquema, medido con una consulta, y en qué rama del árbol de reversibilidad cae. Si tu migración no toca datos, dilo tal cual: también es una respuesta.

## Respuesta a Prompt # 10

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

---

**Fecha y hora:** 2026-10-06 18:48:03 CST · **Herramienta:** Claude Code · **Modelo:** claude-opus-5-5 · **Esfuerzo:** por defecto · **Sesión:** `34dc59ee-852d-4fe4-aaf2-62c6c789aa3d`

## Prompt # 11

Una cosa que la batería de pruebas no podía ver. Si no encontraste ninguna, escribe qué buscaste y dónde.

## Respuesta a Prompt # 11

Sí encontré una: **la fecha de vencimiento leída de vuelta desde PostgreSQL**.

**Qué pasaba:** el driver `pg` convierte las columnas `date` en un `Date` de JS. Por eso, al pedir una tarea con `GET /api/v1/tasks/:id`, la API devolvía `"dueDate": "2026-08-21T00:00:00.000Z"` en lugar de `"2026-08-21"`. Además, `isOverdueOn` comparaba un `Date` con un texto, eso da `NaN`, y una tarea con vencimiento el 21 consultada el 22 salía con `isOverdue: false`. **Ninguna tarea salía vencida nunca.**

**Por qué la batería no podía verlo:**
- **Ningún test leía la fecha desde la base.** El único test de `tasks` (`assignee.spec.ts`) no usa fechas. Las respuestas que devuelven fecha al guardarla salen del modelo en memoria, donde `dueDate` sigue siendo el texto que puso el controlador.
- **Los tipos no lo reflejan.** `schema.ts` declara `dueDate: string | null` porque así lo fija `schema_rules.ts`, con cualquier motor. El typecheck seguía en verde y el diff de `schema.ts` salía vacío.
- **El fallo no lanzaba nada.** `Date < string` devuelve `false` sin dar error.

Lo detecté con una sonda temporal: crear una tarea, ponerle vencimiento, volver a leerla con `GET` y mirar qué traía el modelo. Ahora lo cubre `tests/functional/tasks/due_date.spec.ts`, que **falla sin el parser** de `config/database.ts` y pasa con él.

Una línea posible para `HALLAZGOS.md`:

> Con `pg`, `due_date` vuelve de la base como `Date` y no como texto: la API devolvía un instante y `isOverdueOn` (`Date < string` → `NaN`) nunca marcaba una tarea vencida; ningún test leía la fecha de la base, `schema.ts` seguía diciendo `string` y el typecheck salía en verde.

---

**Fecha y hora:** 2026-10-06 18:50:35 CST · **Herramienta:** Claude Code · **Modelo:** claude-opus-5-5 · **Esfuerzo:** por defecto · **Sesión:** `34dc59ee-852d-4fe4-aaf2-62c6c789aa3d`

## Prompt # 12

De qué dudaste, o qué no pudiste comprobar. Esta es la que más sirve en el directo.

## Respuesta a Prompt # 12

Esto es de lo que dudé o no pude comprobar, ordenado por lo que más pesa:

1. **No pude comprobar el job de OpenAPI en CI.** `npm run openapi:check` falla con «Invalid command exported from "openapi_check.js" file. Invalid URL», y falla igual sobre `HEAD` sin mis cambios. Mi cambio añade variables `DB_*` obligatorias. Supongo que CI las recibe porque fija `NODE_ENV=test` y `backend/.env.test` está versionado, pero solo lo he deducido leyendo el loader de `@adonisjs/env`: no lo he visto funcionar.

2. **El fallo de la comprobación de salud lo razoné, pero no lo reproduje.** Que `pg_isready` por socket dé la base por lista mientras el entrypoint aún la está creando lo deduje de cómo arranca la imagen. Sí vi que `--wait` funciona y que `make test` migra bien tras un `db-down` (base nueva cada vez). Pero no vi fallar la versión por socket, así que no he demostrado que mi versión arregle algo que de verdad rompía.

3. **El arreglo de `due_date` sirve para todas las columnas `date` del proceso, no solo para esa.** Hoy no hay otra columna `date`, pero cualquier columna futura de ese tipo llegará como texto aunque quien la escriba espere un `Date`. Tampoco probé las columnas `timestamptz` con un huso distinto de UTC. `.env` fija `TZ=UTC`, pero en CI, donde no hay `.env`, el huso es el del runner.

4. **No sé si había que traer los datos.** Las 4 cuentas y los 4 tokens de `tmp/db.sqlite3` se quedaron en SQLite. Lo di por bueno porque son datos de desarrollo y nadie pidió conservarlos, pero no lo pregunté. Por eso «0 filas cambian» es cierto en parte porque no se movió ninguna.

5. **No sé si se equivoca el código o el comentario.** El comentario de `isOverdueOn` dice que una tarea hecha no cuenta como vencida, y el código no mira `status`. No consulté la spec.

6. **No lo probé de punta a punta.** No arranqué el frontend contra el backend nuevo, no ejecuté `make setup` desde un clon limpio y no corrí `make clean`. Mi verificación son los 25 tests y la sonda contra la API.

7. **Hice una suposición sobre los finales de línea.** Casi todo el árbol aparecía modificado solo por CRLF. Supuse que la versión buena es la de `HEAD` (LF) y normalicé a LF los ficheros que toqué, sin averiguar de dónde venía el ruido.

8. **No pude clasificar el cambio en el árbol de reversibilidad**, porque ese árbol no está definido en el repo.

Una línea posible para `HALLAZGOS.md`, con lo que más sirve para el directo:

> No pude verificar que el job de OpenAPI de CI siga en verde con las variables `DB_*` nuevas (el comando ya fallaba antes del cambio), ni vi fallar el `pg_isready` por socket que la comprobación de salud por TCP pretende evitar: las dos cosas las deduje leyendo código, no las observé.

---

**Fecha y hora:** 2026-10-06 18:55:31 CST · **Herramienta:** Claude Code · **Modelo:** claude-opus-5-5 · **Esfuerzo:** por defecto · **Sesión:** `34dc59ee-852d-4fe4-aaf2-62c6c789aa3d`

## Prompt # 13

en qué rama estas?


## Respuesta a Prompt # 13

Estoy en **`motor-jccc`**, la rama de entrega del ejercicio. Mis dos commits están ahí, encima de `efbabac`:

- `e29baff` — el comentario de `isOverdueOn`
- `8260120` — la migración a PostgreSQL

La rama no tiene upstream configurado, así que estos commits todavía no están en tu fork.

---

**Fecha y hora:** 2026-10-06 18:56:51 CST · **Herramienta:** Claude Code · **Modelo:** claude-opus-5-5 · **Esfuerzo:** por defecto · **Sesión:** `34dc59ee-852d-4fe4-aaf2-62c6c789aa3d`

## Prompt # 14

muestra los archivos que no se incluido en un commit?


## Respuesta a Prompt # 14

Hay 220 ficheros modificados sin commitear y uno sin versionar, pero solo **2 traen cambios de contenido**. Los otros 218 difieren únicamente en los finales de línea (CRLF frente a LF).

**Con cambios reales:**

| Fichero | Qué tiene |
|---|---|
| `prompts.md` | +408 líneas: lo que va registrando tu hook `registrar-prompts.sh` en cada turno. |
| `HALLAZGOS.md` | +61 líneas: mis respuestas a los tres puntos, copiadas enteras. Yo no he escrito en este fichero, así que lo ha rellenado otra persona o algún proceso. |

**Sin versionar:**
- `.claude/settings.local.json`: tus permisos locales y la activación del MCP de Atlassian. Lo normal es que no se versione.

**Solo finales de línea (218 ficheros):** `.claude/`, `.github/`, casi todo `backend/`, `docs/`, el frontend, etc. No traen ningún cambio de contenido; es el ruido que ya estaba al empezar la sesión.


---

**Fecha y hora:** 2026-10-06 18:58:49 CST · **Herramienta:** Claude Code · **Modelo:** claude-opus-5-5 · **Esfuerzo:** por defecto · **Sesión:** `34dc59ee-852d-4fe4-aaf2-62c6c789aa3d`

## Prompt # 15

commitea HALLAZGOS.md y prompts.md

