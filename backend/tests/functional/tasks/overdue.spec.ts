import User from '#models/user'
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Cuándo una tarea está vencida. Un test por cada scenario del requisito
 * «Cuándo una tarea está vencida» de `openspec/specs/tasks/spec.md`, entrando por
 * HTTP como entra el cliente y comprobando `isOverdue` en el cuerpo de la
 * respuesta.
 *
 * La regla: vencida si, y solo si, tiene fecha, esa fecha es **anterior** al día
 * de referencia y su estado no es `done`.
 *
 * `isOverdue` viaja en dos respuestas: la de `PUT /api/v1/tasks/:id/due-date`,
 * que devuelve la tarea ya resuelta contra el `today` enviado, y la de
 * `GET /api/v1/tasks/:id`. Cada scenario que fija una fecha se comprueba en las
 * dos. La primera tiene la fecha recién escrita y la segunda la que vuelve a
 * leerse de la base, y comprobar solo una dejaría la otra sin red.
 *
 * El día de referencia va siempre en la petición (`today`) y es un literal: nada
 * de la fecha de hoy ni de ningún reloj, para que el resultado no dependa del
 * día en que se ejecute la suite.
 */
test.group('Tasks | vencimiento', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const DIA_DE_REFERENCIA = '2026-08-20'
  const DIA_ANTERIOR = '2026-08-19'
  const DIA_POSTERIOR = '2026-08-21'
  const FECHA_PASADA = '2026-07-01'

  const con = (token: string) => ({ Authorization: `Bearer ${token}` })

  /**
   * Una cuenta con sesión y una tarea suya recién creada por la API. El
   * identificador es el que devuelve la creación, no uno supuesto.
   */
  async function tareaNueva(client: any) {
    const email = 'ada@example.com'
    await User.create({ fullName: 'Ada Lovelace', email, password: 'secreto123' })

    const login = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })
    const token = login.body().data.token as string

    const creada = await client
      .post('/api/v1/tasks')
      .headers(con(token))
      .json({ title: 'Revisar el informe' })
    creada.assertStatus(201)

    return { token, id: creada.body().data.id as number }
  }

  /** Fija la fecha de vencimiento y devuelve la tarea que trae la respuesta del cambio. */
  async function fijarFecha(client: any, token: string, id: number, dueDate: string | null) {
    const response = await client
      .put(`/api/v1/tasks/${id}/due-date`)
      .qs({ today: DIA_DE_REFERENCIA })
      .headers(con(token))
      .json({ dueDate })
    response.assertStatus(200)
    return response.body().data
  }

  async function cambiarEstado(client: any, token: string, id: number, status: string) {
    const response = await client
      .patch(`/api/v1/tasks/${id}/status`)
      .headers(con(token))
      .json({ status })
    response.assertStatus(200)
  }

  /** La tarea suelta tal y como la ve quien mira desde el día de referencia. */
  async function consultar(client: any, token: string, id: number) {
    const response = await client
      .get(`/api/v1/tasks/${id}`)
      .qs({ today: DIA_DE_REFERENCIA })
      .headers(con(token))
    response.assertStatus(200)
    return response.body().data
  }

  /**
   * Fija la fecha y devuelve `isOverdue` por los dos caminos. Se compara como un
   * solo objeto para que, si falla, la salida enseñe a la vez qué dijo cada uno.
   */
  async function vencidaAlFijarYAlConsultar(
    client: any,
    token: string,
    id: number,
    dueDate: string
  ) {
    const alFijar = await fijarFecha(client, token, id, dueDate)
    const alConsultar = await consultar(client, token, id)

    return { alFijar: alFijar.isOverdue, alConsultar: alConsultar.isOverdue }
  }

  test('fecha del día anterior: llega marcada como vencida', async ({ client, assert }) => {
    const { token, id } = await tareaNueva(client)

    const isOverdue = await vencidaAlFijarYAlConsultar(client, token, id, DIA_ANTERIOR)

    assert.deepEqual(isOverdue, { alFijar: true, alConsultar: true })
  })

  test('vencer hoy todavía no es estar vencida', async ({ client, assert }) => {
    const { token, id } = await tareaNueva(client)

    const isOverdue = await vencidaAlFijarYAlConsultar(client, token, id, DIA_DE_REFERENCIA)

    // `false` exacto: un campo que falte o llegue nulo no es «no vencida».
    assert.deepEqual(isOverdue, { alFijar: false, alConsultar: false })
  })

  test('fecha futura: no llega marcada como vencida', async ({ client, assert }) => {
    const { token, id } = await tareaNueva(client)

    const isOverdue = await vencidaAlFijarYAlConsultar(client, token, id, DIA_POSTERIOR)

    assert.deepEqual(isOverdue, { alFijar: false, alConsultar: false })
  })

  test('sin fecha no se vence nunca, por antigua que sea', async ({ client, assert }) => {
    const { token, id } = await tareaNueva(client)

    // «Creada hace semanas»: no hay ruta que cambie la fecha de creación, así que
    // se retrasa en la base, dentro de la transacción del test. Es un literal
    // siete semanas antes del día de referencia, no algo calculado desde el reloj.
    await db.from('tasks').where('id', id).update({ created_at: '2026-07-02T09:00:00Z' })

    const tarea = await consultar(client, token, id)

    assert.equal(tarea.status, 'pending')
    assert.isNull(tarea.dueDate)
    assert.isTrue(tarea.createdAt.startsWith('2026-07-02'))
    assert.isFalse(tarea.isOverdue)
  })

  test('darla por hecha la deja de vencer y conserva su fecha', async ({ client, assert }) => {
    const { token, id } = await tareaNueva(client)

    // Precondición: la tarea está vencida, por los dos caminos.
    const antes = await vencidaAlFijarYAlConsultar(client, token, id, FECHA_PASADA)
    assert.deepEqual(
      antes,
      { alFijar: true, alConsultar: true },
      'precondición: la tarea tendría que estar vencida'
    )
    const fechaAntes = (await consultar(client, token, id)).dueDate

    // `PATCH /status` responde con la forma de lista, sin `isOverdue`: el
    // vencimiento después del cambio solo se puede leer en la tarea suelta.
    await cambiarEstado(client, token, id, 'done')
    const despues = await consultar(client, token, id)

    assert.equal(despues.status, 'done')
    assert.isFalse(despues.isOverdue)
    assert.equal(despues.dueDate, fechaAntes)
  })

  test('una tarea hecha con la fecha pasada no llega vencida', async ({ client, assert }) => {
    const { token, id } = await tareaNueva(client)
    await cambiarEstado(client, token, id, 'done')

    const isOverdue = await vencidaAlFijarYAlConsultar(client, token, id, FECHA_PASADA)

    assert.deepEqual(isOverdue, { alFijar: false, alConsultar: false })
  })

  test('aplazar resuelve el vencimiento en la misma respuesta', async ({ client, assert }) => {
    const { token, id } = await tareaNueva(client)

    const vencida = await fijarFecha(client, token, id, FECHA_PASADA)
    assert.isTrue(vencida.isOverdue, 'precondición: la tarea tendría que estar vencida')

    const aplazada = await fijarFecha(client, token, id, DIA_POSTERIOR)

    assert.equal(aplazada.dueDate, DIA_POSTERIOR)
    assert.isFalse(aplazada.isOverdue)
  })
})
