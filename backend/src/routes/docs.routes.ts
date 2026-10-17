import { Router } from 'express';

import { openApiDocument } from '../docs/openapi';
import { scalarHtml } from '../docs/scalar';

const router = Router();

/** Documento OpenAPI em formato bruto, consumido pelo Scalar e por outras ferramentas. */
router.get('/openapi.json', (_req, res) => {
  res.status(200).json(openApiDocument);
});

/** Interactive API reference rendered by Scalar. */
router.get('/', (_req, res) => {
  res.status(200).type('html').send(scalarHtml);
});

export default router;
