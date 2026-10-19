import { Router, type IRouter } from 'express';
import specialists from '../data/specialists.json' with { type: 'json' };

const router: IRouter = Router();
router.get('/specialists', (_req, res) => {
  res.json(specialists);
});
export default router;
