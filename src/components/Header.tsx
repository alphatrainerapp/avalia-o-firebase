'use client';

import React from 'react';
import { Search, Bell, ChevronDown, Github } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import Image from 'next/image';
import { SidebarTrigger } from '@/components/ui/sidebar';

const Header = () => {
    const trainerAvatar = getPlaceholderImage('trainer-avatar');
    const logo = getPlaceholderImage('alpha-trainer-logo');

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-header-background px-4 text-header-foreground md:px-6">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="text-white hover:bg-white/10" />
                <div className="hidden items-center gap-4 md:flex">
                    {logo && (
                        <Image
                            src={logo.imageUrl}
                            alt="Alpha Trainer Logo"
                            width={120}
                            height={32}
                            className="object-contain"
                            data-ai-hint={logo.imageHint}
                        />
                    )}
                </div>
            </div>
            
            <div className="flex flex-1 justify-end items-center gap-4">
                <div className="relative hidden w-full max-w-xs sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Pesquisar..."
                        className="h-9 w-full rounded-full border-0 bg-white pl-9 text-black placeholder:text-gray-500"
                    />
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2">
                    <a 
                        href="https://github.com/alphatrainerapp/avalia-o-firebase" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        title="Ver no GitHub"
                    >
                        <Github className="size-5" />
                    </a>

                    <button className="relative rounded-full p-2 hover:bg-white/10">
                        <Bell className="size-5" />
                    </button>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                            <Avatar className="h-8 w-8">
                                {trainerAvatar?.imageUrl && <AvatarImage src={trainerAvatar.imageUrl} alt="Trainer" />}
                                <AvatarFallback>AT</AvatarFallback>
                            </Avatar>
                            <div className="hidden text-left text-sm md:block leading-tight">
                                <p className="font-medium">Marcelo P.</p>
                                <p className="text-[10px] text-gray-400">ID: 1B</p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Perfil</DropdownMenuItem>
                            <DropdownMenuItem>Configurações</DropdownMenuItem>
                            <DropdownMenuItem>Sair</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default Header;
