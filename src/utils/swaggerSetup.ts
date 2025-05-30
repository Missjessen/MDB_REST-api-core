import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export interface SwaggerOptions {
  baseUrl: string;                   // Hoved-server URL
  devToken?: string;                 // JWT til “Authorize” i dev
  extraDefinition?: Record<string, any>; // Overrides: info, servers, components…
  extraApis?: string[];              // Glob-patterns for egne .ts filer
}

/**
 * Sætter Swagger UI op under /docs.
 * - Bruger base-definition fra pakken
 * - Merger optional ekstra definition (f.eks. custom schemas og servers)
 * - Scanner både pakken og projektets egne filer
 */
export function swaggerSetup(app: Express, opts: SwaggerOptions) {
  // Standard-definition
  const baseDef = {
    openapi: '3.0.1',
    info: {
      title: 'API',
      version: '1.0.0',
    },
    servers: [{ url: opts.baseUrl }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer' },
      },
    },
    security: [{ bearerAuth: [] }],
    // Merge ekstra definition hvis givet
    ...(opts.extraDefinition || {}),
  };

  // Byg spec’en
  const swaggerSpec = swaggerJsdoc({
    definition: baseDef,
    apis: [
      // Alt i pakken
      '**/*.ts',
      // + evt. ekstra mønstre fra projektet
      ...(opts.extraApis ?? []),
    ],
  });

  // UI-indstillinger for devToken
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

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOpts));
}