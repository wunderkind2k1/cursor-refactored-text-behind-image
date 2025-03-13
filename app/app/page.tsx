// app/app/page.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { useUser } from '@/hooks/useUser';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';
import { Accordion } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModeToggle } from '@/components/mode-toggle';
import TextCustomizer from '@/components/editor/text-customizer';

import { PlusIcon, ReloadIcon } from '@radix-ui/react-icons';

import { removeBackground } from "@imgly/background-removal";

import '@/app/fonts.css';
import AppAds from '@/components/editor/app-ads';
import FirecrawlAd from '@/ads/firecrawl';

const Page = () => {
    const { user, profile } = useUser();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isImageSetupDone, setIsImageSetupDone] = useState<boolean>(false);
    const [removedBgImageUrl, setRemovedBgImageUrl] = useState<string | null>(null);
    const [textSets, setTextSets] = useState<Array<any>>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleUploadImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            await setupImage(imageUrl);
        }
    };

    const setupImage = async (imageUrl: string) => {
        try {
            const imageBlob = await removeBackground(imageUrl);
            const url = URL.createObjectURL(imageBlob);
            setRemovedBgImageUrl(url);
            setIsImageSetupDone(true);
        } catch (error) {
            console.error(error);
        }
    };

    const addNewTextSet = () => {
        const newId = Math.max(...textSets.map(set => set.id), 0) + 1;
        setTextSets(prev => [...prev, {
            id: newId,
            text: 'edit',
            fontFamily: 'Inter',
            top: 0,
            left: 0,
            color: 'white',
            fontSize: 200,
            fontWeight: 800,
            opacity: 1,
            shadowColor: 'rgba(0, 0, 0, 0.8)',
            shadowSize: 4,
            rotation: 0,
            tiltX: 0,
            tiltY: 0
        }]);
    };

    const handleAttributeChange = (id: number, attribute: string, value: any) => {
        setTextSets(prev => prev.map(set =>
            set.id === id ? { ...set, [attribute]: value } : set
        ));
    };

    const duplicateTextSet = (textSet: any) => {
        const newId = Math.max(...textSets.map(set => set.id), 0) + 1;
        setTextSets(prev => [...prev, { ...textSet, id: newId }]);
    };

    const removeTextSet = (id: number) => {
        setTextSets(prev => prev.filter(set => set.id !== id));
    };

    const renderTextOnCanvas = () => {
        if (!canvasRef.current || !selectedImage) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bgImg = new (window as any).Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;

            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

            textSets.forEach(textSet => {
                ctx.save();

                // Set up text properties
                ctx.font = `${textSet.fontWeight} ${textSet.fontSize * 3}px ${textSet.fontFamily}`;
                ctx.fillStyle = textSet.color;
                ctx.globalAlpha = textSet.opacity;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const x = canvas.width * (textSet.left + 50) / 100;
                const y = canvas.height * (50 - textSet.top) / 100;

                // Move to position first
                ctx.translate(x, y);

                // Apply 3D transforms
                const tiltXRad = (-textSet.tiltX * Math.PI) / 180;
                const tiltYRad = (-textSet.tiltY * Math.PI) / 180;

                // Use a simpler transform that maintains the visual tilt
                ctx.transform(
                    Math.cos(tiltYRad),          // Horizontal scaling
                    Math.sin(0),          // Vertical skewing
                    -Math.sin(0),         // Horizontal skewing
                    Math.cos(tiltXRad),          // Vertical scaling
                    0,                           // Horizontal translation
                    0                            // Vertical translation
                );

                // Apply rotation last
                ctx.rotate((textSet.rotation * Math.PI) / 180);

                // Draw text at transformed position
                ctx.fillText(textSet.text, 0, 0);
                ctx.restore();
            });
        };
        bgImg.src = selectedImage;
    };

    // Add useEffect to re-render text when textSets changes
    useEffect(() => {
        renderTextOnCanvas();
    }, [textSets, selectedImage]);

    const saveCompositeImage = () => {
        if (!canvasRef.current || !isImageSetupDone) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bgImg = new (window as any).Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;

            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

            textSets.forEach(textSet => {
                ctx.save();

                // Set up text properties
                ctx.font = `${textSet.fontWeight} ${textSet.fontSize * 3}px ${textSet.fontFamily}`;
                ctx.fillStyle = textSet.color;
                ctx.globalAlpha = textSet.opacity;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const x = canvas.width * (textSet.left + 50) / 100;
                const y = canvas.height * (50 - textSet.top) / 100;

                // Move to position first
                ctx.translate(x, y);

                // Apply 3D transforms
                const tiltXRad = (-textSet.tiltX * Math.PI) / 180;
                const tiltYRad = (-textSet.tiltY * Math.PI) / 180;

                // Use a simpler transform that maintains the visual tilt
                ctx.transform(
                    Math.cos(tiltYRad),          // Horizontal scaling
                    Math.sin(0),          // Vertical skewing
                    -Math.sin(0),         // Horizontal skewing
                    Math.cos(tiltXRad),          // Vertical scaling
                    0,                           // Horizontal translation
                    0                            // Vertical translation
                );

                // Apply rotation last
                ctx.rotate((textSet.rotation * Math.PI) / 180);

                // Draw text at transformed position
                ctx.fillText(textSet.text, 0, 0);
                ctx.restore();
            });

            if (removedBgImageUrl) {
                const removedBgImg = new (window as any).Image();
                removedBgImg.crossOrigin = "anonymous";
                removedBgImg.onload = () => {
                    ctx.drawImage(removedBgImg, 0, 0, canvas.width, canvas.height);
                    triggerDownload();
                };
                removedBgImg.src = removedBgImageUrl;
            } else {
                triggerDownload();
            }
        };
        bgImg.src = selectedImage || '';

        function triggerDownload() {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'text-behind-image.png';
            link.href = dataUrl;
            link.click();
        }
    };

    return (
        <>
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1609710199882100" crossOrigin="anonymous"></script>
            <div className='flex flex-col h-screen'>
                <FirecrawlAd />
                <header className='flex flex-row items-center justify-between p-5 px-10'>
                    <h2 className="text-4xl md:text-2xl font-semibold tracking-tight">
                        <span className="block md:hidden">TBI</span>
                        <span className="hidden md:block">Text behind image editor</span>
                    </h2>
                    <div className='flex gap-4 items-center'>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            accept=".jpg, .jpeg, .png"
                        />
                        <div className='flex items-center gap-5'>
                            <ModeToggle />
                        </div>
                    </div>
                </header>
                <main className='flex-1 flex flex-col md:flex-row p-5 gap-5'>
                    <div className='flex-1 flex flex-col gap-5'>
                        <div className='flex-1 relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden'>
                            {selectedImage ? (
                                <>
                                    <Image
                                        src={selectedImage}
                                        alt="Selected"
                                        fill
                                        className="object-contain"
                                    />
                                    <canvas
                                        ref={canvasRef}
                                        className="absolute inset-0 w-full h-full"
                                        style={{ pointerEvents: 'none' }}
                                    />
                                </>
                            ) : (
                                <div className='flex items-center justify-center h-full'>
                                    <Button onClick={handleUploadImage} className='flex items-center gap-2'>
                                        <PlusIcon />
                                        Upload Image
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='w-full md:w-80 flex flex-col gap-5'>
                        <ScrollArea className='flex-1'>
                            <Accordion type="single" collapsible className="w-full">
                                {textSets.map((textSet) => (
                                    <TextCustomizer
                                        key={textSet.id}
                                        textSet={textSet}
                                        onAttributeChange={handleAttributeChange}
                                        removeTextSet={removeTextSet}
                                        duplicateTextSet={duplicateTextSet}
                                    />
                                ))}
                            </Accordion>
                        </ScrollArea>
                        <div className='flex flex-col gap-2'>
                            <Button onClick={addNewTextSet} className='w-full'>
                                Add Text
                            </Button>
                            <Button onClick={saveCompositeImage} className='w-full' disabled={!isImageSetupDone}>
                                Download Image
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default Page;
