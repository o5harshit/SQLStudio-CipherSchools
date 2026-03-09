import Assignment from "../Models/Assignment.js";
import mongoose from "mongoose";


export const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .select("_id title difficulty description")
      .sort({ createdAt: -1 })
      .lean();

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid assignment id." });
    }

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
