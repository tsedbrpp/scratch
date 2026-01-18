"use client";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 gap-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Join Instant TEA</h1>
                <p className="text-emerald-600 font-medium">✨ Sign up now and get 5 FREE credits!</p>
            </div>
            <SignUp />
        </div>
    );
}
