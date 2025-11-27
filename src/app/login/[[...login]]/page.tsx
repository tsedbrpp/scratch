import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <SignIn path="/login" />
        </div>
    );
}
