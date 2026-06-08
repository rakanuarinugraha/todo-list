import express from "express";
import authRoute from "./routes/auth.route";
import taskRoute from "./routes/task.route";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/tasks", taskRoute);

export default app;