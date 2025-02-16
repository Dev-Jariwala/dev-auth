/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { Button } from '../ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useQuery } from '@tanstack/react-query'
import { Eye, Laptop, MapPin, Smartphone, Tablet } from 'lucide-react'
import { Badge } from '../ui/badge'
import { UAParser } from 'ua-parser-js'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'react-toastify'

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog"
import { getUserSessions } from '../../services/authServices'

const parseUserAgent = (userAgent) => {

    let deviceType;
    // Detect device type
    if (userAgent?.includes("Mobi")) {
        deviceType = "Mobile";
    } else if (userAgent?.includes("Tablet")) {
        deviceType = "Tablet";
    } else {
        deviceType = "Desktop";
    }

    return { deviceType };
};
const getDeviceIcon = (deviceType) => {

    switch (deviceType?.toLowerCase()) {
        case 'desktop': return <Laptop className="w-6 h-6" />;
        case 'mobile': return <Smartphone className="w-6 h-6" />;
        case 'tablet': return <Tablet className="w-6 h-6" />;
        default: return <Laptop className="w-6 h-6" />;
    }
};
const Security = () => {
    const session_id = '';
    const [showAllDevices, setShowAllDevices] = useState(false);
    const [showAlert, setShowAlert] = useState({ status: false, type: null, data: null });

    const { data: devices, isLoading, error } = useQuery({
        queryKey: ['devices'],
        queryFn: async () => {
            try {
                const response = await getUserSessions();
                const devices = response.data?.result || [];

                // Sort devices: active (status 1) first, then inactive
                const sortedDevices = devices.sort((a, b) => {
                    if (a.revoked === 1 && b.revoked !== 1) return -1;
                    if (a.revoked !== 1 && b.revoked === 1) return 1;
                    return 0;
                });

                return sortedDevices;
            } catch (error) {
                console.error('Error fetching devices:', error)
                throw error
            }
        }
    });
    console.log(devices);
    useEffect(() => {
        if (error) {
            toast.error(`Error fetching devices: ${JSON.stringify(error)}`);
        }
    }, [error])
    if (isLoading) {
        return <p>Loading...</p>
    }
    return (
        <>
            <div className="w-full mx-auto px-0">
                <div className="w-full py-4 ">
                    <div className="px-5 py-2 flex justify-between items-center">
                        <h4 className="mb-0">Security</h4>
                    </div>
                    <div className="grid gap-6 px-4">
                        <Card className="border">
                            <CardContent className='p-6'>

                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-semibold">Password</h2>
                                        <p className="text-sm m-0 text-gray-500">Last changed : {formatDistanceToNow(new Date(Date.now()), { addSuffix: true })}</p>
                                    </div>
                                    <Button className='px-8 py-2 font-semibold' intent="emerald">Change Password</Button>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border">
                            <CardHeader className='p-6 border-b'>
                                <CardTitle className=''>Allowed IP Address</CardTitle>
                                <CardDescription className="text-sm text-gray-500">
                                    Restrict access to your account by adding a range of trusted IP addresses.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='p-6'>
                                <div className='flex items-center flex-col justify-center p-2 gap-4'>
                                    <img
                                        alt="Geo-fencing illustration"
                                        className="w-24 h-w-24"
                                        height="150"
                                        src="https://static.zohocdn.com/iam/v2/components/images/IPAddress.7d056985c6e3b29914f93ce8d727b1b3.png"
                                        style={{
                                            aspectRatio: "150/150",
                                            objectFit: "cover",
                                        }}
                                        width="150"
                                    />
                                    <Button className='px-8 py-2 font-semibold' intent="emerald">Add Allowed IP Address</Button>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border">
                            <CardHeader className="p-6 border-b flex-row justify-between items-center">
                                <div>
                                    <CardTitle className="">Device Sign-ins</CardTitle>
                                    <CardDescription className=" mt-1">
                                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                                        View and manage the list of locations where you've signed in on your devices.
                                    </CardDescription>
                                </div>
                                <AlertDialog onOpenChange={(value) => setShowAlert({ status: value, type: value ? 'signout-others' : null })} open={showAlert.status && showAlert.type === 'signout-others'}>
                                    <Button onClick={() => setShowAlert({ status: true, type: 'signout-others' })} className="px-6 py-2 font-semibold h-fit" color="red"  >
                                        Sign out all other devices
                                    </Button>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Sign out from all other devices
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <Button variant="destructive" >Sign Out</Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                            </CardHeader>
                            <CardContent className="p-6">
                                <div className=" space-y-3">
                                    {showAllDevices ? devices?.map((device) => (
                                        <DeviceCard
                                            key={device?.refresh_token_id}
                                            device={device}
                                            isCurrentDevice={session_id === device.refresh_token_id}
                                        />
                                    )) : devices?.filter(d => !d.revoked)?.map((device) => (
                                        <DeviceCard
                                            key={device?.refresh_token_id}
                                            device={device}
                                            isCurrentDevice={session_id === device.refresh_token_id}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center justify-center mt-5">
                                    <Button onClick={() => setShowAllDevices(prev => !prev)} variant="secondary" size="sm" className="flex items-center space-x-2 text-blue-500 bg-gray-50 border border-blue-400 hover:!bg-gray-100" >
                                        <Eye size={16} />
                                        <span className='text-xs'>{showAllDevices ? "View less" : "View more"}</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </>
    )
}
const DeviceCard = ({ device, isCurrentDevice, onOpenModal }) => {
    console.log(device);
    const parser = new UAParser(device?.user_agent || "");
    const { deviceType } = parseUserAgent(device?.user_agent);
    const getBadgeColor = (revoked) => {
        if (isCurrentDevice) return '!bg-green-100 !text-green-800';
        if (revoked) return '!bg-red-100 !text-red-800';
        return '!bg-blue-100 !text-blue-800';
    };
    return (
        <Card className=" transition-all duration-300 hover:shadow-md hover:bg-secondary">
            <CardContent className="p-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => onOpenModal(device)}>
                    <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={device?.avatar || ''} />
                            <AvatarFallback className="flex items-center justify-center text-white bg-blue-500">
                                {getDeviceIcon(deviceType)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium ">{deviceType} ({parser.getOS()?.name} {parser.getOS()?.version})</p>
                            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <span>{parser.getBrowser()?.name || "-"}</span>
                                <span>•</span>
                                <span>{formatDistanceToNow(new Date(device?.created_at), { addSuffix: true })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                        <Badge className={`px-2 py-1 ${getBadgeColor(device?.revoked)}`}>
                            {isCurrentDevice ? 'Current Device' : !device?.revoked ? 'Active' : 'Signed Out'}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{device?.location || 'Unknown location'}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default Security