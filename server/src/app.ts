import express from "express";
import helmet from "helmet";
import cors from "cors";
import api from "api/index.js";
import { errorHandler } from "middlewares.js";

const app = express();

app.use(helmet());
app.use(cors({ credentials: true }));
app.use(express.json());

app.use("/api/v1", api);

app.use(errorHandler);

export default app;
