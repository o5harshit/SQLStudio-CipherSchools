import mongoose from "mongoose";

// this is a column Schema
const columnSchema = new mongoose.Schema(
{
  columnName: {
    type: String,
    required: true,
    trim: true
  },

  dataType: {
    type: String,
    required: true,
    trim: true
  }
},
{ _id: false }
);

// this is the table Schema
const tableSchema = new mongoose.Schema(
{
  tableName: {
    type: String,
    required: true,
    trim: true
  },

  columns: {
    type: [columnSchema],
    required: true
  },

  rows: {
    type: [mongoose.Schema.Types.Mixed],
    required: true
  }
},
{ _id: false }
);

// this is the expected output schema
const expectedOutputSchema = new mongoose.Schema(
{
  type: {
    type: String,
    required: true,
    enum: ["table", "single_value", "column", "count", "row"]
  },

  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
},
{ _id: false }
);

// this is the assignment schema
const assignmentSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true,
    trim: true
  },

  difficulty: {
    type: String,
    required: true,
    enum: ["easy", "medium", "hard"]
  },

  description: {
    type: String,
    required: true,
    trim: true
  },

  question: {
    type: String,
    required: true,
    trim: true
  },

  sampleTables: {
    type: [tableSchema],
    required: true
  },

  expectedOutput: {
    type: expectedOutputSchema,
    required: true
  }
},
{
  timestamps: true
}
);

export default mongoose.model("Assignment", assignmentSchema);