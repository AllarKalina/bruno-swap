import express from "express";
import tokenRoutes from "./token/token.routes.js";

const router = express.Router();

router.use("/token", tokenRoutes);

export default router;
