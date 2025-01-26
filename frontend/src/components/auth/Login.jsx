import { useMutation } from "@tanstack/react-query";
import { loginUser, resendVerificationEmail } from "../../services/authServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel, FormDescription, } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, Mail, MailIcon, Phone, Shield } from 'lucide-react';
import { cn } from "../../lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot, } from "@/components/ui/input-otp"
import Theme from "../ui/theme/theme";
import { Card } from "../ui/card";

// Validation schema using Zod
const loginSchema = z.object({
    loginId: z.string().nonempty("Login ID is required"),
    password: z.string().nonempty("Password is required"),
    otp: z.string().optional(),
    mfa_type: z.string().optional(),
});

const getMFAIcon = (type) => {
    switch (type) {
        case "email_otp":
            return <Mail className="w-5 h-5 text-blue-500" />
        case "phone_otp":
            return <Phone className="w-5 h-5 text-green-500" />
        case "totp":
            return <Clock className="w-5 h-5 text-purple-500" />
        default:
            return <Shield className="w-5 h-5 text-gray-500" />
    }
}

const Login = () => {
    const navigate = useNavigate();
    const [emailVerificationError, setEmailVerificationError] = useState("");
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaMethods, setMfaMethods] = useState([]);
    const [countdown, setCountdown] = useState(0);
    const [mfaOtpSent, setMfaOtpSent] = useState(false);

    // Initialize the form using react-hook-form with Zod validation
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            loginId: "",
            password: "",
            otp: "",
            mfa_type: "",
        },
    });

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            toast.success(data?.data?.message || "Login successful");
            setMfaRequired(false);
            setMfaOtpSent(false);
            navigate("/");
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "An error occurred");
            if (error?.response?.data?.error === "Email not verified") {
                setEmailVerificationError(error?.response?.data?.error);
                setCountdown(60);
                return
            }
            if (error?.response?.data?.error === "MFA required") {
                setMfaRequired(true);
                const methods = error?.response?.data?.mfaMethods || [];
                const emailMethod = methods?.find(m => m?.mfa_type === 'email_otp');
                setMfaMethods(methods);
                handleMfaSelect(methods?.[0]?.mfa_type);
                form.setValue('email', emailMethod?.email || '-');
                return
            }
            if (error?.response?.data?.step === 'otp') {
                setMfaOtpSent(true);
                return
            }
        },
    });

    const resendVerificationMutation = useMutation({
        mutationFn: resendVerificationEmail,
        onSuccess: () => {
            toast.success("Verification email resent successfully");
            setCountdown(60);
        },
        onError: () => {
            toast.error("Failed to resend verification email");
        },
    });

    const onSubmit = (data) => {
        loginMutation.mutate(data);
    };

    const handleResendVerification = () => {
        resendVerificationMutation.mutate(form.getValues().loginId);
    };

    const handleMfaSelect = (value) => {
        form.setValue('mfa_type', value);
        setMfaOtpSent(false);
    }

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
                    <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Login ID Field */}
                            <FormField
                                control={form.control}
                                name="loginId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Login ID</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter your login ID" />
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

                            <div className="flex justify-between items-center">
                                <Button type="button" variant="link" onClick={() => navigate('/magic-login')}>
                                    Login with Magic Link
                                </Button>
                                <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => navigate('/forgot-password')}
                                >
                                    Forgot Password?
                                </Button>
                            </div>

                            {/* Email Verification Error Message */}
                            {emailVerificationError && (
                                <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                                    <MailIcon className="h-4 w-4 text-yellow-600" />
                                    <AlertTitle className="text-yellow-800 font-semibold">Email Verification Required</AlertTitle>
                                    <AlertDescription className="text-yellow-700">
                                        A verification link has been sent to your email address.
                                        Please check your inbox and verify your email to continue.
                                    </AlertDescription>
                                    <div className="mt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleResendVerification}
                                            disabled={countdown > 0}
                                            className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                                            type="button"
                                        >
                                            {countdown > 0
                                                ? `Resend in ${countdown}s`
                                                : "Resend Verification Email"}
                                        </Button>
                                    </div>
                                </Alert>
                            )}
                            {mfaRequired && (
                                <FormField
                                    control={form.control}
                                    name="mfa_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Tabs value={field.value} onValueChange={(value) => {
                                                handleMfaSelect(value);
                                            }}>
                                                <TabsList className={cn("grid w-full")} style={{ gridTemplateColumns: `repeat(${mfaMethods.length}, 1fr)` }}>
                                                    {["email_otp", "phone_otp", "totp"].map((type) => (
                                                        mfaMethods?.map(m => m?.mfa_type)?.includes(type) && <TabsTrigger
                                                            key={type}
                                                            value={type}
                                                            className={`flex items-center justify-center`}
                                                        >
                                                            {getMFAIcon(type)}
                                                            <span className="ml-2">
                                                                {type.split("_")[0].charAt(0).toUpperCase() + type.split("_")[0].slice(1)}
                                                            </span>
                                                        </TabsTrigger>
                                                    ))}
                                                </TabsList>
                                                <TabsContent value="email_otp">
                                                    <div className="space-y-4">
                                                        <FormField
                                                            control={form.control}
                                                            name="email"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Email Address</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="email" placeholder="Enter your email" {...field} disabled />
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        OTP will be sent to your email address {mfaOtpSent && <Button type="button" onClick={() => onSubmit({ ...form.getValues(), otp: '' })} className="" isLoading={loginMutation.isPending} disabled={loginMutation.isPending} loadingText={'Resending...'} >Resend</Button>}
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        {/* MFA Field */}
                                                        {mfaOtpSent && (
                                                            <FormField
                                                                control={form.control}
                                                                name="otp"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>OTP</FormLabel>
                                                                        <FormControl>
                                                                            <OtpInput {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        )}

                                                        <Button type="submit" className="w-full" isLoading={loginMutation.isPending} disabled={loginMutation.isPending} loadingText={mfaOtpSent ? 'Verifying...' : 'Sending...'}>
                                                            {mfaOtpSent ? 'Verify' : 'Send OTP'}
                                                        </Button>
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value='totp'>
                                                    <div className="space-y-4">
                                                        {/* MFA Field */}
                                                        {mfaRequired && (
                                                            <FormField
                                                                control={form.control}
                                                                name="otp"
                                                                render={({ field }) => (
                                                                    <FormItem className="">
                                                                        <FormLabel>OTP</FormLabel>
                                                                        <FormControl>
                                                                            <OtpInput {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        )}
                                                        {/* Submit Button */}
                                                        {mfaRequired && <Button type="submit" className="w-full" isLoading={loginMutation.isPending} disabled={loginMutation.isPending} loadingText="Verifying...">
                                                            Verify
                                                        </Button>}
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Submit Button */}
                            {!mfaRequired && <Button type="submit" className="w-full" isLoading={loginMutation.isPending} disabled={loginMutation.isPending} loadingText="Logging in...">
                                Login
                            </Button>}
                        </form>
                    </Form>
                    <div className="mt-4 text-center">
                        <Button
                            variant="link"
                            onClick={() => navigate('/register')}
                            className="text-sm text-muted-foreground hover:text-primary"
                        >
                            {`Don't have an account? Register`}
                        </Button>
                    </div>
                </Card>
            </div >
        </>
    );
};

const OtpInput = ({ ...props }) => {
    return (
        <InputOTP maxLength={6} {...props}>
            <InputOTPGroup className="w-full" >
                <InputOTPSlot className="w-full h-12 " index={0} />
                <InputOTPSlot className="w-full h-12 " index={1} />
                <InputOTPSlot className="w-full h-12 " index={2} />
                <InputOTPSlot className="w-full h-12 " index={3} />
                <InputOTPSlot className="w-full h-12 " index={4} />
                <InputOTPSlot className="w-full h-12 " index={5} />
            </InputOTPGroup>
        </InputOTP>
    )
}

export default Login;

