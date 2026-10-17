/**
 * Página HTML que renderiza a referência da API usando o Scalar.
 *
 * O Scalar é carregado do build oficial no CDN, então nenhuma dependência de
 * runtime extra é adicionada ao backend. O documento OpenAPI é buscado em
 * `/api/docs/openapi.json` (servido pelo próprio backend).
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
