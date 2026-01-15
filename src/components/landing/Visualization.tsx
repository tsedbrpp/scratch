"use client";

import React from "react";

export function Visualization() {
    return (
        <div className="py-24 bg-slate-900 border-y border-slate-800">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center mb-12">
                    <h2 className="text-base font-semibold leading-7 text-emerald-400">Visualization</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Mapping the Assemblage
                    </p>
                    <p className="mt-4 text-lg text-slate-400">
                        Navigate fully interactive 3D and 2D graphs with clickable nodes and links to reveal hidden connections.
                    </p>
                </div>
                <div className="relative aspect-[16/9] w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                    <video
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                    >
                        <source src="/Video Project 1.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
