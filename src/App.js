import Signup from "./components/authentication/Signup";
import { Routes, Route, Navigate } from 'react-router-dom'
import Profile from "./components/authentication/Profile";
import Login from "./components/authentication/Login";
import ForgotPassword from "./components/authentication/ForgotPassword";
import UpdateProfile from "./components/authentication/UpdateProfile";
import { useAuth } from './contexts/AuthContext'
import Dashboard from "./components/google-drive/Dashboard";

function App() {
  const { currentUser } = useAuth()

  return (
    <Routes>
      <Route exact path="/" element={currentUser ? <Dashboard /> : <Navigate to='/login' />} />
      <Route exact path="/folder/:folderId" element={currentUser ? <Dashboard /> : <Navigate to='/login' />} />
      <Route exact path="/user" element={currentUser ? <Profile /> : <Navigate to='/login' />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/update-profile" element={currentUser ? <UpdateProfile /> : <Navigate to='/login' />} />
    </Routes>
  )
}

export default App;
