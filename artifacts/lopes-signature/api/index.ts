import express from 'express';
import properties from '../../api-server/src/routes/properties.js';
import specialists from '../../api-server/src/routes/specialists.js';
import blog from '../../api-server/src/routes/blog.js';

const app = express();
// This public function exposes only catalog/editorial reads. CRM, leads,
// webhooks, writes and article generation are deliberately not mounted.
app.use((req: { method: string; path: string }, res: { status: (code: number) => { json: (body: object) => void } }, next: () => void) => {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Método não permitido.' });
    return;
  }
  if (!/^\/api\/(properties(?:\/[^/]+)?|specialists|blog(?:\/[^/]+)?)\/?$/.test(req.path)) {
    res.status(404).json({ message: 'Rota não encontrada.' });
    return;
  }
  next();
});
app.use('/api', properties, specialists, blog);
export default app;
// Specialist directory has no runtime dependency on workspace source schemas.
