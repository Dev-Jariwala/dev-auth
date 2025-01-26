import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Mail, Phone, Clock, Trash2, Shield, Settings } from "lucide-react"
import { getMFAData, updateUserMFA } from "@/services/authServices"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { QRCodeSVG } from "qrcode.react"
import { InputOTP, InputOTPGroup, InputOTPSlot, } from "@/components/ui/input-otp"
import { Badge } from "../ui/badge"

const mfaFormSchema = z.object({
    is_mfa: z.boolean(),
    mfa_type: z.enum(["email_otp", "phone_otp", "totp", "none"]),
    otp: z.string().optional(),
    totp_secret: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    mfaMethods: z
        .array(
            z.object({
                mfa_type: z.enum(["email_otp", "phone_otp", "totp"]).optional(),
                is_enabled: z.boolean().optional(),
                mfa_secret: z.string().optional(),
            }),
        )
        .optional(),
})

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

const MFAForm = () => {
    const queryClient = useQueryClient()
    const [otpSent, setOtpSent] = useState(false)
    const [mfaInfo, setMfaInfo] = useState(null)
    const [isEditMode, setIsEditMode] = useState(false)

    const form = useForm({
        resolver: zodResolver(mfaFormSchema),
        defaultValues: {
            is_mfa: false,
            mfa_type: "email_otp",
            otp: "",
            totp_secret: "",
            mfaMethods: [],
        },
    })

    const {
        data: MFAData,
        isLoading: isMFADataLoading,
        isError: MFADataError,
    } = useQuery({
        queryKey: ["mfa-data"],
        queryFn: async () => {
            const res = await getMFAData()
            return res.data
        },
    })

    const updateUserMFAMutation = useMutation({
        mutationFn: updateUserMFA,
        onSuccess: (res) => {
            const data = res.data
            if (data.step === "otp") {
                setOtpSent(true)
            } else {
                setOtpSent(false)
                setIsEditMode(false)
                queryClient.invalidateQueries({ queryKey: ["mfa-data"] })
            }
            toast.success(data?.message)
        },
        onError: (error) => {
            console.error(error)
            toast.error(error?.response?.data?.message || "Failed to update MFA settings")
        },
    })

    const onSubmit = async (data) => {
        if (data?.is_mfa && data?.mfa_type === "totp" && !otpSent) {
            setOtpSent(true)
            return
        }
        const currentMfaMethod = data?.mfaMethods?.find((method) => method.mfa_type === data?.mfa_type)
        const isEnabling = !currentMfaMethod?.is_enabled
        updateUserMFAMutation.mutate({ ...data, is_enabled: isEnabling })
    }

    const handleDeleteMFA = (mfa_type) => {
        setIsEditMode(true);
        form.setValue("mfa_type", mfa_type);
    }

    useEffect(() => {
        if (MFAData) {
            const isMfaEnabled = MFAData?.mfaMethods?.find((method) => method.is_enabled)
            form.reset({
                is_mfa: !!isMfaEnabled,
                mfa_type: isMfaEnabled?.mfa_type || "email_otp",
                totp_secret: MFAData?.mfaMethods?.find((mfa) => mfa.mfa_type === "totp")?.mfa_secret || "",
                email: MFAData?.email,
                phone: MFAData?.phone,
                mfaMethods: MFAData?.mfaMethods || [],
            })
            setMfaInfo({
                email_otp: { value: MFAData?.email, label: "Email Address" },
                phone_otp: { value: MFAData?.phone, label: "Phone Number" },
                totp: {
                    value: MFAData?.mfaMethods?.find((method) => method?.mfa_type === "totp")?.mfa_secret,
                    label: "Time-based OTP",
                }
            })
        }
    }, [MFAData])

    useEffect(() => {
        if (MFADataError) {
            toast.error("Failed to fetch MFA data")
        }
    }, [MFADataError])

    const renderMFAStatus = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                {/* <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Enabled</span> */}
                <Badge variant="success">Enabled</Badge>
            </div>
            {MFAData?.mfaMethods
                ?.filter((method) => method.is_enabled)
                ?.map((method) => (
                    <div key={method.mfa_type} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                            {getMFAIcon(method.mfa_type)}
                            <div>
                                <span className="text-sm font-medium">{mfaInfo?.[method.mfa_type]?.label}</span>
                                <p className="text-xs text">{mfaInfo?.[method.mfa_type]?.value}</p>
                            </div>
                        </div>
                        <Button variant="destructive" size="icon" className="size-8" onClick={() => handleDeleteMFA(method.mfa_type)}>
                            <Trash2 className="size-3" />
                        </Button>
                    </div>
                ))}
        </div>
    )

    const renderMFAForm = () => (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {!MFAData.is_mfa && (
                    <FormField
                        control={form.control}
                        name="is_mfa"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                                <FormLabel className="text-sm font-medium">Enable Multi-Factor Authentication</FormLabel>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                            field.onChange(checked)
                                            if (!checked) {
                                                setOtpSent(false)
                                            }
                                        }}
                                        disabled={updateUserMFAMutation.isPending || MFAData?.is_mfa}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}
                {form.watch("is_mfa") && (
                    <FormField
                        control={form.control}
                        name="mfa_type"
                        render={({ field }) => (
                            <FormItem>
                                <Tabs
                                    value={field.value}
                                    onValueChange={(value) => {
                                        field.onChange(value)
                                    }}
                                >
                                    <TabsList className={cn("grid w-full grid-cols-3")}>
                                        {["email_otp", "phone_otp", "totp"].map((type) => (
                                            <TabsTrigger
                                                key={type}
                                                value={type}
                                                className={`flex items-center justify-center ${isEditMode && MFAData?.mfaMethods?.find((m) => m.mfa_type === type && m.is_enabled) && ""}`}
                                            >
                                                {getMFAIcon(type)}
                                                <span className="ml-2">
                                                    {type.split("_")[0].charAt(0).toUpperCase() + type.split("_")[0].slice(1)}
                                                </span>
                                            </TabsTrigger>
                                        ))}
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
                                        <FormField
                                            control={form.control}
                                            name="totp_secret"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Totp secret</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Totp secret" {...field} disabled />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {MFAData?.mfaMethods?.find((mfa) => mfa.mfa_type === "totp")?.secretUrl && (
                                            <div className="mt-4 flex flex-col items-center justify-center">
                                                <p className="mb-2 text-sm text-muted-foreground">
                                                    Scan the QR code below with your authenticator app.
                                                </p>
                                                <QRCodeSVG value={MFAData?.mfaMethods?.find((mfa) => mfa.mfa_type === "totp")?.secretUrl} />,
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </FormItem>
                        )}
                    />
                )}
                {!otpSent && form.watch("is_mfa") && (
                    <Button type="submit" disabled={updateUserMFAMutation.isPending} className="w-full mt-4">
                        {MFAData?.mfaMethods?.find((m) => m.mfa_type === form.watch('mfa_type'))?.is_enabled
                            ? "Disable"
                            : "Enable"}
                    </Button>
                )}
                {otpSent && form.watch("is_mfa") && (
                    <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Enter OTP</FormLabel>
                                <FormControl>
                                    <OtpInput {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                {otpSent && form.watch("is_mfa") && (
                    <Button type="submit" disabled={updateUserMFAMutation.isPending} className="w-full">
                        {updateUserMFAMutation.isPending ? "Verifying..." : "Verify OTP"}
                    </Button>
                )}
                {form.watch("is_mfa") && (
                    <Button
                        type="button"
                        variant="outline"
                        disabled={updateUserMFAMutation.isPending}
                        onClick={() => setIsEditMode(false)}
                        className="w-full mt-4"
                    >
                        Cancel
                    </Button>
                )}
            </form>
        </Form >
    )

    return (
        <Card className="w-full max-w-md mx-auto mt-10 border shadow-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Multi-Factor Authentication</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Enhance your account security with MFA</CardDescription>
            </CardHeader>
            {isMFADataLoading ? (
                <div className="text-center">Loading...</div>
            ) : MFAData?.is_mfa && !isEditMode ? (
                <>
                    <CardContent>{renderMFAStatus()}</CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => setIsEditMode(true)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Change MFA Settings
                        </Button>
                    </CardFooter>
                </>
            ) : (
                <CardContent>{renderMFAForm()}</CardContent>
            )}
        </Card>
    )
}
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
export default MFAForm

