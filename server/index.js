import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import pool from "./config/postgres.js";
import connectDB from "./config/db.js";
import assignmentRoutes from "./Routes/assignmentRoutes.js";
import queryRoutes from "./Routes/queryRoutes.js";
import AuthRoutes from "./Routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true
  })
);

app.get("/api/health", async (_req, res, next) => {
  try {
    const result = await pool.query("SELECT current_database() AS database_name");
    res.json({
      status: "ok",
      postgres: result.rows[0]?.database_name || null
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api/auth",AuthRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/query", queryRoutes);



const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
