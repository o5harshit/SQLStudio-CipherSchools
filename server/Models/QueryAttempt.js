import mongoose from "mongoose";

const queryAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true
    },
    query: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["success", "error"],
      required: true
    },
    rowCount: {
      type: Number,
      default: 0
    },
    executionMs: {
      type: Number,
      default: 0
    },
    isCorrect: {
      type: Boolean,
      default: null
    },
    attemptNumber: {
      type: Number,
      default: 0
    },
    errorMessage: {
      type: String,
      default: ""
    },
    resultPreview: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    }
  },
  { timestamps: true }
);

queryAttemptSchema.index({ userId: 1, assignmentId: 1, createdAt: -1 });

export default mongoose.model("QueryAttempt", queryAttemptSchema);
