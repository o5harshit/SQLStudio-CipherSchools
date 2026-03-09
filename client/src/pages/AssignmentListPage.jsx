import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAssignments } from "../api/api";
import AssignmentCard from "../components/AssignmentCard";
import { logout as logoutApi } from "../api/api";
import { logout as logoutAction } from "../redux/slices/authSlice";
import { useToast } from "../components/ToastProvider";
import "./AssignmentListPage.scss";

const AssignmentListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await getAssignments();
        setAssignments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load assignments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
      toast.success("Logged out successfully.");
    } catch {
      toast.error("Logout request failed, local session cleared.");
    } finally {
      dispatch(logoutAction());
      navigate("/auth", { replace: true });
    }
  };

  return (
    <main className="assignment-list-page">
      <header className="assignment-list-page__header">
        <div className="assignment-list-page__header-top">
          <h1 className="assignment-list-page__title">CipherSQLStudio</h1>
          <button type="button" className="assignment-list-page__logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <p className="assignment-list-page__subtitle">Choose an assignment and solve it with live SQL execution.</p>
      </header>

      {loading && <p className="assignment-list-page__status">Loading assignments...</p>}
      {error && <p className="assignment-list-page__status assignment-list-page__status--error">{error}</p>}
      {!loading && !error && assignments.length === 0 && (
        <p className="assignment-list-page__status">No assignments available right now.</p>
      )}

      {!loading && !error && assignments.length > 0 && (
        <section className="assignment-list-page__grid">
          {assignments.map((assignment) => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
        </section>
      )}
    </main>
  );
};

export default AssignmentListPage;
