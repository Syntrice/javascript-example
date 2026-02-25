import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { Application } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Enable swagger ui and definitions from jsdoc comments in controllers
 * @param app ExpressJS Application
 */
export function setupSwagger(app: Application): void {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'JavaScript Example Authority',
        version: '1.0.0',
        description: "API documentation for JavaScript Example Backend Authority"
      },
    },
    apis: [join(__dirname, 'controllers/**/*.ts')],
  };

   
  const openapiSpecification: swaggerUi.JsonObject = swaggerJsdoc(options) as swaggerUi.JsonObject;
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(openapiSpecification));
}
