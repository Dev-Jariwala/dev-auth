import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../services/authServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel, } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import Theme from "../ui/theme/theme";
import { Card } from "../ui/card";

// Validation schema using Zod
const registerSchema = z.object({
    username: z.string()
        .nonempty("Username is required")
        .refine(value => !value.includes(' '), "Username cannot contain spaces"),
    email: z.string().email("Invalid email address"),
    phone: z.string().nonempty("Phone number is required"),
    password: z.string().nonempty("Password is required"),
    confirmPassword: z.string().nonempty("Confirm password is required")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

const Register = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(0);

    // Initialize the form using react-hook-form with Zod validation
    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
        },
    });

    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (data) => {
            toast.success(data?.data?.message || "Register successful");
            navigate("/login");
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "An error occurred");
        },
    });

    const onSubmit = (data) => {
        console.log(data);
        registerMutation.mutate(data);
    };

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    return (
        <>
            <div className="bg-background sticky z-99 top-0 left-0 border-b border-muted h-16 flex items-center justify-between px-4">
                <div className="flex items-center justify-end w-full space-x-3">
                    <Theme />
                </div>
            </div>
            <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
                <Card className=" p-6 rounded-md shadow-md w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Username Field */}
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter your login ID" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Email address field */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter your email address" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Phone number field */}
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter your phone number" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password Field */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="password"
                                                placeholder="Enter your password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Confirm Password Field */}
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Confirm your password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Submit Button */}
                            <Button type="submit" className="w-full" disabled={registerMutation.isPending} isLoading={registerMutation.isPending} loadingText="Registering..." >
                                Register
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center">
                        <Button
                            variant="link"
                            onClick={() => navigate('/login')}
                            className="text-sm text-muted-foreground hover:text-primary"
                        >
                            {`Already have an account? Login`}
                        </Button>
                    </div>
                </Card>
            </div >
        </>
    );
};

export default Register;

