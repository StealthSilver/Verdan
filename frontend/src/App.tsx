
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Signin from "./Pages/Signin"
import "./App.css"
import UserDashboard from "./Pages/UserDashboard"
import AddSites from "./Pages/AddSite"
import ProtectedRoute from "./ProtectedRoute"
import UpdateSite from "./Pages/UpdateSite"
import AddTeam from "./Pages/AddTeam"
import SiteDashboard from "./Pages/SiteDashboard"
import UserProfile from "./Pages/UserProfile"
// import UserProfile from "./Pages/UserProfile"
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signin />}></Route>
        {/* <Route element={<ProtectedRoute />}> */}
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin/sites/add" element={<AddSites />} />
        <Route path="/admin/site/update/:siteId" element={<UpdateSite />} />
        <Route path="/admin/site/:siteId/add-team" element={<AddTeam />} />
        <Route path="/admin/site/:siteId" element={<SiteDashboard />} />
        <Route path="/profile" element = {<UserProfile/>}></Route>

        {/* </Route> */}
        {/* <Route path="*" element={<Navigate to="/signin" replace />} /> */}

      </Routes>
    </BrowserRouter>
  )
}

export default App