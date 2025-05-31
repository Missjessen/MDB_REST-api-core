// @missjessen/mdb-rest-api-core/src/util/swaggerConfig.ts

import { Express } from 'express';
// Importér SwaggerDefinition, så TypeScript ved, at baseDef indeholder alle obligatoriske felter
import swaggerJsdoc, { SwaggerDefinition } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export interface SwaggerOptions {
  baseUrl: string;
  devToken?: string;
  extraDefinition?: Record<string, any>;
  extraApis?: string[];
}

export function swaggerSetup(app: Express, opts: SwaggerOptions) {
  // ——————————————————————————————————————————————————————————————————————
  // 1) Definér baseDef som en ægte SwaggerDefinition
  // ——————————————————————————————————————————————————————————————————————
  const baseDef: SwaggerDefinition = {
    openapi: '3.0.1',
    info: {
      title: 'API',
      version: '1.0.0',
    },
    servers: [{ url: opts.baseUrl }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],

    // ————————————————————————————————————————————————————————————————————
    // 2) Merge ekstra felter fra service-projektets extraDefinition
    // ————————————————————————————————————————————————————————————————————
    ...(opts.extraDefinition || {}),
  };

  // ——————————————————————————————————————————————————————————————————————
  // 3) Byg swaggerJsdoc-spec’en ved at kombinere baseDef med alle filer
  // ——————————————————————————————————————————————————————————————————————
  const swaggerSpec = swaggerJsdoc({
    definition: baseDef,
    apis: [
      '**/*.ts',                
      ...(opts.extraApis ?? []), 
    ],
  });

  // ——————————————————————————————————————————————————————————————————————
  // 4) Hvis der er angivet et devToken, pre-fyldes Authorize-feltet i UI
  // ——————————————————————————————————————————————————————————————————————
  const swaggerUiOpts = opts.devToken
    ? {
        swaggerOptions: {
          persistAuthorization: true,
          authAction: {
            bearerAuth: {
              name: 'bearerAuth',
              schema: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
              value: `Bearer ${opts.devToken}`,
            },
          },
        },
      }
    : {};

  // ——————————————————————————————————————————————————————————————————————
  // 5) Hook Swagger UI på /docs
  // ——————————————————————————————————————————————————————————————————————
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOpts));
}
