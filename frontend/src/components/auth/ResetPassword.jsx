import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { verifyPasswordResetLink, updatePassword } from '../../services/authServices';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LockIcon } from 'lucide-react';
import { Card } from '../ui/card';

// Validation schema using Zod
const resetPasswordSchema = z
    .object({
        newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });


const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [isValidToken, setIsValidToken] = useState(null);

    const form = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: ''
        }
    })

    const { data: verifyData, isLoading: isVerifyLoading, error: verifyError } = useQuery({
        queryKey: ['verifyPasswordResetToken', token],
        queryFn: async () => {
            const res = await verifyPasswordResetLink(token);
            return res.data;
        },
        retry: false,
        enabled: !!token,
    });

    const updatePasswordMutation = useMutation({
        mutationFn: updatePassword,
        onSuccess: (data) => {
            toast.success(data?.message || "Password updated successfully")
            navigate("/login");
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to update password")
        }
    })

    const onSubmit = (data) => {
        updatePasswordMutation.mutate({ ...data, token });
    }


    useEffect(() => {
        if (verifyData?.success) {
            setIsValidToken(true)
        }
    }, [verifyData]);
    useEffect(() => {
        if (verifyError) {
            setIsValidToken(false);
            toast.error(verifyError?.response?.data?.message || "Invalid or expired token")
            setTimeout(() => {
                navigate("/login")
            }, 2000);
        }
    }, [verifyError, navigate])

    return (
        <>
            <div className="bg-background sticky z-99 top-0 left-0 border-b border-muted h-16 flex items-center justify-end px-4">
                <div className="flex items-center justify-end w-full space-x-3">
                </div>
            </div>
            <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
                <Card className=" p-6 rounded-md shadow-md w-full max-w-md">
                    {isVerifyLoading ? <div className="">loading...</div> : null}
                    {!isValidToken && !isVerifyLoading ? (
                        <Alert className="bg-red-50 border-red-200 text-red-800">
                            <LockIcon className="h-4 w-4 text-red-600" />
                            <AlertTitle className="text-red-800 font-semibold">Invalid or Expired Link</AlertTitle>
                            <AlertDescription className="text-red-700">
                                The password reset link is invalid or has expired. Please request a new password reset link.
                            </AlertDescription>
                        </Alert>
                    ) : null}
                    {isValidToken ? (
                        <>
                            <h1 className="text-2xl font-bold mb-4 text-center">Reset Password</h1>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Enter your new password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Confirm your new password" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={updatePasswordMutation.isPending}
                                        isLoading={updatePasswordMutation.isPending}
                                        loadingText="Updating password..."
                                    >
                                        Update Password
                                    </Button>
                                </form>
                            </Form>
                        </>
                    ) : null}
                </Card>
            </div>
        </>
    );
};

export default ResetPassword;