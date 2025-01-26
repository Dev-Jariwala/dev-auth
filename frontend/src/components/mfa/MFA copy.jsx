import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { AlertCircle, CheckCircle2, Mail, Phone, Clock } from 'lucide-react'
import { getMFAData } from '@/services/authServices'
import * as z from "zod"
import { updateUserMFA } from '../../services/authServices'

const mfaFormSchema = z.object({
    is_mfa: z.boolean(),
    mfa_type: z.enum(["email_otp", "phone_otp", "totp"]),
    otp: z.string().optional(),
})

const MFAForm = () => {
    const form = useForm({
        resolver: zodResolver(mfaFormSchema),
        defaultValues: {
            is_mfa: false,
            mfa_type: 'email_otp',
            contactInfo: '',
            otp: '',
        },
    })

    const { data: MFAData, isLoading: isMFADataLoading, isError: MFADataError } = useQuery({
        queryKey: ['mfa-data'],
        queryFn: async () => {
            const res = await getMFAData()
            return res.data?.result
        },
    })

    const [otpSent, setOtpSent] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const updateUserMFAMutation = useMutation({
        mutationFn: updateUserMFA,
        onSuccess: (res) => {
            const data = res.data;
            if (data.step === 'otp') {
                setOtpSent(true)
            } else {
                setSuccess(true)
            }
            toast.success(data?.message);
        },
        onError: (error) => {
            console.error(error)
            toast.error(error?.response?.data?.message || 'Failed to update MFA settings')
            setError(error?.response?.data?.message || 'Failed to update MFA settings')
        }
    })

    const onSubmit = async (data) => {
        console.log("data", data)
        updateUserMFAMutation.mutate(data)
    }
    useEffect(() => {
        if (MFAData) {
            form.reset({
                is_mfa: MFAData.is_mfa,
                mfa_type: MFAData.mfa_type === 'none' ? 'email_otp' : MFAData.mfa_type,
                email: MFAData.email,
                phone: MFAData.phone,
            })
        }
    }, [MFAData])

    useEffect(() => {
        if (MFADataError) {
            toast.error('Failed to fetch MFA data')
        }
    }, [MFADataError])

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Multi-Factor Authentication Settings</h2>
            {isMFADataLoading ? (
                <div className="text-center">Loading...</div>
            ) : (MFAData?.is_mfa ? (
                <div className=""></div>
            ) :
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="is_mfa"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                    <FormLabel className="text-sm font-medium text-gray-700">Enable Multi-Factor Authentication</FormLabel>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={(checked) => {
                                                field.onChange(checked)
                                                if (!checked) {
                                                    setOtpSent(false)
                                                    setSuccess(false)
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {form.watch('is_mfa') && !success && (
                            <FormField
                                control={form.control}
                                name="mfa_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <Tabs value={field.value} onValueChange={field.onChange}>
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="email_otp" className="flex items-center justify-center">
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    Email
                                                </TabsTrigger>
                                                <TabsTrigger value="phone_otp" className="flex items-center justify-center">
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    Phone
                                                </TabsTrigger>
                                                <TabsTrigger value="totp" className="flex items-center justify-center">
                                                    <Clock className="w-4 h-4 mr-2" />
                                                    TOTP
                                                </TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="email_otp" className="mt-4">
                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Email Address</FormLabel>
                                                            <FormControl>
                                                                <Input type="email" placeholder="Enter your email" {...field} disabled />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TabsContent>
                                            <TabsContent value="phone_otp" className="mt-4">
                                                <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Phone Number</FormLabel>
                                                            <FormControl>
                                                                <Input type="tel" placeholder="Enter your phone number" {...field} disabled />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TabsContent>
                                            <TabsContent value="totp" className="mt-4">
                                                <div className="text-sm text-gray-600">
                                                    Time-based OTP will be set up after verification.
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </FormItem>
                                )}
                            />
                        )}

                        {!otpSent ? (
                            <Button type="submit" disabled={updateUserMFAMutation.isPending} className="w-full mt-4">
                                {updateUserMFAMutation.isPending ? 'Sending...' : 'Send OTP'}
                            </Button>
                        ) : (
                            <FormField
                                control={form.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Enter OTP</FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="Enter OTP" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {otpSent && (
                            <Button type="submit" disabled={updateUserMFAMutation.isPending} className="w-full">
                                {updateUserMFAMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                        )}
                    </form>
                </Form>
            )
            }
            {
                error && (
                    <div className="mt-4 p-2 bg-red-100 text-red-700 rounded flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {error}
                    </div>
                )
            }
            {
                success && (
                    <div className="mt-4 p-2 bg-green-100 text-green-700 rounded flex items-center">
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        MFA has been successfully enabled!
                    </div>
                )
            }
        </div >
    )
}

export default MFAForm