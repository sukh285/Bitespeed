import express from "express";
import { identifySchema } from "../validators/contact.validators";
import { validate } from "../middlewares/validate.middleware";
import { handleIdentify } from "../controllers/contact.controllers";

const contactRouter = express.Router();

contactRouter.post("/identify", validate(identifySchema), handleIdentify);

export default contactRouter;