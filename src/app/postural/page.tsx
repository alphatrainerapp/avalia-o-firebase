'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, UploadCloud, Save, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePosturalContext } from './context';

type PhotoType = 'front' | 'back' | 'right' | 'left';

export default function PosturalPage() {
    const { photos, setPhoto, clearDeviations } = usePosturalContext();
    const fileInputRefs = {
        front: useRef<HTMLInputElement>(null),
        back: useRef<HTMLInputElement>(null),
        right: useRef<HTMLInputElement>(null),
        left: useRef<HTMLInputElement>(null),
    };
    const { toast } = useToast();
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('pt-BR'));
        // Clear previous analysis data when starting a new one
        clearDeviations();
    }, [clearDeviations]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: PhotoType) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string;
                setPhoto(type, imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = (type: PhotoType) => {
        fileInputRefs[type].current?.click();
    };

    const handleSave = () => {
        // Logic to save the photos
        console.log('Saving photos:', photos);
        toast({
            title: 'Fotos Salvas',
            description: 'As fotos da avaliação postural foram salvas com sucesso.',
        });
    };

    const PhotoUploadCard = ({ type, title }: { type: PhotoType, title: string }) => (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-center text-lg font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    className={cn(
                        'w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors',
                        { 'border-primary': photos[type] }
                    )}
                    onClick={() => triggerFileInput(type)}
                >
                    <Input
                        type="file"
                        accept="image/*"
                        ref={fileInputRefs[type]}
                        onChange={(e) => handlePhotoUpload(e, type)}
                        className="hidden"
                    />
                    {photos[type] ? (
                        <Image src={photos[type]!} alt={`${title} preview`} width={200} height={256} className="h-full w-auto object-contain rounded-md" />
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <UploadCloud className="mx-auto h-12 w-12" />
                            <p>Clique para adicionar/modificar</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex flex-wrap items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard"><Button variant="outline" size="icon"><ArrowLeft /></Button></Link>
                    <User className="size-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Avaliação Postural</h1>
                        <p className="text-muted-foreground">Data: {currentDate}</p>
                    </div>
                </div>
                 <p className="text-sm font-semibold text-primary uppercase">UPLOAD / AVALIAÇÃO / RESUMO</p>
            </header>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload de Fotos</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PhotoUploadCard type="front" title="Foto Frente" />
                        <PhotoUploadCard type="back" title="Foto Costas" />
                        <PhotoUploadCard type="right" title="Foto Lado Direito" />
                        <PhotoUploadCard type="left" title="Foto Lado Esquerdo" />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button onClick={handleSave} className="bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                        <Save className="mr-2" />
                        Salvar
                    </Button>
                    <Link href="/postural/analysis">
                        <Button variant="outline">
                            Próximo
                            <ArrowRight className="ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
