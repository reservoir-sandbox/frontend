import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import MainPage from "./pages/MainPage/page"
import PastReports from "./pages/PastReports/page"
import Login from "./pages/Login/page"
import Register from "./pages/Register/page"
import ProtectedLayout from "./pages/ProtectedLayout/page"
import Report from "./pages/Report/page"

export default function App() {
  const [loggedIn, setLoggedIn] = useState(true)

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedLayout isLoggedIn={loggedIn} />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/past-reports" element={<PastReports />} />
        <Route path="/report/:id" element={<Report />} />
      </Route>
    </Routes>
  )
}