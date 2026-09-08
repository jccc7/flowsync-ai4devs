import Task from '#models/task'
import { setTaskDueDateValidator, toCalendarDay } from '#validators/task'
import type { HttpContext } from '@adonisjs/core/http'
import TaskDetailTransformer from '#transformers/task_detail_transformer'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@foadonis/openapi/decorators'
import {
  apiErrorSchema,
  notFoundErrorSchema,
  taskDetailResponseSchema,
} from '#controllers/task_openapi_schemas'

export default class TaskDueDatesController {
  /**
   * Fijar, cambiar y retirar la fecha de vencimiento son la misma operación, y
   * por eso comparten endpoint: quitar la fecha no es borrar un recurso, es
   * poner el valor «sin fecha», que es un valor legítimo del campo.
   *
   * Endpoint propio en vez de un update genérico de la tarea, por el mismo
   * motivo que el estado: por ahí se colarían el título y el responsable, que
   * este change no permite tocar.
   *
   * Cualquiera con sesión puede cambiar la fecha de cualquier tarea, igual que
   * el estado. No se comprueba quién es el responsable.
   */
  @ApiOperation({
    summary: 'Fijar, cambiar o retirar la fecha de vencimiento',
    description:
      'Retirar la fecha (`dueDate: null`) es una operación admitida, no un error. Devuelve la tarea con la condición de vencida ya resuelta contra `today`.',
  })
  @ApiBearerAuth()
  @ApiBody({
    description:
      'La nueva fecha, o `null` para retirarla. `today` es el día de referencia de quien pide el cambio, para resolver el vencimiento en la misma respuesta.',
    schema: {
      type: 'object',
      properties: {
        dueDate: { type: 'string', format: 'date', nullable: true },
        today: { type: 'string', format: 'date' },
      },
      required: ['today'],
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'La tarea ya con la fecha actualizada. Su título, su responsable y su estado no cambian.',
    schema: taskDetailResponseSchema,
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
    description:
      'La fecha es imposible o está mal formada, o falta `today` o no es una fecha válida.',
    schema: apiErrorSchema,
  })
  async update({ params, request, serialize }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    const { today, dueDate } = await request.validateUsing(setTaskDueDateValidator)

    // El `DateTime` del validador se queda aquí: hacia dentro, una fecha de
    // vencimiento es un día en texto y nunca un instante.
    task.dueDate = dueDate === null ? null : toCalendarDay(dueDate)
    await task.save()
    await task.load('assignee')

    // Se devuelve ya resuelta contra el día de quien pide, para que aplazar una
    // tarea vencida deje de mostrarla vencida en esta misma respuesta.
    return serialize(TaskDetailTransformer.transform(task, toCalendarDay(today)))
  }
}
