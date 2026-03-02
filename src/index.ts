import { Router } from "express";
import healthRouter from "./routes/health.routes";
import contactRouter from "./routes/contact.routes";

const router = Router();

router.use(healthRouter);
router.use(contactRouter);


export default router;