import Task, { TASK_STATUSES } from '#models/task'
import { updateTaskStatusValidator } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskTransformer from '#transformers/task_transformer'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@foadonis/openapi/decorators'
import {
  apiErrorSchema,
  notFoundErrorSchema,
  taskResponseSchema,
} from '#controllers/task_openapi_schemas'

export default class TaskStatusesController {
  /**
   * El estado es lo único mutable de una tarea en este momento, y por eso
   * tiene endpoint propio en vez de colgar de un update genérico: por ese
   * update acabarían colándose el título y el responsable, que son historias
   * que todavía no se han especificado.
   *
   * Cualquier persona con sesión puede cambiar el estado de cualquier tarea,
   * en cualquier dirección. No hay permisos por responsable ni transiciones
   * prohibidas: volver de «hecho» a «pendiente» es justamente lo que arregla
   * un clic dado por error.
   */
  @ApiOperation({
    summary: 'Cambiar el estado de una tarea',
    description:
      'Permite cualquier transición entre los tres estados, incluida la vuelta desde `done`, a cualquier cuenta con sesión.',
  })
  @ApiBearerAuth()
  @ApiBody({
    description: 'El estado de destino.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: [...TASK_STATUSES] },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'La tarea ya con el nuevo estado. Su título y su responsable no cambian.',
    schema: taskResponseSchema,
  })
  @ApiResponse({
    status: 401,
    description: 'Falta un token de acceso válido o no es correcto.',
    schema: apiErrorSchema,
  })
  @ApiResponse({
    status: 404,
    description: 'No existe ninguna tarea con ese id.',
    schema: notFoundErrorSchema,
  })
  @ApiResponse({
    status: 422,
    description: 'El estado pedido no es `pending`, `in_progress` ni `done`.',
    schema: apiErrorSchema,
  })
  async update({ params, request, serialize }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    const { status } = await request.validateUsing(updateTaskStatusValidator)

    task.status = status
    await task.save()
    await task.load('assignee')

    return serialize(TaskTransformer.transform(task))
  }
}
