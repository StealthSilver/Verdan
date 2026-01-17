import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Signin from "./Pages/Signin";
import "./App.css";
import UserDashboard from "./Pages/UserDashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import Profile from "./Pages/Profile";
import AddSites from "./Pages/AddSite";
import TeamDashboard from "./Pages/TeamDashboard";
import AddTeamMember from "./Pages/AddTeamMember";
import SiteDashboard from "./Pages/SiteDashboard";
import AddPlants from "./Pages/AddPlants";
import TreeDetail from "./Pages/TreeDetail";
import UpdateTreeRecord from "./Pages/UpdateTreeRecord";
import SiteAnalytics from "./Pages/SiteAnalytics";
import PublicTreeView from "./Pages/PublicTreeView";
import QRRedirect from "./Pages/QRRedirect";
// UserSiteDashboard now replaced by role-aware SiteDashboard for parity
import ConnectionTest from "./components/ConnectionTest";
// import UserProfile from "./Pages/UserProfile"
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signin />}></Route>
        <Route path="/test-connection" element={<ConnectionTest />}></Route>

        {/* Public Tree View - Main QR code destination */}
        <Route path="/tree/:treeId" element={<PublicTreeView />}></Route>

        {/* Redirect old QR code URLs to public view */}
        <Route path="/qr/:siteId/:treeId" element={<QRRedirect />}></Route>

        {/* Admin Routes */}
        <Route path="/admin/Dashboard" element={<AdminDashboard />}></Route>
        <Route path="/admin/Dashboard/add-site" element={<AddSites />}></Route>
        <Route
          path="/admin/Dashboard/:siteId/team"
          element={<TeamDashboard />}
        ></Route>
        <Route
          path="/admin/Dashboard/:siteId/team/add"
          element={<AddTeamMember />}
        ></Route>
        <Route
          path="/admin/dashboard/:siteId"
          element={<SiteDashboard />}
        ></Route>
        <Route
          path="/admin/dashboard/:siteId/analytics"
          element={<SiteAnalytics />}
        ></Route>
        <Route
          path="/admin/dashboard/:siteId/plants"
          element={<AddPlants />}
        ></Route>
        <Route
          path="/admin/dashboard/:siteId/:treeId"
          element={<TreeDetail />}
        ></Route>
        <Route
          path="/admin/dashboard/:siteId/:treeId/update"
          element={<UpdateTreeRecord />}
        ></Route>

        {/* User Routes */}
        <Route path="/user/dashboard" element={<UserDashboard />}></Route>
        <Route path="/user/site/:siteId" element={<SiteDashboard />}></Route>
        <Route
          path="/user/site/:siteId/:treeId"
          element={<TreeDetail />}
        ></Route>
        <Route
          path="/user/site/:siteId/:treeId/update"
          element={<UpdateTreeRecord />}
        ></Route>
        <Route path="/user/site/:siteId/plants" element={<AddPlants />}></Route>

        {/* Shared Routes */}
        <Route path="/profile" element={<Profile />}></Route>

        {/* 404 - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
