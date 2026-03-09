import express from "express";
import {
  executeQuery,
  getAttemptStatsByAssignment,
  getAttemptsByAssignment,
  getHint
} from "../Controllers/queryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const queryRoutes = express.Router();

queryRoutes.post("/execute",verifyToken, executeQuery);
queryRoutes.post("/hint",verifyToken, getHint);
queryRoutes.get("/attempts/:assignmentId",verifyToken, getAttemptsByAssignment);
queryRoutes.get("/attempts/:assignmentId/stats",verifyToken, getAttemptStatsByAssignment);

export default queryRoutes;
