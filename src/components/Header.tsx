'use client';

import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getPlaceholderImage } from '@/lib/placeholder-images';

const Header = () => {
    const trainerAvatar = getPlaceholderImage('trainer-avatar');

    return (
        <header className="flex h-16 items-center justify-between bg-header-background px-6 text-header-foreground">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <svg
                        className="h-8 w-8"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path
                            d="M12 2L2 22H22L12 2Z"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span className="text-lg font-bold tracking-wider">ALPHA TRAINER</span>
                </div>
            </div>
            <div className="flex flex-1 justify-end items-center gap-4">
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Pesquisar..."
                        className="w-full rounded-full border-0 bg-white pl-10 text-black placeholder:text-gray-500"
                    />
                </div>
                <button className="relative rounded-full p-2 hover:bg-white/10">
                    <Bell className="h-6 w-6" />
                </button>
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                        <Avatar className="h-9 w-9">
                            {trainerAvatar?.imageUrl && <AvatarImage src={trainerAvatar.imageUrl} alt="Trainer" />}
                            <AvatarFallback>AT</AvatarFallback>
                        </Avatar>
                        <div className="text-left text-sm">
                            <p>Marcelo Pr...</p>
                            <p className="text-xs text-gray-400">ID: 1B</p>
                        </div>
                        <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Perfil</DropdownMenuItem>
                        <DropdownMenuItem>Configurações</DropdownMenuItem>
                        <DropdownMenuItem>Sair</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default Header;
