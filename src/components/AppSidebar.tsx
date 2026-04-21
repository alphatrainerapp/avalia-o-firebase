'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    Users, 
    Settings, 
    LogOut,
    Activity,
    Wind,
    User,
    BarChart3
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getPlaceholderImage } from '@/lib/placeholder-images';

const AppSidebar = () => {
    const pathname = usePathname();
    const trainerAvatar = getPlaceholderImage('trainer-avatar');

    const menuItems = [
        { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { title: 'Alunos', icon: Users, href: '/alunos' },
    ];

    const evaluationItems = [
        { title: 'Bioimpedância', icon: BarChart3, href: '/bioimpedance' },
        { title: 'Postural', icon: User, href: '/postural' },
        { title: 'VO2max', icon: Wind, href: '/vo2max' },
    ];

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="h-16 flex items-center justify-center border-b">
                <div className="flex items-center gap-2 px-4">
                    <Activity className="size-6 text-primary" />
                    <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">Alpha Insights</span>
                </div>
            </SidebarHeader>
            
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={pathname === item.href}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Avaliações</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {evaluationItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={pathname === item.href}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:hidden">
                            <Avatar className="size-8">
                                <AvatarImage src={trainerAvatar?.imageUrl} />
                                <AvatarFallback>MP</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col overflow-hidden text-sm">
                                <span className="font-medium truncate">Marcelo Prado</span>
                                <span className="text-xs text-muted-foreground truncate">Treinador</span>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Sair">
                            <LogOut />
                            <span>Sair</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;
