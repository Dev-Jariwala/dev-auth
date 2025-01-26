/* eslint-disable react/prop-types */
import { AiOutlineMenu } from "react-icons/ai";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { useSidebar } from "../ui/sidebar";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { logoutUser } from "../../services/authServices";
import { toast } from "react-toastify";
import Theme from "../ui/theme/theme";
import { Button } from "../ui/button";

const Navbar = () => {
    const { toggleSidebar } = useSidebar();
    const navigate = useNavigate();
    const logoutUserMutation = useMutation({
        mutationFn: logoutUser,
        onSuccess: (data) => {
            toast.success(data?.data?.message || 'Logout successful');
            return navigate('/login');
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'An error occurred');
        }
    })
    return (
        <div className="bg-background sticky z-99 top-0 left-0 border-b border-muted h-16 flex items-center justify-between px-4">
            <div className="flex items-center space-x-3">
                <Button onClick={toggleSidebar} variant="none" className="text-lg font-semibold hover:bg-muted size-10 rounded-full">
                    <AiOutlineMenu />
                </Button>
            </div>
            <div className="flex items-center space-x-3">
                <Theme />
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar className="">
                            <AvatarImage src="/logo.png" />
                            <AvatarFallback className='border border-input bg-background hover:bg-accent hover:text-accent-foreground' >DA</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => logoutUserMutation.mutate()} >Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};

export default Navbar;