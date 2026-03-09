import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { executeQuery, getAssignment, getHint } from "../api/api";
import SqlEditor from "../components/sqlEditor";
import SampleTables from "../components/SampleTables";
import QueryResult from "../components/QueryResult";
import HintPanel from "../components/HintPanel";
import { useToast } from "../components/ToastProvider";
import "./AssignmentSolvePage.scss";

const AssignmentSolvePage = () => {
  const { id } = useParams();
  const toast = useToast();

  const [assignment, setAssignment] = useState(null);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState([]);
  const [queryError, setQueryError] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(null);
  const [attemptsToCorrect, setAttemptsToCorrect] = useState(null);
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);

  useEffect(() => {
    const loadAssignment = async () => {
      try {
        const res = await getAssignment(id);
        setAssignment(res.data);
      } finally {
        setLoading(false);
      }
    };

    loadAssignment();
  }, [id]);

  const runQuery = async () => {
    if (!query.trim()) {
      setQueryError("Please write a query before running.");
      toast.error("Please write a query before running.");
      return;
    }

    try {
      setExecuting(true);
      setQueryError("");
      setValidationMessage("");
      setIsCorrect(null);
      setAttemptNumber(null);
      setAttemptsToCorrect(null);
      const res = await executeQuery({
        assignmentId: id,
        query
      });
      const rows = Array.isArray(res.data?.rows) ? res.data.rows : [];
      setResult(rows);
      setValidationMessage(res.data?.validationMessage || "");
      const correct = typeof res.data?.isCorrect === "boolean" ? res.data.isCorrect : null;
      setIsCorrect(correct);
      setAttemptNumber(typeof res.data?.attemptNumber === "number" ? res.data.attemptNumber : null);
      setAttemptsToCorrect(
        typeof res.data?.attemptsToCorrect === "number" ? res.data.attemptsToCorrect : null
      );
      if (correct === true) {
        toast.success("Correct answer. Great job!");
      } else if (correct === false) {
        toast.info("Not correct yet. Try refining your query.");
      }
    } catch (err) {
      setResult([]);
      const message = err.response?.data?.error || "Query execution failed.";
      setQueryError(message);
      toast.error(message);
    } finally {
      setExecuting(false);
    }
  };

  const fetchHint = async () => {
    try {
      setHintLoading(true);
      const res = await getHint({
        assignmentId: id,
        query
      });
      setHint(res.data?.hint || "No hint available right now.");
      toast.info("Hint generated.");
    } catch (err) {
      const message = err.response?.data?.error || "Unable to fetch hint right now.";
      setHint(message);
      toast.error(message);
    } finally {
      setHintLoading(false);
    }
  };

  if (loading) {
    return <main className="assignment-solve-page"><p>Loading assignment...</p></main>;
  }

  if (!assignment) {
    return (
      <main className="assignment-solve-page">
        <p>Assignment not found.</p>
        <Link to="/">Back to assignments</Link>
      </main>
    );
  }

  return (
    <main className="assignment-solve-page">
      <header className="assignment-solve-page__header">
        <h1>{assignment.title}</h1>
        <p className="assignment-solve-page__difficulty">
          Difficulty: <span>{assignment.difficulty}</span>
        </p>
        <p>{assignment.description}</p>
      </header>

      <section className="assignment-solve-page__panel">
        <h2>Question</h2>
        <p>{assignment.question}</p>
      </section>

      <section className="assignment-solve-page__panel">
        <h2>Sample Data Viewer</h2>
        <SampleTables tables={assignment.sampleTables || []} />
      </section>

      <section className="assignment-solve-page__panel">
        <h2>SQL Editor</h2>
        <SqlEditor query={query} setQuery={setQuery} />
        <div className="assignment-solve-page__actions">
          <button type="button" onClick={runQuery} disabled={executing}>
            {executing ? "Running..." : "Run Query"}
          </button>
          <button type="button" onClick={fetchHint} disabled={hintLoading}>
            {hintLoading ? "Generating..." : "Get Hint"}
          </button>
        </div>
      </section>

      <section className="assignment-solve-page__panel">
        <h2>Results Panel</h2>
        {queryError && <p className="assignment-solve-page__error">{queryError}</p>}
        {!queryError && validationMessage && (
          <p
            className={`assignment-solve-page__validation ${
              isCorrect === true ? "assignment-solve-page__validation--correct" : "assignment-solve-page__validation--wrong"
            }`}
          >
            {validationMessage}
          </p>
        )}
        {!queryError && attemptNumber !== null && (
          <p className="assignment-solve-page__attempt">
            Attempt for this assignment: <strong>{attemptNumber}</strong>
            {attemptsToCorrect !== null ? ` | Solved in ${attemptsToCorrect} attempt(s)` : ""}
          </p>
        )}
        <QueryResult result={result} />
      </section>

      <section className="assignment-solve-page__panel">
        <h2>LLM Hint Integration</h2>
        <HintPanel hint={hint} />
      </section>
    </main>
  );
};

export default AssignmentSolvePage;
