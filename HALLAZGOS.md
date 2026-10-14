# Hallazgos

Las tres líneas del ejercicio de tests sobre el requisito «Cuándo una tarea está vencida» de
`openspec/specs/tasks/spec.md`, una por punto, con lo medido en pantalla (`make test-e2e` y
`make test-unit`) y no con lo supuesto.

## 1. Cuántos casos nuevos fallaron y cuántos de los que ya había siguieron en verde

- Tomando como base lo realizado en la Parte B, se crearon 6 nuevos tests evaluados con `make test-unit` de los cuales pasaron 4 y fallaron 2, el motivo principal fue la discrepancia entre los tipos de datos, adicional, aún cuando la respuesta era `true` eso no significaba que la operación se hubiera realizado realmente.

## 2. Cuál de mis casos nuevos pasó y por qué

- Pasaron 8 casos: «vencer hoy», «fecha futura», «sin fecha» y «aplazar» por HTTP, y en la unitaria fecha anterior, igual, posterior y sin fecha. 
- Todos los rojos tienen una de dos cosas en común: la tarea está `done`, porque `isOverdueOn` no mira el estado, o se espera `true` sobre una fecha releída de la base, que `pg` entrega como `Date` y no como texto, y `Date < 'AAAA-MM-DD'` da siempre `false`. Por eso pasa lo que se resuelve con la fecha recién escrita como texto y sin `done` de por medio («aplazar» va entero por respuestas del `PUT`; en la unitaria, con texto, el `<` estricto funciona). Y pasa también, sin medir nada, toda comprobación de que el `GET` dice `false`: el `GET` dice `false` siempre. 

## 3. De qué dudé o qué no pude comprobar

- Considero que después de ver los tests nuevos y su resultado, es importante reforzarlos, sin embargo, habia una restriccion de no tocar la implementación, lo cual es un stopper. 
- Un tema importante es que probar una petición por HTTP y recibir una respuesta con un estatus esperado, no significa que la petición se haya realizado correctamente, por HTTP no se puede evaluar el resultado.
- Tomando como base mi comentario anterior, considero que se tendrían que ampliar las pruebas para evaluar realmente el resultado a nivel BDs y que los tests no se queden solamente con la respuesta del HTTP, sin emabrgo, esto ya no se pudo comprobar.