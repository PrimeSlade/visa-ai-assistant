import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { sendSuccess } from "./lib/apiResponse";
import { errorHandler } from "./middleware/errorHandler";
import router from "./routes";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

app.use(
  cors({
    origin: [frontendUrl], // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Hello World");
});

app.get("/api/health", (_req, res) => {
  sendSuccess(res, {
    message: "Health check completed successfully.",
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

app.use(router);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
