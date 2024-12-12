import express from "express";
import http from "http";
import bodyParser from "body-parser";
import compression from "compression";
import tokenRouter from "token/token-routes.js";
import cors from "cors";

const app = express();

app.use(cors({ credentials: true }));
app.use(compression());
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(8080, () => {
  console.log("Server running on http://localhost:8080/");
});

app.use(tokenRouter);
