import { BrowserRouter, Route, Routes } from "react-router-dom";
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
// UserSiteDashboard now replaced by role-aware SiteDashboard for parity
import ConnectionTest from "./components/ConnectionTest";
// import UserProfile from "./Pages/UserProfile"
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signin />}></Route>
        <Route path="/test-connection" element={<ConnectionTest />}></Route>
        <Route path="/admin/Dashboard" element={<AdminDashboard />}></Route>
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
        <Route path="/profile" element={<Profile />}></Route>
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
      </Routes>
    </BrowserRouter>
  );
};

export default App;
