import { Router, type IRouter } from "express";
import healthRouter from "./health";
import propertiesRouter from "./properties";
import insightsRouter from "./insights";
import leadsRouter from "./leads";
import specialistsRouter from "./specialists";
import blogRouter from "./blog";
import webhooksRouter from "./webhooks";
import crmRouter from "./crm";

const router: IRouter = Router();

router.use(healthRouter);
router.use(propertiesRouter);
router.use(insightsRouter);
router.use(leadsRouter);
router.use(specialistsRouter);
router.use(blogRouter);
router.use(webhooksRouter);
router.use(crmRouter);

export default router;
