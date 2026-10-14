import Task, { type TaskStatus } from '#models/task'
import { test } from '@japa/runner'

/**
 * La regla de «Cuándo una tarea está vencida» de `openspec/specs/tasks/spec.md`,
 * llamada directamente: `Task#isOverdueOn`, sin servidor y sin base de datos. La
 * tarea es un modelo en memoria que nunca se guarda.
 *
 * Vencida si, y solo si, tiene fecha, esa fecha es **anterior** al día de
 * referencia y su estado no es `done`.
 *
 * El día de referencia es siempre un literal: nada de la fecha de hoy ni de
 * ningún reloj.
 */
test.group('Task | isOverdueOn', () => {
  const DIA_DE_REFERENCIA = '2026-08-20'
  const DIA_ANTERIOR = '2026-08-19'
  const DIA_POSTERIOR = '2026-08-21'
  const FECHA_PASADA = '2026-07-01'

  /** Una tarea en memoria con la fecha y el estado dados. No toca la base. */
  function tarea(dueDate: Task['dueDate'], status: TaskStatus = 'pending') {
    const task = new Task()
    task.merge({ title: 'Revisar el informe', status, dueDate })
    return task
  }

  test('fecha anterior al día de referencia y sin hacer: vencida', ({ assert }) => {
    assert.isTrue(tarea(DIA_ANTERIOR).isOverdueOn(DIA_DE_REFERENCIA))
  })

  test('fecha igual al día de referencia: todavía no vencida', ({ assert }) => {
    assert.isFalse(tarea(DIA_DE_REFERENCIA).isOverdueOn(DIA_DE_REFERENCIA))
  })

  test('fecha posterior al día de referencia: no vencida', ({ assert }) => {
    assert.isFalse(tarea(DIA_POSTERIOR).isOverdueOn(DIA_DE_REFERENCIA))
  })

  test('sin fecha: no vencida', ({ assert }) => {
    assert.isFalse(tarea(null).isOverdueOn(DIA_DE_REFERENCIA))
  })

  test('ya hecha con la fecha pasada: no vencida', ({ assert }) => {
    assert.isFalse(tarea(FECHA_PASADA, 'done').isOverdueOn(DIA_DE_REFERENCIA))
  })

  /**
   * No sale de la spec, sino de cómo llega el dato de verdad. El modelo declara
   * `dueDate` como texto, y es texto cuando lo acaba de escribir el controlador.
   * Pero cuando la tarea se lee de la base, el driver `pg` convierte la columna
   * `date` en un objeto `Date` a medianoche **local** de ese día. Es lo que hace
   * `new Date(año, mesDesdeCero, día)` con números fijos, que no consulta el
   * reloj. La regla tiene que decir lo mismo en los dos casos.
   */
  test('da lo mismo con la fecha como texto que como objeto Date', ({ assert }) => {
    const comoLaLeePg: Record<string, Date> = {
      [DIA_ANTERIOR]: new Date(2026, 7, 19),
      [DIA_DE_REFERENCIA]: new Date(2026, 7, 20),
      [DIA_POSTERIOR]: new Date(2026, 7, 21),
    }

    const conTexto: Record<string, boolean> = {}
    const conDate: Record<string, boolean> = {}

    for (const [dia, fecha] of Object.entries(comoLaLeePg)) {
      conTexto[dia] = tarea(dia).isOverdueOn(DIA_DE_REFERENCIA)
      conDate[dia] = tarea(fecha as unknown as string).isOverdueOn(DIA_DE_REFERENCIA)
    }

    // Primero lo que dice la regla con texto, para que la comparación de abajo no
    // dé por bueno que los dos caminos se equivoquen igual.
    assert.deepEqual(conTexto, {
      [DIA_ANTERIOR]: true,
      [DIA_DE_REFERENCIA]: false,
      [DIA_POSTERIOR]: false,
    })
    assert.deepEqual(conDate, conTexto)
  })
})
