import type { OpenAPIV3 } from 'openapi-types'
import { TASK_STATUSES } from '#models/task'

/**
 * Formas de respuesta compartidas por los controladores de tareas, para que
 * el documento OpenAPI describa exactamente lo que `serialize()` y los
 * transformers (`TaskTransformer`, `TaskDetailTransformer`,
 * `TaskAssigneeTransformer`) envían de verdad.
 */

export const taskAssigneeSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description:
    'Lo justo para identificar al responsable de la tarea. Nunca incluye su email ni ningún otro dato de la cuenta.',
  properties: {
    id: { type: 'integer' },
    fullName: {
      type: 'string',
      nullable: true,
      description: 'Nulo cuando la cuenta se registró sin nombre.',
    },
    initials: { type: 'string' },
  },
  required: ['id', 'initials'],
}

export const taskSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    status: { type: 'string', enum: [...TASK_STATUSES] },
    assignee: taskAssigneeSchema,
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'title', 'status', 'assignee', 'createdAt', 'updatedAt'],
}

export const taskDetailSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description:
    'Una tarea suelta, con su fecha de vencimiento y su condición de vencida ya resueltas.',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    status: { type: 'string', enum: [...TASK_STATUSES] },
    dueDate: {
      type: 'string',
      format: 'date',
      nullable: true,
      description:
        'Día del calendario en formato AAAA-MM-DD, sin hora ni huso. Nulo si la tarea no tiene fecha.',
    },
    isOverdue: {
      type: 'boolean',
      description:
        'true solo si hay fecha de vencimiento, esa fecha es anterior al `today` de la petición y el estado no es `done`.',
    },
    assignee: taskAssigneeSchema,
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'title', 'status', 'dueDate', 'isOverdue', 'assignee', 'createdAt', 'updatedAt'],
}

function wrapData(schema: OpenAPIV3.SchemaObject): OpenAPIV3.SchemaObject {
  return {
    type: 'object',
    properties: { data: schema },
    required: ['data'],
  }
}

export const taskResponseSchema = wrapData(taskSchema)
export const taskListResponseSchema = wrapData({ type: 'array', items: taskSchema })
export const taskDetailResponseSchema = wrapData(taskDetailSchema)

/**
 * Forma de `{"errors": [...]}` que usan tanto los rechazos de VineJS (con
 * `rule`, `field` y a veces `meta`) como los 401 del guard `api` (solo
 * `message`). `frontend/src/lib/api.ts` la consume tal cual.
 */
export const apiErrorSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  properties: {
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          rule: { type: 'string' },
          field: { type: 'string' },
          meta: { type: 'object', additionalProperties: true },
        },
        required: ['message'],
      },
    },
  },
  required: ['errors'],
}

/**
 * Forma de las excepciones no capturadas (p.ej. `Task.findOrFail`), tal como
 * las renderiza el `ExceptionHandler` por defecto de Adonis.
 */
export const notFoundErrorSchema: OpenAPIV3.SchemaObject = {
  type: 'object',
  description:
    'En producción la respuesta se limita a `message` y `code`; en desarrollo Adonis añade además `name`, `stack` y `frames` de depuración.',
  properties: {
    message: { type: 'string' },
    code: { type: 'string' },
  },
  required: ['message', 'code'],
}
