import { Avatar, AvatarImage } from "../ui/avatar"

const DashboardSvg = () => {
    return (
        <Avatar className="tw-w-6 tw-h-6 tw-rounded-none">
            <AvatarImage src={`/svgs/dashboard.svg`} />
        </Avatar>
    )
}

export default DashboardSvg