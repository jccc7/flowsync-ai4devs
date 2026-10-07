import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * La fecha de vencimiento sobrevive al viaje a la base de datos como día del
 * calendario. Con SQLite era gratis; con PostgreSQL la columna es `date` y el
 * driver `pg` la devuelve como `Date` de JS salvo que se le diga lo contrario
 * (`config/database.ts`). Sin eso, la tarea leída de vuelta traía `dueDate`
 * como instante y nunca salía vencida, y ningún otro test lo veía porque todos
 * leen la respuesta del `PUT`, que sale del modelo en memoria y no de la base.
 */
test.group('Tasks | vencimiento leído de la base', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function tareaConVencimiento(client: any, dueDate: string) {
    await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })

    const login = await client
      .post('/api/v1/auth/login')
      .json({ email: 'ada@example.com', password: 'secreto123' })
    const token = login.body().data.token as string

    const creada = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title: 'Revisar el informe' })
    const id = creada.body().data.id as number

    await client
      .put(`/api/v1/tasks/${id}/due-date`)
      .header('Authorization', `Bearer ${token}`)
      .json({ dueDate, today: '2026-08-20' })

    return { id, token }
  }

  test('la tarea leída de nuevo trae el día tal cual, sin hora', async ({ client, assert }) => {
    const { id, token } = await tareaConVencimiento(client, '2026-08-21')

    const response = await client
      .get(`/api/v1/tasks/${id}`)
      .qs({ today: '2026-08-20' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.equal(response.body().data.dueDate, '2026-08-21')
  })

  test('la tarea leída de nuevo sale vencida si el día ya pasó', async ({ client, assert }) => {
    const { id, token } = await tareaConVencimiento(client, '2026-08-21')

    const response = await client
      .get(`/api/v1/tasks/${id}`)
      .qs({ today: '2026-08-22' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.isTrue(response.body().data.isOverdue)
  })
})
