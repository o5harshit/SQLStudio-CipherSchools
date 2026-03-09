import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import pool from "../config/postgres.js";
import Assignment from "../Models/Assignment.js";
import QueryAttempt from "../Models/QueryAttempt.js";
import {
  normalizeAndValidateQuery,
  quoteIdentifier,
  validateDataType
} from "../utils/queryGuard.js";

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const normalizeScalar = (value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed !== "" && !Number.isNaN(Number(trimmed))) {
      return Number(trimmed);
    }
    return trimmed;
  }
  return value;
};

const isDeepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const evaluateOutput = (expectedOutput, rows) => {
  if (!expectedOutput) {
    return { isCorrect: null, reason: "No expected output configured." };
  }

  const { type, value } = expectedOutput;

  if (type === "table") {
    const normalizedRows = rows.map((row) => {
      const normalized = {};
      Object.keys(row).forEach((key) => {
        normalized[key] = normalizeScalar(row[key]);
      });
      return normalized;
    });
    const normalizedExpected = (value || []).map((row) => {
      const normalized = {};
      Object.keys(row).forEach((key) => {
        normalized[key] = normalizeScalar(row[key]);
      });
      return normalized;
    });
    const isCorrect = isDeepEqual(normalizedRows, normalizedExpected);
    return { isCorrect, reason: isCorrect ? "Output matches expected table." : "Output table does not match expected table." };
  }

  if (type === "row") {
    const firstRow = rows[0] || null;
    const normalizedRow = firstRow
      ? Object.fromEntries(Object.entries(firstRow).map(([k, v]) => [k, normalizeScalar(v)]))
      : null;
    const normalizedExpected = value
      ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalizeScalar(v)]))
      : null;
    const isCorrect = isDeepEqual(normalizedRow, normalizedExpected);
    return { isCorrect, reason: isCorrect ? "Output matches expected row." : "Output row does not match expected row." };
  }

  if (type === "column") {
    const firstColumn = rows.length ? Object.keys(rows[0])[0] : null;
    const actual = firstColumn ? rows.map((row) => normalizeScalar(row[firstColumn])) : [];
    const expected = Array.isArray(value) ? value.map(normalizeScalar) : [];
    const isCorrect = isDeepEqual(actual, expected);
    return { isCorrect, reason: isCorrect ? "Output matches expected column." : "Output column does not match expected values." };
  }

  if (type === "count" || type === "single_value") {
    const firstRow = rows[0] || {};
    const firstKey = Object.keys(firstRow)[0];
    const actual = normalizeScalar(firstKey ? firstRow[firstKey] : null);
    const expected = normalizeScalar(value);
    const isCorrect = actual === expected;
    return { isCorrect, reason: isCorrect ? "Output matches expected scalar value." : "Output scalar value does not match expected." };
  }

  return { isCorrect: null, reason: "Unsupported expected output type." };
};

const saveAttempt = async ({
  userId,
  assignmentId,
  query,
  status,
  rowCount = 0,
  executionMs = 0,
  isCorrect = null,
  attemptNumber = 0,
  errorMessage = "",
  resultPreview = []
}) => {
  try {
    await QueryAttempt.create({
      userId,
      assignmentId,
      query,
      status,
      rowCount,
      executionMs,
      isCorrect,
      attemptNumber,
      errorMessage,
      resultPreview
    });
  } catch (error) {
    console.error("Failed to save query attempt:", error.message);
  }
};

const prepareSandboxTables = async (client, assignment) => {
  for (const table of assignment.sampleTables) {
    const tableName = quoteIdentifier(table.tableName);
    const columns = table.columns
      .map((col) => `${quoteIdentifier(col.columnName)} ${validateDataType(col.dataType)}`)
      .join(", ");

    await client.query(`CREATE TEMP TABLE ${tableName} (${columns}) ON COMMIT DROP`)

    for (const row of table.rows) {
      const keys = Object.keys(row);
      const quotedColumns = keys.map((key) => quoteIdentifier(key)).join(", ");
      const values = keys.map((key) => row[key]);
      const placeholders = values.map((_, idx) => `$${idx + 1}`).join(", ");

      await client.query(
        `INSERT INTO ${tableName} (${quotedColumns}) VALUES (${placeholders})`,
        values
      );
    }
  }
};

