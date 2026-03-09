import express from "express";
import { getAssignmentById, getAssignments } from "../Controllers/assignmentController.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const assignmentRoutes = express.Router();

assignmentRoutes.get("/getassignment",verifyToken, getAssignments);
assignmentRoutes.get("/getassignmentbyId/:id",verifyToken, getAssignmentById);

export default assignmentRoutes;
