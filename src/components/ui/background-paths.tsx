"use client";

import { motion } from "framer-motion";
import { Button } from "@/src/components/ui/button";

interface FloatingPathsProps {
    position: number;
}

function FloatingPaths({ position }: FloatingPathsProps) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        color: `rgba(15,23,42,${0.1 + i * 0.03})`,
        width: 0.5 + i * 0.03,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <svg
                className="w-full h-full text-slate-900 dark:text-neutral-50"
                viewBox="0 0 696 316"
                fill="none"
                preserveAspectRatio="none"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <motion.path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={0.1 + path.id * 0.005}
                        initial={{ pathLength: 0.3, opacity: 0.6 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0.3, 0.6, 0.3],
                            pathOffset: [0, 1, 0],
                        }}
                        transition={{
                            duration: 25 + Math.random() * 15,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

export function BackgroundPaths({
    title = "Stone AI",
    subtitle = "Sleek. Intellectual. Durably Structured.",
    onStart,
}: {
    title?: string;
    subtitle?: string;
    onStart?: () => void;
}) {
    const words = title.split(" ");

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#F2F2EB] text-[#2C2C28]">
            <div className="absolute inset-0">
                <FloatingPaths position={1} />
                <FloatingPaths position={-1} />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                    className="max-w-4xl mx-auto flex flex-col items-center justify-center"
                >
                    <h1 className="text-6xl sm:text-8xl md:text-9xl font-serif italic font-bold mb-6 tracking-tight text-[#4A4A40]">
                        {words.map((word, wordIndex) => (
                            <span
                                key={wordIndex}
                                className="inline-block mr-4 last:mr-0 animate-fade-in"
                            >
                                {word}
                            </span>
                        ))}
                    </h1>

                    <p className="text-lg md:text-xl text-[#6B6B5E] max-w-lg mb-10 uppercase tracking-widest font-mono text-xs">
                        {subtitle}
                    </p>

                    <div
                        className="inline-block group relative p-px rounded-full backdrop-blur-lg 
                        overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                        <Button
                            variant="ghost"
                            onClick={onStart}
                            className="rounded-full px-8 py-6 text-lg font-medium backdrop-blur-md 
                            bg-[#E5E5DC] hover:bg-[#D6D6CC] border border-[#D6D6CC]
                            text-[#2C2C28] transition-all duration-300 
                            group-hover:-translate-y-0.5
                            hover:shadow-sm cursor-pointer"
                        >
                            <span className="opacity-95 group-hover:opacity-100 transition-opacity font-bold">
                                Enter Workspace
                            </span>
                            <span
                                className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                transition-all duration-300 text-[#6B705C]"
                            >
                                →
                            </span>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
