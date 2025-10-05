import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "admin" | "user";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/signin" replace />;
  }

  // If role is defined, restrict access
  if (role && user.role !== role) {
    return user.role === "admin" ? (
      <Navigate to="/admin/dashboard" replace />
    ) : (
      <Navigate to="/user/dashboard" replace />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
