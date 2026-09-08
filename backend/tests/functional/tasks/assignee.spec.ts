import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: el responsable se identifica por nombre e
 * iniciales, la tarea no filtra ningún otro dato de esa cuenta -en particular
 * el email- y una cuenta sin nombre sigue dejando iniciales con las que
 * representarla.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function sesion(client: any, fullName: string | null, email: string) {
    await User.create({ fullName, email, password: 'secreto123' })

    const response = await client
      .post('/api/v1/auth/login')
      .json({ email, password: 'secreto123' })

    return response.body().data.token as string
  }

  async function crearTarea(client: any, token: string) {
    const response = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title: 'Revisar el informe' })

    return response.body().data
  }

  async function obtenerTarea(client: any, token: string, id: number) {
    const suelta = await client
      .get(`/api/v1/tasks/${id}`)
      .qs({ today: '2026-09-07' })
      .header('Authorization', `Bearer ${token}`)
    const lista = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    return [suelta.body().data, lista.body().data[0]]
  }

  test('el responsable de una tarea trae su nombre y sus iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, 'Ada Lovelace', 'ada@example.com')
    const creada = await crearTarea(client, token)

    for (const tarea of await obtenerTarea(client, token, creada.id)) {
      assert.equal(tarea.assignee.fullName, 'Ada Lovelace')
      assert.equal(tarea.assignee.initials, 'AL')
    }
  })

  test('el assignee de la tarea no trae el email ni ningún otro dato de la cuenta', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, 'Ada Lovelace', 'ada@example.com')
    const creada = await crearTarea(client, token)

    for (const tarea of await obtenerTarea(client, token, creada.id)) {
      assert.notProperty(tarea.assignee, 'email')
      assert.properties(tarea.assignee, ['id', 'fullName', 'initials'])
      assert.notInclude(JSON.stringify(tarea.assignee), 'ada@example.com')
    }
  })

  test('el responsable sin nombre llega con el nombre nulo y sus iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client, null, 'sin-nombre@example.com')
    const creada = await crearTarea(client, token)

    for (const tarea of await obtenerTarea(client, token, creada.id)) {
      assert.isNull(tarea.assignee.fullName)
      assert.isString(tarea.assignee.initials)
      assert.isNotEmpty(tarea.assignee.initials)
    }
  })
})
