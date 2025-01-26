import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyMagicLink } from '../../services/authServices';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';

const MagicLink = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const { data: magicLinkData, isLoading: isMagicLinkDataLoading, error: magicLinkError } = useQuery({
        queryKey: ['magicLink', token],
        queryFn: async () => {
            const res = await verifyMagicLink(token);
            return res.data;
        },
        retry: false
    });

    useEffect(() => {
        if (magicLinkData && magicLinkData?.success) {
            toast.success(magicLinkData?.message || "Magic link verified successfully");
            navigate('/');
        }
    }, [magicLinkData, navigate]);


    useEffect(() => {
        if (magicLinkError) {
            toast.error(magicLinkError?.response?.data?.message || "Magic link could not be verified");
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        }
    }, [magicLinkError, navigate])

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            {isMagicLinkDataLoading ? <div className="">verifying</div> : null}
        </div>
    );
};

export default MagicLink;