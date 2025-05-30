# @MDB_REST/api-core

Genbrugelig kerne-pakke til Express-microservices med fokus på JWT-auth, multi-tenant, versionering og automatisk Swagger-dokumentation.

📦 Installation

Installer pakken via npm:

npm install @your-org/api-core

🚀 Hurtigstart

import express from 'express';
import {
  authMiddleware,
  versionRouter,
  swaggerSetup,
  SwaggerOptions,
  withTenant
} from '@your-org/api-core';
import adsV1 from './routes/v1/adRoutes';
import adsV2 from './routes/v2/adRoutes';

const app = express();

// Swagger UI med context fra dit projekt
const swaggerOpts: SwaggerOptions = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
  devToken: process.env.DEV_TOKEN,
  extraDefinition: {
    info: {
      title: 'Min API',
      description: 'Dokumentation for Ads endpoints',
      version: '1.0.0'
    },
    servers: [
      { url: process.env.API_BASE_URL!, description: '🛠️ Lokal' },
      { url: 'https://api.example.com', description: '🚀 Produktion' }
    ],
    components: {
      schemas: {
        /* Tilføj egne schema-definitions her */
      }
    }
  },
  extraApis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

swaggerSetup(app, swaggerOpts);

// Auth + versioneret routing
app.use(
  '/api/ad-defs',
  authMiddleware(),
  versionRouter({ '1': adsV1, '2': adsV2 })
);

app.listen(4000, () => console.log('Server kører på port 4000'));  

🔑 Funktioner

Auth Middleware: Verificer JWT med tenantId claim (Bearer token).

Multi-tenant: Ekstraher tenantId til database-scoping via withTenant(req).

Version Routing: Mount sub-routers under /v1, /v2 osv.

Swagger Setup: Instant Swagger UI under /docs, kan tilpasses med egne definitioner.

📖 API Reference

authMiddleware()

Middleware til at beskytte ruter. Tilføjer req.user og req.tenantId.

app.use(authMiddleware());

withTenant(req)

Hjælper til at scoping DB-kald:

const filter = withTenant<MyModel>(req);
Model.find(filter);

versionRouter(versions)

Opret versioneret router:

app.use('/api', versionRouter({
  '1': routerV1,
  '2': routerV2
}));

swaggerSetup(app, options)

Opsæt Swagger UI under /docs.

Se SwaggerOptions i kildekoden for detaljer.

💡 Brugspakke

Denne pakke er designet til at blive installeret og brugt i dine egne Express-projekter. Du bør ikke ændre direkte i koden her, men i stedet:

Installer med:

npm install @your-org/api-core

Importér og brug helper-funktionerne i dit projekt (se Hurtigstart).

Ændringer eller forbedringer foreslås ved at oprette en issue på GitHub.