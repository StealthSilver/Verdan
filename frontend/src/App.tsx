
import { BrowserRouter, Route, Routes  } from "react-router-dom"
import Signin from "./Pages/Signin"
import "./App.css"
import UserDashboard from "./Pages/UserDashboard"
import AddSites from "./Pages/AddSite"
import TeamDashboard from "./Pages/TeamDashboard"
import AddTeamMember from "./Pages/AddTeamMember"
// import UserProfile from "./Pages/UserProfile"
const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element= {<Signin/>}></Route>
      <Route path="/admin/Dashboard" element = {<UserDashboard/>}></Route>
      {/* <Route path="/user/profile" element = {<UserProfile/>}></Route> */}
      <Route path="/admin/Dashboard/add-site" element={<AddSites/>}></Route>
      <Route path="/admin/Dashboard/:siteId/team" element={<TeamDashboard/>}></Route>
      <Route path="/admin/Dashboard/:siteId/team/add" element={<AddTeamMember/>}></Route>
    </Routes>
    </BrowserRouter>
  )
}

export default App