export const executeQuery = async (req, res) => {
  const { assignmentId, query } = req.body || {};
  const userId = req?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  if (!assignmentId) {
    return res.status(400).json({ error: "assignmentId is required." });
  }

  if (!mongoose.isValidObjectId(assignmentId)) {
    return res.status(400).json({ error: "Invalid assignmentId." });
  }

  let safeQuery = "";
  try {
    safeQuery = normalizeAndValidateQuery(query);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  // 1) Load assignment from MongoDB
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return res.status(404).json({ error: "Assignment not found." });
  }

  const lastCorrectAttempt = await QueryAttempt.findOne({
    userId,
    assignmentId,
    isCorrect: true
  })
    .sort({ createdAt: -1 })
    .select("createdAt")
    .lean();

  const attemptQuery = {
    userId,
    assignmentId
  };
  if (lastCorrectAttempt?.createdAt) {
    attemptQuery.createdAt = { $gt: lastCorrectAttempt.createdAt };
  }
  const attemptsSinceLastCorrect = await QueryAttempt.countDocuments(attemptQuery);
  const currentAttemptNumber = attemptsSinceLastCorrect + 1;

  const client = await pool.connect();
  const startedAt = Date.now();

  try {
    await client.query("BEGIN");

    // 2) Create PostgreSQL tables
    // 3) Insert sample rows
    await prepareSandboxTables(client, assignment);

    // 4) Execute user SQL query
    const result = await client.query(safeQuery);
    const executionMs = Date.now() - startedAt;
    const rows = result.rows || [];
    const evaluation = evaluateOutput(assignment.expectedOutput, rows);

    await saveAttempt({
      userId,
      assignmentId,
      query: safeQuery,
      status: "success",
      rowCount: rows.length,
      executionMs,
      isCorrect: evaluation.isCorrect,
      attemptNumber: currentAttemptNumber,
      resultPreview: rows.slice(0, 5)
    });


    await client.query("ROLLBACK");

    // 5) Return result
    return res.json({
      rows,
      rowCount: rows.length,
      executionMs,
      isCorrect: evaluation.isCorrect,
      validationMessage: evaluation.reason,
      attemptNumber: currentAttemptNumber,
      attemptsToCorrect:
        evaluation.isCorrect === true ? currentAttemptNumber : null
    });
  } catch (error) {
    await client.query("ROLLBACK");
    await saveAttempt({
      userId,
      assignmentId,
      query: safeQuery || String(query || ""),
      status: "error",
      isCorrect: false,
      attemptNumber: currentAttemptNumber,
      errorMessage: error.message
    });
    return res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
};

const buildFallbackHint = (assignment, query) => {
  const baseHints = [
    "Start by identifying which table(s) contain the required fields.",
    "Write your query in steps: SELECT first, then WHERE/GROUP BY/ORDER BY.",
    "Check column names and data types from sample tables before filtering.",
    "If aggregation is needed, verify whether GROUP BY is required."
  ];

  if (!query?.trim()) {
    return `Hint: ${baseHints[0]} ${baseHints[1]}`;
  }

  if (!/where/i.test(query)) {
    return "Hint: consider whether a WHERE condition is needed to match the question.";
  }

  if (/count|sum|avg|min|max/i.test(assignment.question) && !/group\s+by/i.test(query)) {
    return "Hint: if aggregating by category, add GROUP BY for non-aggregated columns.";
  }

  return `Hint: ${baseHints[2]} ${baseHints[3]}`;
};

export const getHint = async (req, res) => {
  try {
    const { assignmentId, query } = req.body || {};

    if (!assignmentId) {
      return res.status(400).json({ error: "assignmentId is required." });
    }

    if (!mongoose.isValidObjectId(assignmentId)) {
      return res.status(400).json({ error: "Invalid assignmentId." });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

    if (!apiKey) {
      return res.json({ hint: buildFallbackHint(assignment, query) });
    }

    const schemaSummary = assignment.sampleTables
      .map(
        (table) =>
          `${table.tableName}(${table.columns
            .map((col) => `${col.columnName}:${col.dataType}`)
            .join(", ")})`
      )
      .join("; ");

    const prompt = [
      "You are a SQL tutor.",
      "Give short hints only.",
      "Never provide complete SQL solutions.",
      `Question: ${assignment.question}`,
      `Schema: ${schemaSummary}`,
      `Current query: ${query || "No query yet"}`,
      "Return a concise hint without writing the final full query."
    ].join("\n");

    const response = await gemini.models.generateContent({
      model,
      contents: prompt
    });


    const hint = response.text?.trim();

    return res.json({
      hint: hint || buildFallbackHint(assignment, query)
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAttemptsByAssignment = async (req, res) => {
  const { assignmentId } = req.params;
  const userId = req?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  if (!mongoose.isValidObjectId(assignmentId)) {
    return res.status(400).json({ error: "Invalid assignmentId." });
  }

  const attempts = await QueryAttempt.find({ assignmentId, userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("query status isCorrect attemptNumber rowCount executionMs errorMessage createdAt");

  return res.json(attempts);
};

export const getAttemptStatsByAssignment = async (req, res) => {
  const { assignmentId } = req.params;
  const userId = req?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  if (!mongoose.isValidObjectId(assignmentId)) {
    return res.status(400).json({ error: "Invalid assignmentId." });
  }

  const attempts = await QueryAttempt.find({ assignmentId, userId })
    .select("isCorrect attemptNumber")
    .lean();

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((a) => a.isCorrect === true);
  const bestAttemptsToCorrect = correctAttempts.length
    ? Math.min(...correctAttempts.map((a) => a.attemptNumber || 0).filter((n) => n > 0))
    : null;

  return res.json({
    totalAttempts,
    correctSubmissions: correctAttempts.length,
    bestAttemptsToCorrect
  });
};
