import { useMutation } from "@tanstack/react-query"
import { generateMagicLink, generatePasswordResetLink } from "../../services/authServices"
import { toast } from "react-toastify"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ChevronLeft, MailIcon } from "lucide-react"
import Theme from "../ui/theme/theme"
import { Card } from "../ui/card"
import { useNavigate } from "react-router-dom"

// Validation schema using Zod
const loginSchema = z.object({
    loginId: z.string().nonempty("Login ID is required")
})

const ForgotPassword = () => {
    const navigate = useNavigate()
    const [isResetLinkSent, setIsResetLinkSent] = useState(false)

    // Initialize the form using react-hook-form with Zod validation
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            loginId: ""
        },
    })

    const resetLinkMutation = useMutation({
        mutationFn: generatePasswordResetLink,
        onSuccess: () => {
            toast.success("Reset link sent successfully")
            setIsResetLinkSent(true)
        },
        onError: () => {
            toast.error("Failed to send reset link")
        },
    })

    const onSubmit = (data) => {
        resetLinkMutation.mutate(data)
    }


    return (
        <>
            <div className="bg-background sticky z-99 top-0 left-0 border-b border-muted h-16 flex items-center justify-between px-4">
                <div className="flex items-center justify-end w-full space-x-3">
                    <Theme />
                </div>
            </div>
            <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
                <Card className=" p-6 rounded-md shadow-md w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-4 text-center">Forgot Password</h1>
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
                            <div className="flex justify-end items-center">
                                <Button type="button" variant="link" onClick={() => navigate('/magic-login')}>
                                    Login with Magic Link
                                </Button>
                            </div>
                            {isResetLinkSent && (
                                <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                                    <MailIcon className="h-4 w-4 text-blue-600" />
                                    <AlertTitle className="text-blue-800 font-semibold">Reset Link Sent</AlertTitle>
                                    <AlertDescription className="text-blue-700">
                                        A reset password link has been sent to your email address. Please check your inbox and click the link to log
                                        in.
                                    </AlertDescription>
                                </Alert>
                            )}
                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={resetLinkMutation.isPending}
                                disabled={resetLinkMutation.isPending}
                                loadingText="Logging in..."
                            >
                                Send Reset Link
                            </Button>
                            <Button onClick={() => navigate('/login')} type="button" variant="outline" className="w-full">
                                <span><ChevronLeft /></span>
                                <span>Back to Login</span>
                            </Button>
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
            </div>
        </>
    )
}

export default ForgotPassword

