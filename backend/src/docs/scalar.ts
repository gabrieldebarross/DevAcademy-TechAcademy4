/**
 * HTML page that renders the API reference using Scalar.
 *
 * Scalar is loaded from its official CDN build, so no extra runtime dependency
 * is added to the backend. The OpenAPI document is fetched from
 * `/api/docs/openapi.json` (served by the same backend).
 */
export const scalarHtml = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>DevAcademy API - Referência</title>
  </head>
  <body>
    <script id="api-reference" data-url="/api/docs/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>
`;
