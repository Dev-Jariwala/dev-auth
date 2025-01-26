import { useQuery } from "@tanstack/react-query"
import { authenticateUser } from "../services/authServices"
import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";

const ProtectedRoutes = () => {
    const { data: userAuthenticated, isLoading, error } = useQuery({
        queryKey: ['authenticateUser'],
        queryFn: authenticateUser,
        // enabled: false
    });

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error]);
    
    if (isLoading) {
        return <div>Loading...</div>
    }
    if (!userAuthenticated?.authenticated) {
        return <Navigate to="/login" />
    }
    return (
        <Outlet />
    )
}

export default ProtectedRoutes
