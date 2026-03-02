import express from "express";
import { errorHandler } from "./middlewares/error.middleware";
import router from "./index";

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/v1", router);

app.use(errorHandler);

export { app };