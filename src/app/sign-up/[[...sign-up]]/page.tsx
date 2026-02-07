"use client";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 gap-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Join Instant TEA</h1>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mb-2">
                    Limited Time Promotion
                </div>
                <p className="text-emerald-600 font-medium">✨ Signup to receive a one time bonus of 100 credits</p>
            </div>
            <SignUp />
        </div>
    );
}
