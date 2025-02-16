import { Route, Routes } from "react-router-dom"
import ProtectedRoutes from "./ProtectedRoutes"
import Home from "../components/home/Home"
import Login from "../components/auth/Login"
import Sidebar from "../components/sidebar/Sidebar"
import Register from "../components/auth/Register"
import MFA from "../components/mfa/MFA"
import Todos from "../components/todos/Todos"
import MagicLink from "../components/auth/MagicLink"
import MagicLogin from "../components/auth/MagicLogin"
import ForgotPassword from "../components/auth/ForgotPassword"
import ResetPassword from "../components/auth/ResetPassword"
import UserSessions from "../components/sessions/UserSessions"
import Chat from "../components/chats/Chat"

const RoutesComponent = () => {
    return (
        <>
            <Routes>
                <Route path='/' element={<ProtectedRoutes />} >
                    <Route path="" element={<Sidebar />} >
                        <Route path='' element={<Home />} />
                        <Route path='mfa' element={<MFA />} />
                        <Route path='/todo' element={<Todos />} />
                        <Route path='/security' element={<UserSessions />} />
                        <Route path="/chats" element={<Chat />} />
                    </Route>
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/magic-login" element={<MagicLogin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/register" element={<Register />} />
                <Route path="/magic-link" element={<MagicLink />} />
            </Routes>
        </>
    )
}

export default RoutesComponent
