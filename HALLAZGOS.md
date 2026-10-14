# Hallazgos

Las tres líneas del ejercicio de tests sobre el requisito «Cuándo una tarea está vencida» de
`openspec/specs/tasks/spec.md`, una por punto, con lo medido en pantalla (`make test-e2e` y
`make test-unit`) y no con lo supuesto.

## 1. Cuántos casos nuevos fallaron y cuántos de los que ya había siguieron en verde

- Fallaron 5 de mis 13 casos nuevos: 3 de 7 en `make test-e2e` («Tests 44 passed, 3 failed (47)») y 2 de 6 en `make test-unit` («Tests 4 passed, 2 failed (6)»). Los 40 tests que ya había, todos funcionales porque `tests/unit/` no existía, siguieron en verde.

## 2. Cuál de mis casos nuevos pasó y por qué

- Pasaron 8 casos: «vencer hoy», «fecha futura», «sin fecha» y «aplazar» por HTTP, y en la unitaria fecha anterior, igual, posterior y sin fecha. Todos los rojos tienen una de dos cosas en común: la tarea está `done`, porque `isOverdueOn` no mira el estado, o se espera `true` sobre una fecha releída de la base, que `pg` entrega como `Date` y no como texto, y `Date < 'AAAA-MM-DD'` da siempre `false`. Por eso pasa lo que se resuelve con la fecha recién escrita como texto y sin `done` de por medio («aplazar» va entero por respuestas del `PUT`; en la unitaria, con texto, el `<` estricto funciona). Y pasa también, sin medir nada, toda comprobación de que el `GET` dice `false`: el `GET` dice `false` siempre. La prueba de esto es mi primera versión, que solo miraba el `GET`: dio 1 rojo de 7, con «darla por hecha» y «tarea hecha» en verde, porque el fallo del `Date` tapaba el de `done`.

## 3. De qué dudé o qué no pude comprobar

- Dudé si era legítimo reforzar los tests después de verlos casi verdes (pasar a comprobar `isOverdue` en el `PUT` además del `GET`, como ya hace `assignee.spec.ts` con sus dos caminos). Por HTTP no pude comprobar que «darla por hecha» deja de vencer, porque falla antes, en la precondición de que el `GET` la marque vencida, y el `PATCH /status` no devuelve `isOverdue`; esa regla solo queda medida en la unitaria. «Creada hace semanas» exigió cambiar `created_at` directamente en la base, porque no hay ruta para hacerlo. No pude contrastar con datos reales: el MCP `dbhub` no conectaba y todo se midió en `db-test`, y el `Date` de medianoche local (`T06:00:00Z` en mi huso) lo vi solo en CST.
