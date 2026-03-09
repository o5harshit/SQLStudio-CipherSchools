const IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const DATA_TYPE_REGEX = /^(?:smallint|integer|bigint|decimal|numeric|real|double precision|serial|bigserial|boolean|text|date|timestamp|timestamptz|time|varchar|char)(?:\(\d+(?:\s*,\s*\d+)?\))?$/i;
const DISALLOWED_KEYWORDS =
  /\b(insert|update|delete|drop|alter|truncate|create|grant|revoke|copy|call|do|execute|merge)\b/i;
const ALLOWED_START_REGEX = /^(select|with)\b/i;

export const quoteIdentifier = (value) => {
  if (!IDENTIFIER_REGEX.test(value)) {
    throw new Error(`Invalid identifier: ${value}`);
  }
  return `"${value}"`;
};

export const validateDataType = (dataType) => {
  const normalized = String(dataType || "").trim().replace(/\s+/g, " ");

  if (!DATA_TYPE_REGEX.test(normalized)) {
    throw new Error(`Unsupported data type: ${dataType}`);
  }

  return normalized;
};

export const normalizeAndValidateQuery = (query) => {
  const normalized = String(query || "").trim();

  if (!normalized) {
    throw new Error("Query is required.");
  }

  if (normalized.length > 5000) {
    throw new Error("Query is too long. Maximum length is 5000 characters.");
  }

  if (/--|\/\*/.test(normalized)) {
    throw new Error("SQL comments are not allowed.");
  }

  const cleaned = normalized.endsWith(";") ? normalized.slice(0, -1).trim() : normalized;

  if (cleaned.includes(";")) {
    throw new Error("Only one SQL statement is allowed.");
  }

  if (!ALLOWED_START_REGEX.test(cleaned)) {
    throw new Error("Only SELECT/CTE queries are allowed.");
  }

  if (DISALLOWED_KEYWORDS.test(cleaned)) {
    throw new Error("Unsafe SQL keyword detected.");
  }

  return cleaned;
};
