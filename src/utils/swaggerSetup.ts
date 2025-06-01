// @missjessen/mdb-rest-api-core/src/util/swaggerConfig.ts

import { Express } from 'express';
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
  // 1) Byg en minimal “baseDef” med alle obligatoriske felter
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
      // Start med et tomt schemas-objekt – vi fylder det fra extraDefinition senere
      schemas: {},
    },
    security: [{ bearerAuth: [] }],
  };

  // ——————————————————————————————————————————————————————————————————————
  // 2) Hent den service-specifikke ekstra-definition (hvis den er givet)
  // ——————————————————————————————————————————————————————————————————————
  const extraDef = opts.extraDefinition || {};

  // ——————————————————————————————————————————————————————————————————————
  // 3) Udfør en “dyb” merge af de to komponent-objekter:
  //    - Behold baseDef.components.securitySchemes
  //    - Tilføj alle properties fra extraDef.components (fx schemas)
  // ——————————————————————————————————————————————————————————————————————
  const mergedComponents: Record<string, any> = {
    ...baseDef.components,
    ...(extraDef.components || {}),
  };

  // ——————————————————————————————————————————————————————————————————————
  // 4) Byg den samlede definition, hvor vi bruger “mergedComponents”
  //    Bemærk at alle andre felter (info, servers, tags osv.) også kan overskrives
  // ——————————————————————————————————————————————————————————————————————
  const mergedDef: SwaggerDefinition = {
    // Start fra baseDef (openapi, info, servers, security, components/securitySchemes, components/schemas = {})
    ...baseDef,
    // Flet info, servers, tags, osv. fra extraDef (overskriver baseDef.info, baseDef.servers, hvis ekstra givet)
    ...extraDef,
    // MEN: Erstat “components” med vores dybt flettede komponenter
    components: mergedComponents,
  };

  // ——————————————————————————————————————————————————————————————————————
  // 5) Generér swaggerSpec med den dybt flettede definition
  // ——————————————————————————————————————————————————————————————————————
  const swaggerSpec = swaggerJsdoc({
    definition: mergedDef,
    apis: [
      // Alle .ts-filer i core-pakken (typisk i src/ eller dist/, afhængigt af dev vs. prod)
      '**/*.ts',
      // Evt. ekstra mønstre fra service-projektet
      ...(opts.extraApis ?? []),
    ],
  });

  // ——————————————————————————————————————————————————————————————————————
  // 6) Hvis der er angivet et devToken, pre-fyldes Authorize-feltet i UI
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
  // 7) Hook Swagger UI på /docs
  // ——————————————————————————————————————————————————————————————————————
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOpts));
}



