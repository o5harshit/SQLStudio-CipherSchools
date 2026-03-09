import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AssignmentListPage from "./pages/AssignmentListPage";
import AssignmentSolvePage from "./pages/AssignmentSolvePage";
import AuthPage from "./pages/AuthPage";
import { getMe } from "./api/api";
import { loginSuccess } from "./redux/slices/authSlice";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
  const dispatch = useDispatch();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const res = await getMe();
        if (res.data?.message) {
          dispatch(loginSuccess(res.data.message));
        }
      } catch {
        // not logged in
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, [dispatch]);

  if (authLoading) {
    return <main style={{ padding: "1rem" }}>Loading...</main>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <PublicOnlyRoute>
              <AuthPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AssignmentListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignment/:id"
          element={
            <ProtectedRoute>
              <AssignmentSolvePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
