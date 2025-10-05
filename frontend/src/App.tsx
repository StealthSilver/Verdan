import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Signin from "./pages/Auth/Signin";
import AdminDashboard from "./pages/Admin/Dashboard";
import AddSite from "./pages/Admin/AddSite";
import UserDashboard from "./pages/User/Dashboard";
import Profile from "./pages/User/Profile";
import ProtectedRoute from "./components/ProtectedRoutes";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <Routes>
            {/* Auth */}
            <Route path="/signin" element={<Signin />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-site"
              element={
                <ProtectedRoute role="admin">
                  <AddSite />
                </ProtectedRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute role="user">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <ProtectedRoute role="user">
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Default Redirect */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
