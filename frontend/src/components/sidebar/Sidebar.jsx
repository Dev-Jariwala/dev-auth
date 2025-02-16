/* eslint-disable react/prop-types */
import * as React from "react"
import { ChevronRight, Fingerprint, KeyRound, LayoutDashboard, ListTodo, MessageCircle } from 'lucide-react';
import { Sidebar as SidebarComponent, SidebarContent, SidebarGroup, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, } from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger, } from "@/components/ui/collapsible"
import { Link, Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/sidebar/Navbar";
import { cn } from "@/lib/utils";

const data = {
    navMain: [
        {
            title: 'Dashboard',
            icon: LayoutDashboard,
            className: 'text-pink-500',
            link: '/',
            isCollapsible: false,
        },
        {
            title: 'MFA',
            icon: Fingerprint,
            className: 'text-indigo-500',
            link: '/mfa',
            isCollapsible: false,
        },
        {
            title: 'Security',
            icon: KeyRound,
            className: 'text-orange-500',
            link: '/security',
            isCollapsible: false,
        },
        {
            title: 'Todos',
            icon: ListTodo,
            className: 'text-green-500',
            link: '/todo',
            isCollapsible: false,
        },
        {
            title: 'Chats',
            icon: MessageCircle,
            className: 'text-purple-500',
            link: '/chats',
            isCollapsible: false,
        },
    ]
}

const Sidebar = () => {

    const location = useLocation()

    const isActive = (link) => {
        return location.pathname.split('/')[1] === link.split('/')[1]
    }

    const isActiveSubMenu = (link) => {
        return location.pathname.split('/')[2] === link.split('/')[2]
    }

    return (
        <SidebarProvider>
            <SidebarComponent className='shadow-xl' collapsible="icon" style={{ fontFamily: 'Nunito, "Segoe UI", arial' }} >
                <SidebarHeader className="mb-3">
                    <SidebarMenu>
                        <SidebarMenuItem asChild>
                            <Link className="flex items-center justify-center gap-1 rounded-lg h-12 cursor-pointer">
                                <div className="group-data-[collapsible=icon]:hidden">
                                    <div className={`font-semibold text-2xl`}>Dev Auth</div>
                                </div>
                            </Link>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu className="space-y-2">
                            {data.navMain.map((item) => (
                                <React.Fragment key={item.title}>
                                    {item.isCollapsible ? (
                                        <Collapsible asChild defaultOpen={isActive(item.link)} className="group/collapsible">
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton tooltip={item.title} isActive={isActive(item.link)}>
                                                        {item.icon && <item.icon />}
                                                        <span>{item.title}</span>
                                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.items?.map((subItem) => (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton asChild isActive={isActiveSubMenu(subItem.link)} aria-disabled={subItem.isDisabled}>
                                                                    <Link className="no-underline" to={subItem.link}>
                                                                        <span>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    ) : (
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive(item.link)}
                                                tooltip={item.title}
                                            >
                                                <Link className={cn("no-underline text-inherit !h-10", isActive(item.link) ? '!bg-primary !text-primary-foreground' : 'hover:!bg-primary/10')} to={item.link}>
                                                    <span className="mx-1">
                                                        {item.icon && <item.icon className={item.className} />}
                                                    </span>
                                                    <span className=" animate-fade animate-duration-300">{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )}
                                </React.Fragment>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarRail />
            </SidebarComponent>
            <SidebarInset className='flex flex-col relative w-full h-[100dvh] overflow-hidden'>
                <Navbar />
                <main className=" flex-1 overflow-y-auto h-[calc(100dvh-4rem)]">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default Sidebar