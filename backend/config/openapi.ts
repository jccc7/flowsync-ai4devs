import { defineConfig } from '@foadonis/openapi'

export default defineConfig({
  ui: 'scalar',
  document: {
    info: {
      title: 'FlowSync API',
      version: '0.1.0',
    },
    components: {
      securitySchemes: {
        bearer: {
          type: 'http',
          scheme: 'bearer',
          description:
            'Access token opaco emitido por `POST /api/v1/auth/login` o `POST /api/v1/auth/signup`.',
        },
      },
    },
  },
})
